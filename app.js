/**
 * 销售沟通助手 - 应用逻辑 v3.0
 * 升级：CRM客户档案视图 + 智能记忆卡片 + 沟通时间线
 * 一个客户 = 一个独立档案页面，所有分析沉淀到同一档案
 */

// ===== State =====
const state = {
    mode: 'chat',
    isAnalyzing: false,
    history: JSON.parse(localStorage.getItem('salesHistory') || '[]'),
    currentResult: '',
    customers: JSON.parse(localStorage.getItem('salesCustomers') || '[]'),
    currentCustomerId: null,
    isFollowUpMode: false,
    currentProfileId: null
};

// ===== API Config =====
const API_CONFIGS = {
    deepseek: { baseUrl: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat', name: 'Deepseek' },
    openai: { baseUrl: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini', name: 'OpenAI' },
    custom: { baseUrl: '', model: '', name: 'Custom' }
};

function getApiConfig() {
    if (window.CONFIG && window.CONFIG.DEFAULT_API_KEY) {
        return {
            apiKey: window.CONFIG.DEFAULT_API_KEY,
            baseUrl: window.CONFIG.API.BASE_URL,
            model: window.CONFIG.API.MODEL,
            isTeam: true
        };
    }
    if (window.TEAM_CONFIG && window.TEAM_CONFIG.apiKey) {
        return {
            apiKey: window.TEAM_CONFIG.apiKey,
            baseUrl: window.TEAM_CONFIG.baseUrl || 'https://api.deepseek.com/v1/chat/completions',
            model: window.TEAM_CONFIG.model || 'deepseek-chat',
            isTeam: true
        };
    }
    const provider = localStorage.getItem('apiProvider') || 'deepseek';
    const config = { ...API_CONFIGS[provider] };
    const savedUrl = localStorage.getItem('apiBaseUrl');
    const savedModel = localStorage.getItem('apiModel');
    if (savedUrl) config.baseUrl = savedUrl;
    if (savedModel) config.model = savedModel;
    config.apiKey = localStorage.getItem('apiKey') || '';
    config.isTeam = false;
    return config;
}

function hasApiKey() {
    return !!getApiConfig().apiKey;
}

// ===== DOM Helpers =====
const $ = (id) => document.getElementById(id);

function showToast(msg, duration) {
    duration = duration || 2000;
    const toast = $('toast');
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, duration);
}

// Clear all input fields (chat record, sales notes, focus question, focus tags)
function clearInputs() {
    if (chatInput) {
        chatInput.value = '';
        charCount.textContent = '0 字';
        analyzeBtn.disabled = true;
    }
    const notesEl = $('salesNotesInput');
    if (notesEl) notesEl.value = '';
    const focusEl = $('focusInput');
    if (focusEl) focusEl.value = '';
    document.querySelectorAll('.focus-tag.active').forEach(tag => tag.classList.remove('active'));
}

// ===== View Management =====
function setView(view) {
    $('emptyState').style.display = 'none';
    $('loadingState').style.display = 'none';
    $('resultsContainer').style.display = 'none';
    const pc = $('profileContainer');
    if (pc) pc.style.display = 'none';
    if (view === 'empty') $('emptyState').style.display = 'flex';
    else if (view === 'loading') $('loadingState').style.display = 'flex';
    else if (view === 'analysis') $('resultsContainer').style.display = 'block';
    else if (view === 'profile' && pc) pc.style.display = 'block';
}

// ===== Customer Profile Management =====
const CUSTOMERS_KEY = 'salesCustomers';

function getCustomers() {
    return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
}

function saveCustomers(customers) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    state.customers = customers;
}

function saveCustomer(customer) {
    const customers = getCustomers();
    const idx = customers.findIndex(c => c.id === customer.id);
    if (idx >= 0) customers[idx] = customer;
    else customers.unshift(customer);
    saveCustomers(customers);
}

function deleteCustomer(id) {
    const customers = getCustomers().filter(c => c.id !== id);
    saveCustomers(customers);
}

function getCustomer(id) {
    return getCustomers().find(c => c.id === id);
}

function generateCustomerId() {
    return 'c_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
}

// ===== Card Sections Definition =====
const CARD_SECTIONS = [
    { title: 'Basic Info', titleCn: '基本信息', fields: ['客户名称', '公司', '国家/地区', '行业', '产品需求', '客户身份'] },
    { title: 'Needs', titleCn: '需求分析', fields: ['客户想解决的问题', '核心需求', '关注因素'] },
    { title: 'Psychology', titleCn: '心理画像', fields: ['客户类型', '客户当前心理', '客户最大顾虑', '客户信任程度', '客户购买意愿'] },
    { title: 'Stage', titleCn: '销售阶段', fields: ['当前阶段', '距离成交'] },
    { title: 'History', titleCn: '历史沟通总结', fields: ['过去发生了什么', '客户提出过哪些问题', '客户拒绝过什么', '销售已经做过什么动作', '哪些方法有效', '哪些方法无效'] },
    { title: 'Changes', titleCn: '最新变化', fields: ['相比上次', '客户心理变化', '客户态度变化', '新增需求', '新增风险', '成交机会变化'] },
    { title: 'Next Action', titleCn: '下一步行动建议', fields: ['第一步', '第二步', '第三步', '推荐发送的话术'] }
];

// ===== Memory Card Extraction =====
function extractMemoryCard(text) {
    const match = text.match(/【客户记忆卡片】\n([\s\S]*?)(?=【[^】]+】\n|$)/);
    if (!match) return null;
    
    const cardText = match[1].trim();
    const card = {};
    const lines = cardText.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('##')) continue;
        if (trimmed.startsWith('（')) continue;
        if (!trimmed) continue;
        
        const colonIdx = trimmed.indexOf('：');
        if (colonIdx > 0) {
            const key = trimmed.substring(0, colonIdx).trim();
            const value = trimmed.substring(colonIdx + 1).trim();
            if (value && value !== '/5') {
                card[key] = value;
            }
        }
    }
    
    return Object.keys(card).length > 0 ? card : null;
}

function extractTimelineEntry(text) {
    const match = text.match(/【时间线条目】\n([\s\S]*?)(?=【[^】]+】\n|$)/);
    if (!match) return null;
    
    const entryText = match[1].trim();
    const entry = {};
    const lines = entryText.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('（')) continue;
        
        const colonIdx = trimmed.indexOf('：');
        if (colonIdx > 0) {
            const key = trimmed.substring(0, colonIdx).trim();
            const value = trimmed.substring(colonIdx + 1).trim();
            if (value) entry[key] = value;
        }
    }
    
    if (!entry['日期']) entry['日期'] = new Date().toISOString().slice(0, 10);
    return (entry['事件'] || entry['判断'] || entry['建议']) ? entry : null;
}

function stripMeta(text) {
    let result = text;
    result = result.replace(/【客户记忆卡片】\n[\s\S]*?(?=【[^】]+】\n|$)/g, '');
    result = result.replace(/【时间线条目】\n[\s\S]*?(?=【[^】]+】\n|$)/g, '');
    result = result.replace(/\n{3,}/g, '\n\n');
    return result.trim();
}

// ===== Card Migration (backward compat) =====
function migrateSummaryToCard(summary) {
    if (!summary) return null;
    const card = {};
    if (summary['公司']) card['公司'] = summary['公司'];
    if (summary['行业']) card['行业'] = summary['行业'];
    if (summary['地区']) card['国家/地区'] = summary['地区'];
    if (summary['产品需求']) card['产品需求'] = summary['产品需求'];
    if (summary['决策角色']) card['客户身份'] = summary['决策角色'];
    if (summary['当前关注点']) card['关注因素'] = summary['当前关注点'];
    if (summary['最大疑虑']) card['客户最大顾虑'] = summary['最大疑虑'];
    if (summary['信任程度']) card['客户信任程度'] = summary['信任程度'];
    if (summary['购买意愿']) card['客户购买意愿'] = summary['购买意愿'];
    if (summary['销售阶段']) card['当前阶段'] = summary['销售阶段'];
    if (summary['上次心理判断']) card['客户当前心理'] = summary['上次心理判断'];
    return Object.keys(card).length > 0 ? card : null;
}

function getCustomerCard(customer) {
    if (customer.card) return customer.card;
    if (customer.summary) return migrateSummaryToCard(customer.summary);
    return {};
}

// ===== Card Context Building (for incremental analysis) =====
function buildCardContextString(customer) {
    const card = getCustomerCard(customer);
    if (!card || Object.keys(card).length === 0) return '';
    
    let str = '';
    for (const section of CARD_SECTIONS) {
        const fields = section.fields.filter(f => card[f]);
        if (fields.length === 0) continue;
        str += '## ' + section.titleCn + '\n';
        for (const field of fields) {
            str += field + '：' + card[field] + '\n';
        }
        str += '\n';
    }
    return str.trim();
}

function generateCustomerName(card) {
    if (card) {
        if (card['客户名称'] && card['客户名称'] !== '未知') return card['客户名称'];
        if (card['公司'] && card['公司'] !== '未知') return card['公司'];
        if (card['行业'] && card['行业'] !== '未知') return card['行业'] + '客户';
    }
    return '新客户-' + new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ===== Mode Switching =====
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.mode-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.mode;
        state.mode = mode;
        $(mode + 'Mode').classList.add('active');
    });
});

// ===== Input Handling =====
const chatInput = $('chatInput');
const charCount = $('charCount');
const analyzeBtn = $('analyzeBtn');

chatInput.addEventListener('input', () => {
    const len = chatInput.value.length;
    charCount.textContent = len + ' 字';
    analyzeBtn.disabled = len < 5;
});

$('clearBtn').addEventListener('click', () => {
    chatInput.value = '';
    charCount.textContent = '0 字';
    analyzeBtn.disabled = true;
    chatInput.focus();
});

const questionInput = $('questionInput');
const askBtn = $('askBtn');
questionInput.addEventListener('input', () => {
    askBtn.disabled = questionInput.value.trim().length < 3;
});

// ===== Sample =====
$('sampleBtn').addEventListener('click', () => {
    const sample = 'Client: What do you guys do?\nMe: Hi! We are REANOD, specializing in Google SEO and independent website building for export companies, established in 2008.\nClient: Oh, SEO. We tried an SEO company before, half a year with zero results.\nMe: That is unfortunate. Each company has different strategies. We can help you see what went wrong.\nClient: No need. I think SEO is useless, high cost, slow results.\nMe: Actually with the right strategy, SEO works great. We had a client reach page 1 in 6 months.\nClient: How much?\nMe: Our SEO packages start at 30k RMB, depending on keyword volume.\nClient: Too expensive, our budget is not that high.\nMe: We can do installments, or start with a few core keywords.\nClient: Let me think about it.';
    chatInput.value = sample;
    charCount.textContent = sample.length + ' 字';
    analyzeBtn.disabled = false;
    showToast('示例已载入，点击开始分析');
});

// ===== Focus Tag Toggle =====
const focusTags = document.querySelectorAll('.focus-tag');
const focusInput = $('focusInput');
focusTags.forEach(tag => {
    tag.addEventListener('click', () => {
        tag.classList.toggle('active');
        const text = tag.dataset.text;
        let current = focusInput.value.trim();
        if (tag.classList.contains('active')) {
            if (current && !current.endsWith('\n')) current += '\n';
            focusInput.value = current + text;
        } else {
            focusInput.value = current.replace(new RegExp(text + '\\s*\\n?', 'g'), '').trim();
        }
    });
});

// ===== Settings =====
$('settingsBtn').addEventListener('click', () => {
    const config = getApiConfig();
    if (config.isTeam) {
        $('teamStatus').style.display = 'block';
        $('personalSettings').style.display = 'none';
    } else {
        $('teamStatus').style.display = 'none';
        $('personalSettings').style.display = 'block';
        $('apiProvider').value = localStorage.getItem('apiProvider') || 'deepseek';
        $('apiKey').value = localStorage.getItem('apiKey') || '';
        $('apiBaseUrl').value = localStorage.getItem('apiBaseUrl') || '';
        $('apiModel').value = localStorage.getItem('apiModel') || '';
        toggleCustomFields();
    }
    $('settingsModal').style.display = 'flex';
});

$('apiProvider').addEventListener('change', toggleCustomFields);

function toggleCustomFields() {
    const provider = $('apiProvider').value;
    const isCustom = provider === 'custom';
    $('baseUrlGroup').style.display = isCustom ? 'block' : 'none';
    $('modelGroup').style.display = isCustom ? 'block' : 'none';
}

$('closeSettings').addEventListener('click', () => $('settingsModal').style.display = 'none');

$('saveSettings').addEventListener('click', () => {
    localStorage.setItem('apiProvider', $('apiProvider').value);
    localStorage.setItem('apiKey', $('apiKey').value.trim());
    if ($('apiProvider').value === 'custom') {
        localStorage.setItem('apiBaseUrl', $('apiBaseUrl').value.trim());
        localStorage.setItem('apiModel', $('apiModel').value.trim());
    } else {
        localStorage.removeItem('apiBaseUrl');
        localStorage.removeItem('apiModel');
    }
    $('settingsModal').style.display = 'none';
    showToast('设置已保存');
});

// ===== History =====
$('historyBtn').addEventListener('click', () => {
    renderHistory();
    $('historyModal').style.display = 'flex';
});

$('closeHistory').addEventListener('click', () => $('historyModal').style.display = 'none');

function renderHistory() {
    const list = $('historyList');
    if (state.history.length === 0) {
        list.innerHTML = '<p class="empty-history">暂无历史记录</p>';
        return;
    }
    list.innerHTML = state.history.map((item, idx) =>
        '<div class="history-item" data-idx="' + idx + '">' +
            '<div class="history-item-header">' +
                '<span class="history-item-mode">' + (item.mode === 'chat' ? '聊天分析' : '快速提问') + '</span>' +
                '<span class="history-item-date">' + item.date + '</span>' +
            '</div>' +
            '<div class="history-item-preview">' + escapeHtml(item.preview) + '</div>' +
        '</div>'
    ).join('');

    list.querySelectorAll('.history-item').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.idx);
            displayResults(state.history[idx].result);
            $('historyModal').style.display = 'none';
        });
    });
}

$('clearHistory').addEventListener('click', () => {
    if (state.history.length === 0) return;
    if (!confirm('确认清空全部历史记录？')) return;
    state.history = [];
    localStorage.removeItem('salesHistory');
    renderHistory();
    showToast('已清空');
});

function saveHistory(input, result, mode) {
    const preview = input.substring(0, 60).replace(/\n/g, ' ');
    state.history.unshift({
        date: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        preview: preview + (input.length > 60 ? '...' : ''),
        input: input,
        result: result,
        mode: mode
    });
    if (state.history.length > 30) state.history = state.history.slice(0, 30);
    localStorage.setItem('salesHistory', JSON.stringify(state.history));
}

// ===== Customer List Modal =====
$('customerBtn').addEventListener('click', () => {
    renderCustomerList();
    $('customerModal').style.display = 'flex';
});

$('closeCustomer').addEventListener('click', () => $('customerModal').style.display = 'none');

function renderCustomerList() {
    const list = $('customerList');
    const customers = getCustomers();
    if (customers.length === 0) {
        list.innerHTML = '<p class="empty-history">暂无客户档案<br><span style="font-size:12px;color:var(--text-muted)">分析一段聊天记录后会自动创建客户档案</span></p>';
        return;
    }
    list.innerHTML = customers.map(c => {
        const card = getCustomerCard(c);
        const stage = card['当前阶段'] || '未知';
        const trust = card['客户信任程度'] || '';
        const intent = card['客户购买意愿'] || '';
        const dealDist = card['距离成交'] || '';
        const lastDate = new Date(c.lastUpdated).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        const tlCount = (c.timeline || []).length;
        return '<div class="customer-card" data-id="' + c.id + '">' +
            '<div class="customer-card-header">' +
                '<div class="customer-card-name">' + escapeHtml(c.name) + '</div>' +
                '<button class="customer-delete-btn" data-id="' + c.id + '" title="删除">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
                '</button>' +
            '</div>' +
            '<div class="customer-card-meta">' +
                '<span class="customer-tag">' + escapeHtml(stage) + '</span>' +
                (trust ? '<span class="customer-tag">信任 ' + escapeHtml(trust) + '</span>' : '') +
                (intent ? '<span class="customer-tag">意向 ' + escapeHtml(intent) + '</span>' : '') +
                (dealDist ? '<span class="customer-tag">距成交 ' + escapeHtml(dealDist) + '</span>' : '') +
            '</div>' +
            '<div class="customer-card-footer">' +
                '<span>' + (c.analysisCount || 1) + ' 次分析 / ' + tlCount + ' 条时间线</span>' +
                '<span>更新于 ' + lastDate + '</span>' +
            '</div>' +
            '<button class="customer-view-btn" data-id="' + c.id + '">查看档案</button>' +
        '</div>';
    }).join('');

    // Card click -> view profile
    list.querySelectorAll('.customer-card').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('.customer-delete-btn') || e.target.closest('.customer-view-btn')) return;
            const id = el.dataset.id;
            $('customerModal').style.display = 'none';
            showProfileView(id);
        });
    });

    // View profile button
    list.querySelectorAll('.customer-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            $('customerModal').style.display = 'none';
            showProfileView(id);
        });
    });

    // Delete buttons
    list.querySelectorAll('.customer-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const customer = getCustomer(id);
            if (!confirm('确认删除客户"' + (customer ? customer.name : '') + '"？此操作不可撤销。')) return;
            deleteCustomer(id);
            renderCustomerList();
            showToast('已删除');
        });
    });
}

// ===== Profile View =====
function showProfileView(customerId) {
    const customer = getCustomer(customerId);
    if (!customer) return;
    state.currentProfileId = customerId;
    setView('profile');
    renderProfileView(customer);
}

function renderProfileView(customer) {
    const container = $('profileContainer');
    const card = getCustomerCard(customer);
    const timeline = customer.timeline || [];
    const analyses = customer.analyses || [];
    const latestAnalysis = analyses.length > 0 ? analyses[analyses.length - 1] : null;

    // === Header ===
    const stage = card['当前阶段'] || '未知';
    const trustLevel = card['客户信任程度'] || '-';
    const intent = card['客户购买意愿'] || '-';
    const dealDistance = card['距离成交'] || '-';
    const riskLevel = card['新增风险'] || '无';

    let html = '';

    html += '<div class="crm-header">';
    html += '  <div class="crm-header-top">';
    html += '    <h2 class="crm-customer-name" contenteditable="true" id="crmCustomerName" title="点击可编辑客户名称">' + escapeHtml(customer.name) + '</h2>';
    html += '    <div class="crm-header-actions">';
    html += '      <button class="crm-continue-btn" id="profileContinueBtn">';
    html += '        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    html += '        继续分析该客户';
    html += '      </button>';
    html += '      <button class="crm-back-btn" id="profileBackBtn">新客户分析</button>';
    html += '    </div>';
    html += '  </div>';
    html += '  <div class="crm-header-meta">';
    html += '    <div class="crm-meta-item"><span class="crm-meta-label">客户阶段</span><span class="crm-meta-value">' + escapeHtml(stage) + '</span></div>';
    html += '    <div class="crm-meta-item"><span class="crm-meta-label">成交概率</span><span class="crm-meta-value">' + escapeHtml(dealDistance) + '</span></div>';
    html += '    <div class="crm-meta-item"><span class="crm-meta-label">客户信任度</span><span class="crm-meta-value">' + escapeHtml(trustLevel) + '</span></div>';
    html += '    <div class="crm-meta-item"><span class="crm-meta-label">风险等级</span><span class="crm-meta-value">' + escapeHtml(riskLevel) + '</span></div>';
    html += '  </div>';
    html += '</div>';

    // === 本次分析聊天记录 ===
    if (latestAnalysis) {
        const chatText = latestAnalysis.chat || latestAnalysis.inputPreview || '';
        const chatLines = chatText.split('\n');
        const previewLines = chatLines.slice(0, 4).join('\n');
        const hasMore = chatLines.length > 4;

        html += '<div class="crm-section">';
        html += '  <h3 class="crm-section-title">本次分析聊天记录 <span class="crm-analysis-date">' + (latestAnalysis.date || '') + '</span></h3>';
        if (chatText) {
            html += '  <div class="crm-chat-record" id="chatRecordBox">';
            html += '    <div class="crm-chat-preview" id="chatPreview">' + escapeHtml(previewLines) + (hasMore ? '\n...' : '') + '</div>';
            if (hasMore) {
                html += '    <div class="crm-chat-full" id="chatFull" style="display:none;">' + escapeHtml(chatText) + '</div>';
            }
            html += '    <div class="crm-chat-actions">';
            if (hasMore) {
                html += '      <button class="crm-chat-toggle" id="chatToggleBtn">展开全部</button>';
            }
            html += '      <button class="crm-chat-copy" id="chatCopyBtn">复制</button>';
            html += '    </div>';
            html += '  </div>';
        } else {
            html += '  <p class="crm-empty-hint">暂无聊天记录（旧版数据未保存完整聊天内容）</p>';
        }
        html += '</div>';
    }

    // === 销售补充信息 ===
    if (latestAnalysis) {
        const notesText = latestAnalysis.salesNotes || '';
        html += '<div class="crm-section">';
        html += '  <h3 class="crm-section-title">销售补充信息</h3>';
        if (notesText) {
            html += '  <div class="crm-notes-content">' + escapeHtml(notesText) + '</div>';
        } else {
            html += '  <p class="crm-empty-hint">本次分析未填写补充信息</p>';
        }
        html += '</div>';
    }

    // === 本次分析目标 ===
    if (latestAnalysis) {
        const focusText = latestAnalysis.focusQuestion || '';
        html += '<div class="crm-section">';
        html += '  <h3 class="crm-section-title">本次分析目标</h3>';
        if (focusText) {
            const focusLines = focusText.split('\n').filter(l => l.trim());
            html += '  <div class="crm-focus-content">';
            for (const line of focusLines) {
                html += '    <div class="crm-focus-item">' + escapeHtml(line) + '</div>';
            }
            html += '  </div>';
        } else {
            html += '  <p class="crm-empty-hint">本次分析未选择目标</p>';
        }
        html += '</div>';
    }

    // === AI 分析结果 ===
    if (latestAnalysis && latestAnalysis.result) {
        html += '<div class="crm-section">';
        html += '  <h3 class="crm-section-title">AI 分析结果 <span class="crm-analysis-date">' + escapeHtml(latestAnalysis.date || '') + ' / ' + escapeHtml(latestAnalysis.type === 'incremental' ? '增量' : '首次') + '</span></h3>';
        html += '  <div class="crm-analysis-content" id="profileAnalysisContainer"></div>';
        html += '  <div class="crm-export-section">';
        html += '    <button class="export-btn" id="profileExportBtn">导出</button>';
        html += '    <button class="export-btn" id="profileCopyBtn">复制全部</button>';
        html += '  </div>';
        html += '</div>';
    }

    // === 客户智能档案 ===
    html += '<div class="crm-section">';
    html += '  <h3 class="crm-section-title">客户智能档案</h3>';
    html += '  <div class="crm-card-content">';

    for (const section of CARD_SECTIONS) {
        const fields = section.fields.filter(f => card[f]);
        if (fields.length === 0) continue;

        html += '<div class="crm-card-group">';
        html += '  <div class="crm-group-title">' + escapeHtml(section.titleCn) + '</div>';
        html += '  <div class="crm-group-fields">';

        for (const field of fields) {
            const isAction = section.title === 'Next Action';
            const isScript = field === '推荐发送的话术';
            const fieldClass = isScript ? 'crm-field crm-field-script' : (isAction ? 'crm-field crm-field-action' : 'crm-field');
            html += '<div class="' + fieldClass + '">';
            html += '  <span class="crm-field-label">' + escapeHtml(field) + '</span>';
            html += '  <span class="crm-field-value">' + renderMarkdown(card[field]) + '</span>';
            html += '</div>';
        }

        html += '  </div>';
        html += '</div>';
    }

    if (CARD_SECTIONS.every(s => s.fields.every(f => !card[f]))) {
        html += '<p class="crm-empty-hint">暂无档案数据，分析一段聊天记录后会自动生成。</p>';
    }

    html += '  </div>';
    html += '</div>';

    // === 历史沟通时间线 ===
    if (timeline.length > 0) {
        html += '<div class="crm-section">';
        html += '  <h3 class="crm-section-title">历史沟通时间线 <span class="crm-analysis-date">' + timeline.length + ' 次分析</span></h3>';
        html += '  <div class="crm-timeline">';

        for (let i = timeline.length - 1; i >= 0; i--) {
            const entry = timeline[i];
            const isLatest = i === timeline.length - 1;
            const analysisIdx = i;
            const analysis = analyses[analysisIdx] || {};
            const tlChat = analysis.chat || '';
            const tlNotes = analysis.salesNotes || '';
            const tlFocus = analysis.focusQuestion || '';

            html += '<div class="timeline-item' + (isLatest ? ' timeline-latest' : '') + '">';
            html += '  <div class="timeline-marker"></div>';
            html += '  <div class="timeline-body">';
            html += '    <div class="timeline-date">第 ' + (i + 1) + ' 次分析 · ' + escapeHtml(entry['日期'] || entry.date || '') + '</div>';
            html += '    <div class="timeline-event">' + escapeHtml(entry['事件'] || entry.event || '') + '</div>';
            html += '    <div class="timeline-judgment"><span class="timeline-tag">判断</span>' + escapeHtml(entry['判断'] || entry.judgment || '') + '</div>';
            html += '    <div class="timeline-advice"><span class="timeline-tag timeline-tag-blue">建议</span>' + escapeHtml(entry['建议'] || entry.advice || '') + '</div>';

            // Collapsible chat record for this timeline entry
            if (tlChat) {
                var tlChatLines = tlChat.split('\n');
                var tlPreview = tlChatLines.slice(0, 3).join('\n');
                var tlHasMore = tlChatLines.length > 3;
                var tlId = 'tlChat_' + i;
                html += '    <div class="tl-chat-section">';
                html += '      <button class="tl-chat-toggle" data-tl-id="' + tlId + '">查看本次聊天记录</button>';
                html += '      <div class="tl-chat-content" id="' + tlId + '" style="display:none;">';
                html += '        <pre class="tl-chat-text">' + escapeHtml(tlChat) + '</pre>';
                if (tlNotes) {
                    html += '        <div class="tl-chat-notes"><span class="tl-notes-label">补充信息：</span>' + escapeHtml(tlNotes) + '</div>';
                }
                if (tlFocus) {
                    html += '        <div class="tl-chat-notes"><span class="tl-notes-label">分析目标：</span>' + escapeHtml(tlFocus) + '</div>';
                }
                html += '      </div>';
                html += '    </div>';
            }

            html += '  </div>';
            html += '</div>';
        }

        html += '  </div>';
        html += '</div>';
    }

    container.innerHTML = html;

    // Render latest analysis sections into container
    if (latestAnalysis && latestAnalysis.result) {
        const analysisContainer = $('profileAnalysisContainer');
        if (analysisContainer) {
            renderAnalysisSections(latestAnalysis.result, analysisContainer);
        }
        $('profileExportBtn')?.addEventListener('click', () => exportResults(latestAnalysis.result));
        $('profileCopyBtn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(latestAnalysis.result).then(() => showToast('已复制'));
        });
    }

    // Bind chat record toggle (latest analysis)
    $('chatToggleBtn')?.addEventListener('click', () => {
        const preview = $('chatPreview');
        const full = $('chatFull');
        const btn = $('chatToggleBtn');
        if (!preview || !full || !btn) return;
        if (full.style.display === 'none') {
            preview.style.display = 'none';
            full.style.display = 'block';
            btn.textContent = '收起';
        } else {
            preview.style.display = 'block';
            full.style.display = 'none';
            btn.textContent = '展开全部';
        }
    });

    $('chatCopyBtn')?.addEventListener('click', () => {
        const chatText = (latestAnalysis && latestAnalysis.chat) || '';
        if (chatText) {
            navigator.clipboard.writeText(chatText).then(() => showToast('聊天记录已复制'));
        }
    });

    // Bind timeline chat toggles
    document.querySelectorAll('.tl-chat-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const tlId = btn.dataset.tlId;
            const content = document.getElementById(tlId);
            if (!content) return;
            if (content.style.display === 'none') {
                content.style.display = 'block';
                btn.textContent = '收起本次聊天记录';
            } else {
                content.style.display = 'none';
                btn.textContent = '查看本次聊天记录';
            }
        });
    });

    // Bind continue button
    $('profileContinueBtn')?.addEventListener('click', () => {
        startFollowUp(customer.id);
    });

    // Bind back button
    $('profileBackBtn')?.addEventListener('click', () => {
        exitToNewCustomer();
    });

    // Bind editable customer name
    $('crmCustomerName')?.addEventListener('blur', (e) => {
        const newName = e.target.textContent.trim();
        if (newName && newName !== customer.name) {
            customer.name = newName;
            saveCustomer(customer);
            showToast('客户名称已更新');
            if (state.currentCustomerId === customer.id) {
                $('followupName').textContent = newName;
            }
        } else if (!newName) {
            e.target.textContent = customer.name;
        }
    });

    $('crmCustomerName')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    });
}

// ===== Follow-up Flow =====
function startFollowUp(customerId) {
    const customer = getCustomer(customerId);
    if (!customer) return;

    state.currentCustomerId = customerId;
    state.isFollowUpMode = true;

    // Show follow-up banner
    $('followupBanner').style.display = 'flex';
    $('followupName').textContent = customer.name;

    // Update analyze button
    analyzeBtn.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/><polyline points="9 7 12 4 15 7"/><line x1="12" y1="4" x2="12" y2="16"/></svg>增量分析';

    // Clear input box - previous analysis chat is saved in customer profile
    clearInputs();
    chatInput.placeholder = '在此粘贴该客户的最新聊天记录...\n\n系统会基于客户记忆卡片进行增量分析\n上一次分析的聊天记录已保存在右侧客户档案中';
    analyzeBtn.disabled = true;

    // Keep showing profile view (or show it if not visible)
    if (state.currentProfileId !== customerId) {
        showProfileView(customerId);
    }

    // Switch to chat mode
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.mode-content').forEach(c => c.classList.remove('active'));
    document.querySelector('.tab[data-mode="chat"]').classList.add('active');
    state.mode = 'chat';
    $('chatMode').classList.add('active');

    chatInput.focus();
}

function exitToNewCustomer() {
    state.currentCustomerId = null;
    state.isFollowUpMode = false;
    state.currentProfileId = null;

    $('followupBanner').style.display = 'none';

    analyzeBtn.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/><polyline points="9 7 12 4 15 7"/><line x1="12" y1="4" x2="12" y2="16"/></svg>开始分析';

    // Clear all inputs - previous analysis data is saved in customer profiles
    clearInputs();
    chatInput.placeholder = '把微信/邮件聊天记录粘贴在这里\n\n格式示例：\n客户：你们的SEO怎么做？\n我：我们是专门做Google优化的...\n客户：多少钱？\n我：...\n\n分析完成后聊天记录会自动保存到客户档案，输入框会清空方便下次使用';

    setView('empty');
    const emptyH3 = $('emptyState').querySelector('h3');
    const emptyP = $('emptyState').querySelector('p');
    if (emptyH3) emptyH3.textContent = '粘贴聊天记录，开始分析';
    if (emptyP) emptyP.innerHTML = '把客户微信/邮件聊天记录粘贴到左边，点击「开始分析」<br>系统会从客户心理、销售问题、话术建议等7个维度帮你拆解';

    chatInput.focus();
}

$('exitFollowUpBtn').addEventListener('click', exitToNewCustomer);

// ===== Copy Prompt =====
$('copyPromptBtn').addEventListener('click', () => {
    const input = state.mode === 'chat' ? chatInput.value : questionInput.value;
    if (!input || input.trim().length < 5) {
        showToast('请先输入聊天记录或问题');
        return;
    }
    const context = buildContext();
    const salesNotes = buildSalesNotes();
    const focusQuestion = buildFocusQuestion();
    const prompt = state.isFollowUpMode ? window.INCREMENTAL_PROMPT : window.SYSTEM_PROMPT;
    let fullPrompt;
    if (state.isFollowUpMode && state.currentCustomerId) {
        const customer = getCustomer(state.currentCustomerId);
        const cardStr = buildCardContextString(customer);
        fullPrompt = prompt + '\n\n---\n\n# 客户记忆卡片\n\n' + cardStr + '\n\n---\n\n';
        if (context) fullPrompt += context + '\n';
        if (salesNotes) fullPrompt += '# 销售补充信息\n' + salesNotes + '\n';
        if (focusQuestion) fullPrompt += '# 本次希望AI帮我解决什么\n' + focusQuestion + '\n';
        fullPrompt += '\n聊天记录：\n' + input;
    } else {
        fullPrompt = prompt + '\n\n---\n\n';
        if (context) fullPrompt += context + '\n';
        if (salesNotes) fullPrompt += '# 销售补充信息\n' + salesNotes + '\n';
        if (focusQuestion) fullPrompt += '# 本次希望AI帮我解决什么\n' + focusQuestion + '\n';
        fullPrompt += '\n聊天记录：\n' + input;
    }
    navigator.clipboard.writeText(fullPrompt).then(() => {
        showToast('完整Prompt已复制，可粘贴到任何AI工具使用');
    }).catch(() => {
        showToast('复制失败，请手动选择复制');
    });
});

// ===== Build Context =====
function buildContext() {
    const role = $('customerRole').value;
    const industry = $('customerIndustry').value;
    const service = $('serviceType').value;
    let context = '';
    if (role) context += '客户角色：' + role + '\n';
    if (industry) context += '客户行业：' + industry + '\n';
    if (service) context += '涉及服务：' + service + '\n';
    return context ? '客户背景信息：\n' + context : '';
}

function buildSalesNotes() {
    const el = $('salesNotesInput');
    if (!el) return '';
    return el.value.trim();
}

function buildFocusQuestion() {
    const el = $('focusInput');
    if (!el) return '';
    return el.value.trim();
}

// ===== Main Analysis =====
analyzeBtn.addEventListener('click', () => analyze(chatInput.value, 'chat'));
askBtn.addEventListener('click', () => analyze(questionInput.value, 'quick'));

async function analyze(input, mode) {
    const config = getApiConfig();
    if (!config.apiKey || !config.baseUrl || !config.model) {
        showToast('请在设置中配置 API Key');
        $('settingsBtn').click();
        return;
    }

    state.isAnalyzing = true;
    setView('loading');

    // Update loading text
    if (state.isFollowUpMode && mode === 'chat') {
        $('loadingText').textContent = '正在更新客户档案...';
        if ($('loadingHint')) $('loadingHint').textContent = 'AI正在对比心理变化并更新记忆卡片';
    } else {
        $('loadingText').textContent = '正在分析聊天记录...';
        if ($('loadingHint')) $('loadingHint').textContent = 'AI正在从7个维度拆解这段对话';
    }

    animateLoadingSteps();

    // Build messages
    const context = buildContext();
    const salesNotes = buildSalesNotes();
    const focusQuestion = buildFocusQuestion();
    let messages;

    // Build supplementary context string
    let supplement = '';
    if (context) supplement += context + '\n';
    if (salesNotes) supplement += '# 销售补充信息\n' + salesNotes + '\n';
    if (focusQuestion) supplement += '# 本次希望AI帮我解决什么\n' + focusQuestion + '\n';

    if (mode === 'chat') {
        if (state.currentCustomerId) {
            // ===== Incremental Analysis =====
            const customer = getCustomer(state.currentCustomerId);
            const cardStr = buildCardContextString(customer);
            let userContent = '# 客户记忆卡片\n\n' + (cardStr || '暂无历史记录') + '\n\n---\n\n';
            if (supplement) userContent += supplement + '\n';
            userContent += '请分析以下最新聊天记录（这是该客户的后续沟通）：\n\n' + input;
            messages = [
                { role: 'system', content: window.INCREMENTAL_PROMPT },
                { role: 'user', content: userContent }
            ];
        } else {
            // ===== First Analysis =====
            let userContent = '';
            if (supplement) userContent += supplement + '\n';
            userContent += '请分析以下聊天记录：\n\n' + input;
            messages = [
                { role: 'system', content: window.SYSTEM_PROMPT },
                { role: 'user', content: userContent }
            ];
        }
    } else {
        // Quick question mode
        let userContent = '';
        if (supplement) userContent += supplement + '\n';
        userContent += '销售问题：\n' + input + '\n\n请基于你的专业知识给出详细分析和建议。';
        messages = [
            { role: 'system', content: window.SYSTEM_PROMPT },
            { role: 'user', content: userContent }
        ];
    }

    try {
        const result = await callAPI(messages);
        state.isAnalyzing = false;

        // Extract memory card and timeline
        const card = extractMemoryCard(result);
        const timelineEntry = extractTimelineEntry(result);
        const displayText = stripMeta(result);

        // Save/update customer profile (chat mode only)
        if (mode === 'chat') {
            if (state.currentCustomerId) {
                // ===== Update existing customer =====
                const customer = getCustomer(state.currentCustomerId);
                if (card) customer.card = card;
                if (timelineEntry) {
                    customer.timeline = customer.timeline || [];
                    customer.timeline.push(timelineEntry);
                }
                customer.lastUpdated = new Date().toISOString();
                customer.analysisCount = (customer.analysisCount || 1) + 1;
                customer.analyses = customer.analyses || [];
                customer.analyses.push({
                    date: new Date().toLocaleString('zh-CN'),
                    type: 'incremental',
                    chat: input,
                    salesNotes: salesNotes,
                    focusQuestion: focusQuestion,
                    inputPreview: input.substring(0, 200),
                    result: displayText
                });
                if (customer.analyses.length > 20) {
                    customer.analyses = customer.analyses.slice(-20);
                }
                saveCustomer(customer);
                showToast('客户档案已更新');

                // Show updated profile view
                showProfileView(state.currentCustomerId);

                // Clear input box - chat record is saved in customer profile
                clearInputs();
            } else {
                // ===== Create new customer =====
                const name = generateCustomerName(card);
                const customer = {
                    id: generateCustomerId(),
                    name: name,
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    analysisCount: 1,
                    card: card,
                    timeline: timelineEntry ? [timelineEntry] : [],
                    analyses: [{
                        date: new Date().toLocaleString('zh-CN'),
                        type: 'first',
                        chat: input,
                        salesNotes: salesNotes,
                        focusQuestion: focusQuestion,
                        inputPreview: input.substring(0, 200),
                        result: displayText
                    }]
                };
                saveCustomer(customer);
                state.currentCustomerId = customer.id;
                state.isFollowUpMode = true;

                // Show follow-up banner
                $('followupBanner').style.display = 'flex';
                $('followupName').textContent = name;
                analyzeBtn.innerHTML =
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/><polyline points="9 7 12 4 15 7"/><line x1="12" y1="4" x2="12" y2="16"/></svg>增量分析';
                chatInput.placeholder = '在此粘贴该客户的最新聊天记录...\n\n系统会基于客户记忆卡片进行增量分析\n上一次分析的聊天记录已保存在右侧客户档案中';

                showToast('客户档案已创建');
                showProfileView(customer.id);

                // Clear input box - chat record is saved in customer profile
                clearInputs();
            }
        } else {
            // Quick question mode
            displayResults(displayText);
        }

        saveHistory(input, displayText, mode);
    } catch (error) {
        state.isAnalyzing = false;
        setView('empty');
        console.error('API Error:', error);
        let errMsg = error.message || 'Unknown error';
        if (errMsg.includes('401')) errMsg = 'API Key 无效，请检查设置';
        else if (errMsg.includes('402')) errMsg = 'API 余额不足，请联系管理员充值';
        else if (errMsg.includes('429')) errMsg = '请求过多，请稍后再试';
        else if (errMsg.includes('500')) errMsg = '服务器错误，请稍后再试';
        else if (errMsg.includes('Failed to fetch')) errMsg = '网络连接失败，请检查网络或VPN';
        showToast('分析失败：' + errMsg, 4000);
    }
}

// ===== API Call (Streaming) =====
async function callAPI(messages) {
    const config = getApiConfig();
    if (!config.apiKey || !config.baseUrl || !config.model) {
        throw new Error('API配置不完整，请在设置中配置');
    }

    const response = await fetch(config.baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.apiKey
        },
        body: JSON.stringify({
            model: config.model,
            messages: messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 4096
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(response.status + ' - ' + errorText.substring(0, 200));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    let firstChunk = true;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            const data = trimmed.slice(5).trim();
            if (data === '[DONE]') continue;

            try {
                const json = JSON.parse(data);
                const chunk = json.choices?.[0]?.delta?.content || '';
                if (chunk) {
                    if (firstChunk) {
                        firstChunk = false;
                        $('loadingState').style.display = 'none';
                        $('resultsContainer').style.display = 'block';
                        const pc = $('profileContainer');
                        if (pc) pc.style.display = 'none';
                        $('resultsContainer').innerHTML = '';
                    }
                    fullText += chunk;
                    renderStreamingResults(fullText);
                }
            } catch (e) {
                // Skip unparseable lines
            }
        }
    }

    if (!fullText) {
        const json = await response.json();
        fullText = json.choices?.[0]?.message?.content || '';
    }

    return fullText;
}

// ===== Loading Animation =====
function animateLoadingSteps() {
    const steps = ['step1', 'step2', 'step3', 'step4'];
    let current = 0;

    const activate = () => {
        steps.forEach((id, idx) => {
            const el = $(id);
            if (!el) return;
            el.classList.remove('active', 'done');
            if (idx < current) el.classList.add('done');
            else if (idx === current) el.classList.add('active');
        });
        current++;
        if (current <= steps.length) {
            setTimeout(activate, 800);
        }
    };
    setTimeout(activate, 300);
}

// ===== Render Streaming Results =====
function renderStreamingResults(text) {
    const container = $('resultsContainer');
    if (container.children.length === 0) {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML =
            '<div class="result-card-header">' +
                '<span class="card-badge blue">正在生成...</span>' +
            '</div>' +
            '<div class="result-card-body" style="white-space: pre-wrap; font-size: 13px; color: var(--text-secondary);">' +
                escapeHtml(text) +
            '</div>';
        container.appendChild(card);
    } else {
        const body = container.querySelector('.result-card-body');
        if (body) body.textContent = text;
    }

    container.scrollTop = container.scrollHeight;
}

// ===== Render Analysis Sections (reusable) =====
function renderAnalysisSections(text, container) {
    const sections = parseSections(text);
    container.innerHTML = '';

    if (sections.length === 0) {
        container.innerHTML =
            '<div class="result-card">' +
                '<div class="result-card-header"><span class="card-badge blue">分析结果</span></div>' +
                '<div class="result-card-body" style="white-space: pre-wrap;">' + escapeHtml(text) + '</div>' +
            '</div>';
    } else {
        sections.forEach(section => {
            const html = renderSection(section);
            if (html) container.insertAdjacentHTML('beforeend', html);
        });
    }

    // Bind copy buttons
    container.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const copyText = btn.dataset.copyText;
            navigator.clipboard.writeText(copyText).then(() => {
                const original = btn.innerHTML;
                btn.classList.add('copied');
                btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>已复制';
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = original;
                }, 1500);
            });
        });
    });
}

// ===== Display Results (for non-customer mode / history) =====
function displayResults(text) {
    setView('analysis');

    const container = $('resultsContainer');
    renderAnalysisSections(text, container);

    // Add export buttons
    container.insertAdjacentHTML('beforeend',
        '<div class="export-section">' +
            '<button class="export-btn" id="exportBtn">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
                '导出' +
            '</button>' +
            '<button class="export-btn" id="copyAllBtn">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
                '复制全部' +
            '</button>' +
        '</div>'
    );

    $('exportBtn')?.addEventListener('click', () => exportResults(text));
    $('copyAllBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(text).then(() => showToast('已全部复制'));
    });

    state.currentResult = text;
}

// ===== Parse Sections =====
function parseSections(text) {
    const sections = [];
    const regex = /【([^】]+)】\n([\s\S]*?)(?=【[^】]+】\n|$)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        const title = match[1].trim();
        const content = match[2].trim();
        // Skip meta sections that were already extracted
        if (title === '客户记忆卡片' || title === '时间线条目' || title === '客户档案摘要') continue;
        sections.push({ title, content });
    }
    return sections;
}

// ===== Render Section =====
function renderSection(section) {
    const { title, content } = section;

    const firstAnalysisMap = {
        '客户阶段': { class: 'blue' },
        '客户心理': { class: 'purple' },
        '销售问题': { class: 'red' },
        '聊天评分': { class: 'amber' },
        '最佳回复方案': { class: 'green' },
        '发送节奏': { class: 'teal' },
        '后续建议': { class: 'indigo' }
    };

    const incrementalMap = {
        '客户状态变化': { class: 'blue' },
        '最新心理判断': { class: 'purple' },
        '成交机会': { class: 'amber' },
        '策略效果评估': { class: 'teal' },
        '下一句话怎么回复': { class: 'green' },
        '后续跟进建议': { class: 'indigo' },
        '风险提醒': { class: 'red' },
        '针对问题回答': { class: 'indigo' }
    };

    const badge = firstAnalysisMap[title] || incrementalMap[title] || { class: 'blue' };

    if (title === '聊天评分' || title === '成交机会') {
        return renderRatingSection(content, badge, title);
    }

    if (title === '最佳回复方案' || title === '下一句话怎么回复') {
        return renderReplySection(content, badge, title);
    }

    if (title === '发送节奏' || title === '后续跟进建议' || title === '后续建议') {
        return renderSuggestionSection(content, badge, title);
    }

    return '<div class="result-card">' +
        '<div class="result-card-header">' +
            '<span class="card-badge ' + badge.class + '">' + escapeHtml(title) + '</span>' +
        '</div>' +
        '<div class="result-card-body">' + renderMarkdown(content) + '</div>' +
    '</div>';
}

// ===== Render Rating Section =====
function renderRatingSection(content, badge, title) {
    const ratingRegex = /([^：\n]+)：\s*([★☆]+)/g;
    let match;
    let ratings = [];
    while ((match = ratingRegex.exec(content)) !== null) {
        const label = match[1].trim();
        const stars = match[2];
        const filled = (stars.match(/★/g) || []).length;
        ratings.push({ label, filled, total: 5 });
    }

    if (ratings.length === 0) {
        return '<div class="result-card">' +
            '<div class="result-card-header"><span class="card-badge ' + badge.class + '">' + escapeHtml(title) + '</span></div>' +
            '<div class="result-card-body">' + renderMarkdown(content) + '</div>' +
        '</div>';
    }

    const ratingHtml = ratings.map(function(r) {
        return '<div class="rating-item">' +
            '<div class="rating-label">' + escapeHtml(r.label) + '</div>' +
            '<div class="rating-stars">' + '\u2605'.repeat(r.filled) + '<span class="empty">' + '\u2605'.repeat(r.total - r.filled) + '</span></div>' +
        '</div>';
    }).join('');

    let extraText = content.replace(/[^：\n]+：\s*[\u2605\u2606]+/g, '').trim();
    if (extraText.startsWith('\n')) extraText = extraText.substring(1);

    return '<div class="result-card">' +
        '<div class="result-card-header"><span class="card-badge ' + badge.class + '">' + escapeHtml(title) + '</span></div>' +
        '<div class="rating-grid">' + ratingHtml + '</div>' +
        (extraText ? '<div class="result-card-body" style="margin-top: 12px;">' + renderMarkdown(extraText) + '</div>' : '') +
    '</div>';
}

// ===== Render Reply Section =====
function renderReplySection(content, badge, title) {
    const schemeRegex = /方案([A-C])[（(]([^）)]+)[）)]?[：:]?\n([\s\S]*?)(?=方案[A-C]|$)/g;
    let match;
    let schemes = [];
    while ((match = schemeRegex.exec(content)) !== null) {
        schemes.push({
            letter: match[1],
            tag: match[2].trim(),
            content: match[3].trim()
        });
    }

    if (schemes.length === 0) {
        return '<div class="result-card">' +
            '<div class="result-card-header"><span class="card-badge ' + badge.class + '">' + escapeHtml(title) + '</span></div>' +
            '<div class="result-card-body">' + renderMarkdown(content) + '</div>' +
        '</div>';
    }

    const tagClassMap = { '建立信任型': 'trust', '专业分析型': 'pro', '引导客户继续聊天型': 'chat', '引导继续聊天型': 'chat', '直接推进型': 'pro', '迂回试探型': 'trust', '留钩子型': 'chat' };

    const schemesHtml = schemes.map(function(s) {
        const tagClass = tagClassMap[s.tag] || 'trust';
        const copyText = s.content;
        return '<div class="scheme-card">' +
            '<div class="scheme-header">' +
                '<span class="scheme-label">方案 ' + escapeHtml(s.letter) + '<span class="tag ' + tagClass + '">' + escapeHtml(s.tag) + '</span></span>' +
                '<button class="copy-btn" data-copy-text="' + escapeAttr(copyText) + '">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
                    '复制' +
                '</button>' +
            '</div>' +
            '<div class="scheme-content">' + escapeHtml(s.content) + '</div>' +
        '</div>';
    }).join('');

    return '<div class="result-card">' +
        '<div class="result-card-header"><span class="card-badge ' + badge.class + '">' + escapeHtml(title) + '</span></div>' +
        schemesHtml +
    '</div>';
}

// ===== Render Suggestion Section =====
function renderSuggestionSection(content, badge, title) {
    const lines = content.split('\n').filter(function(l) { return l.trim(); });
    const isList = lines.some(function(l) { return /^\d+[.、）)]/.test(l.trim()); });

    if (isList) {
        const items = lines.map(function(line, idx) {
            const text = line.replace(/^\d+[.、）)]\s*/, '').trim();
            return '<div class="rhythm-item"><div class="rhythm-num">' + (idx + 1) + '</div><div>' + renderMarkdown(text) + '</div></div>';
        }).join('');
        return '<div class="result-card">' +
            '<div class="result-card-header"><span class="card-badge ' + badge.class + '">' + escapeHtml(title) + '</span></div>' +
            '<div class="rhythm-list">' + items + '</div>' +
        '</div>';
    }

    const itemRegex = /([^：\n]+[：:])\s*([\s\S]*?)(?=[^：\n]+[：:]|$)/g;
    let match;
    let items = [];
    while ((match = itemRegex.exec(content)) !== null) {
        const label = match[1].trim();
        const text = match[2].trim();
        if (label && text) items.push({ label, text });
    }

    if (items.length === 0) {
        return '<div class="result-card">' +
            '<div class="result-card-header"><span class="card-badge ' + badge.class + '">' + escapeHtml(title) + '</span></div>' +
            '<div class="result-card-body">' + renderMarkdown(content) + '</div>' +
        '</div>';
    }

    const itemsHtml = items.map(function(item) {
        const isRisk = item.label.includes('风险') || item.label.includes('不要');
        if (isRisk) {
            const risks = item.text.split(/不要/).filter(function(s) { return s.trim(); }).map(function(s) { return '不要' + s.trim(); });
            return '<div class="suggestion-item">' +
                '<div class="suggestion-label">' + escapeHtml(item.label) + '</div>' +
                '<ul class="risk-list">' + risks.map(function(r) { return '<li class="risk-item">' + escapeHtml(r) + '</li>'; }).join('') + '</ul>' +
            '</div>';
        }
        return '<div class="suggestion-item">' +
            '<div class="suggestion-label">' + escapeHtml(item.label) + '</div>' +
            '<div class="suggestion-text">' + renderMarkdown(item.text) + '</div>' +
        '</div>';
    }).join('');

    return '<div class="result-card">' +
        '<div class="result-card-header"><span class="card-badge ' + badge.class + '">' + escapeHtml(title) + '</span></div>' +
        itemsHtml +
    '</div>';
}

// ===== Markdown Renderer =====
function renderMarkdown(text) {
    let html = escapeHtml(text);
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n/g, '<br>');
    return html;
}

// ===== Utils =====
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

function escapeAttr(text) {
    return String(text).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== Export =====
function exportResults(text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales_analysis_' + new Date().toISOString().slice(0, 10) + '_' + Date.now().toString(36) + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('已导出');
}

// ===== Init =====
if (!hasApiKey()) {
    setTimeout(() => {
        showToast('首次使用？请在设置中配置 API Key', 3000);
    }, 500);
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.style.display = 'none';
    });
});

// Keyboard shortcut: Ctrl/Cmd + Enter to analyze
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (state.mode === 'chat' && !analyzeBtn.disabled) {
            analyzeBtn.click();
        } else if (state.mode === 'quick' && !askBtn.disabled) {
            askBtn.click();
        }
    }
});
