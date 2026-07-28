/**
 * 销售沟通助手 - 应用逻辑
 * 功能：API调用（流式）、结果解析渲染、历史记录、设置管理、导出
 */

// ===== State =====
const state = {
    mode: 'chat',
    isAnalyzing: false,
    history: JSON.parse(localStorage.getItem('salesHistory') || '[]'),
    currentResult: ''
};

// ===== API Config =====
const API_CONFIGS = {
    deepseek: { baseUrl: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat', name: 'Deepseek' },
    openai: { baseUrl: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini', name: 'OpenAI' },
    custom: { baseUrl: '', model: '', name: '自定义' }
};

function getApiConfig() {
    // 优先读取 config.js 嵌入的团队 Key
    if (window.TEAM_CONFIG && window.TEAM_CONFIG.apiKey) {
        return {
            apiKey: window.TEAM_CONFIG.apiKey,
            baseUrl: window.TEAM_CONFIG.baseUrl || 'https://api.deepseek.com/v1/chat/completions',
            model: window.TEAM_CONFIG.model || 'deepseek-chat',
            isTeam: true
        };
    }
    // 回退到 localStorage（个人模式）
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

function showToast(msg, duration = 2000) {
    const toast = $('toast');
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, duration);
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
    charCount.textContent = `${len} 字`;
    analyzeBtn.disabled = len < 5;
});

$('clearBtn').addEventListener('click', () => {
    chatInput.value = '';
    charCount.textContent = '0 字';
    analyzeBtn.disabled = true;
    chatInput.focus();
});

// Question mode
const questionInput = $('questionInput');
const askBtn = $('askBtn');
questionInput.addEventListener('input', () => {
    askBtn.disabled = questionInput.value.trim().length < 3;
});

// ===== Sample =====
$('sampleBtn').addEventListener('click', () => {
    const sample = `客户：你们是做什么的？
我：您好！我们是瑞诺国际，专门帮外贸企业做Google SEO和独立站建站的，2008年成立，做了18年了
客户：哦，SEO啊，我们之前找过一家做SEO的，做了半年一点效果都没有
我：那确实很遗憾，不过每家做的策略不一样，我们可以帮您看看之前的问题出在哪里
客户：不用了，我觉得SEO没什么用，投入大见效慢
我：其实SEO如果策略对的话，效果是很好的，我们有客户半年就上首页了
客户：那多少钱？
我：我们的SEO套餐是3万起，根据关键词数量来定
客户：太贵了，我们预算没那么高
我：我们也可以分期做，或者先做几个核心关键词试试
客户：我考虑考虑吧`;
    chatInput.value = sample;
    charCount.textContent = `${sample.length} 字`;
    analyzeBtn.disabled = false;
    showToast('示例已填入，点击「开始分析」试试');
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
    list.innerHTML = state.history.map((item, idx) => `
        <div class="history-item" data-idx="${idx}">
            <div class="history-item-header">
                <span class="history-item-mode">${item.mode === 'chat' ? '聊天分析' : '快速提问'}</span>
                <span class="history-item-date">${item.date}</span>
            </div>
            <div class="history-item-preview">${item.preview}</div>
        </div>
    `).join('');

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
    if (!confirm('确定清空全部历史记录？')) return;
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

// ===== Copy Prompt =====
$('copyPromptBtn').addEventListener('click', () => {
    const input = state.mode === 'chat' ? chatInput.value : questionInput.value;
    if (!input || input.trim().length < 5) {
        showToast('请先输入聊天记录或问题');
        return;
    }
    const context = buildContext();
    const fullPrompt = `${window.SYSTEM_PROMPT}\n\n---\n\n# 用户输入\n\n${context}\n\n聊天记录：\n${input}`;
    navigator.clipboard.writeText(fullPrompt).then(() => {
        showToast('完整Prompt已复制！可粘贴到任何AI工具使用');
    }).catch(() => {
        showToast('复制失败，请手动选择');
    });
});

// ===== Build Context =====
function buildContext() {
    const role = $('customerRole').value;
    const industry = $('customerIndustry').value;
    const service = $('serviceType').value;
    let context = '';
    if (role) context += `客户角色：${role}\n`;
    if (industry) context += `客户行业：${industry}\n`;
    if (service) context += `涉及服务：${service}\n`;
    return context ? `客户背景信息：\n${context}` : '';
}

// ===== Main Analysis =====
analyzeBtn.addEventListener('click', () => analyze(chatInput.value, 'chat'));
askBtn.addEventListener('click', () => analyze(questionInput.value, 'quick'));

async function analyze(input, mode) {
    // Check API config
    const config = getApiConfig();
    if (!config.apiKey || !config.baseUrl || !config.model) {
        showToast('请在设置中配置API Key');
        $('settingsBtn').click();
        return;
    }

    state.isAnalyzing = true;
    $('emptyState').style.display = 'none';
    $('loadingState').style.display = 'flex';
    $('resultsContainer').style.display = 'none';

    // Animate loading steps
    animateLoadingSteps();

    // Build messages
    const context = buildContext();
    let userContent = '';
    if (mode === 'chat') {
        userContent = `${context}\n\n请分析以下聊天记录：\n\n${input}`;
    } else {
        userContent = `${context}\n\n销售问题：\n${input}\n\n请基于你的专业知识给出详细分析和建议。`;
    }

    const messages = [
        { role: 'system', content: window.SYSTEM_PROMPT },
        { role: 'user', content: userContent }
    ];

    try {
        const result = await callAPI(messages);
        state.isAnalyzing = false;
        $('loadingState').style.display = 'none';
        displayResults(result);
        saveHistory(input, result, mode);
    } catch (error) {
        state.isAnalyzing = false;
        $('loadingState').style.display = 'none';
        $('emptyState').style.display = 'flex';
        console.error('API Error:', error);
        let errMsg = error.message || '未知错误';
        if (errMsg.includes('401')) errMsg = 'API Key无效，请检查设置';
        else if (errMsg.includes('402')) errMsg = 'API余额不足，请联系管理员充值';
        else if (errMsg.includes('429')) errMsg = '请求太频繁，请稍后再试';
        else if (errMsg.includes('500')) errMsg = '服务器错误，请稍后再试';
        else if (errMsg.includes('Failed to fetch')) errMsg = '网络连接失败，请检查网络或VPN设置';
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
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.model,
            messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 4096
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status} - ${errorText.substring(0, 200)}`);
    }

    // Read stream
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
                        // Switch to results display on first chunk
                        $('loadingState').style.display = 'none';
                        $('resultsContainer').style.display = 'block';
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
        // Non-streaming fallback
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
    // While streaming, show raw text
    const container = $('resultsContainer');
    if (container.children.length === 0) {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-card-header">
                <span class="card-badge blue">正在生成...</span>
            </div>
            <div class="result-card-body" style="white-space: pre-wrap; font-size: 13px; color: var(--text-secondary);">
                ${escapeHtml(text)}
            </div>
        `;
        container.appendChild(card);
    } else {
        const body = container.querySelector('.result-card-body');
        if (body) body.textContent = text;
    }

    // Auto scroll
    container.scrollTop = container.scrollHeight;
}

// ===== Display Results (Final) =====
function displayResults(text) {
    $('emptyState').style.display = 'none';
    $('loadingState').style.display = 'none';
    $('resultsContainer').style.display = 'block';

    const sections = parseSections(text);
    const container = $('resultsContainer');
    container.innerHTML = '';

    if (sections.length === 0) {
        // Fallback: show raw text
        container.innerHTML = `
            <div class="result-card">
                <div class="result-card-header"><span class="card-badge blue">分析结果</span></div>
                <div class="result-card-body" style="white-space: pre-wrap;">${escapeHtml(text)}</div>
            </div>
        `;
        return;
    }

    sections.forEach(section => {
        const html = renderSection(section);
        if (html) container.insertAdjacentHTML('beforeend', html);
    });

    // Add export button
    container.insertAdjacentHTML('beforeend', `
        <div class="export-section">
            <button class="export-btn" id="exportBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                导出分析结果
            </button>
            <button class="export-btn" id="copyAllBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                复制全部
            </button>
        </div>
    `);

    // Bind copy buttons
    container.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.dataset.copyText;
            navigator.clipboard.writeText(text).then(() => {
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

    // Export
    $('exportBtn')?.addEventListener('click', () => exportResults(text));
    $('copyAllBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(text).then(() => showToast('已复制全部内容'));
    });

    state.currentResult = text;
}

// ===== Parse Sections =====
function parseSections(text) {
    const sections = [];
    const regex = /【([^】]+)】\n([\s\S]*?)(?=【[^】]+】\n|$)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        sections.push({
            title: match[1].trim(),
            content: match[2].trim()
        });
    }
    return sections;
}

// ===== Render Section =====
function renderSection(section) {
    const { title, content } = section;

    // Map section titles to badges
    const badgeMap = {
        '客户阶段': { class: 'blue', icon: 'M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4' },
        '客户心理': { class: 'purple', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z' },
        '销售问题': { class: 'red', icon: 'M12 9v2m0 4h.01M5 19h14a2 2 0 0 0 1.84-2.75L13.74 4a2 2 0 0 0-3.48 0L3.16 16.25A2 2 0 0 0 5 19z' },
        '聊天评分': { class: 'amber', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
        '最佳回复方案': { class: 'green', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
        '发送节奏': { class: 'teal', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z' },
        '后续建议': { class: 'indigo', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' }
    };

    const badge = badgeMap[title] || { class: 'blue', icon: '' };

    // Special rendering for different sections
    if (title === '聊天评分') {
        return renderRatingSection(content, badge);
    }
    if (title === '最佳回复方案') {
        return renderReplySection(content, badge);
    }
    if (title === '发送节奏') {
        return renderRhythmSection(content, badge);
    }
    if (title === '后续建议') {
        return renderSuggestionSection(content, badge);
    }

    // Default rendering
    return `
        <div class="result-card">
            <div class="result-card-header">
                <span class="card-badge ${badge.class}">${title}</span>
            </div>
            <div class="result-card-body">${renderMarkdown(content)}</div>
        </div>
    `;
}

// ===== Render Rating Section =====
function renderRatingSection(content, badge) {
    // Parse ratings like "客户意向：★★★☆☆"
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
        return `
            <div class="result-card">
                <div class="result-card-header"><span class="card-badge ${badge.class}">${badge.class === 'amber' ? '聊天评分' : title}</span></div>
                <div class="result-card-body">${renderMarkdown(content)}</div>
            </div>
        `;
    }

    const ratingHtml = ratings.map(r => `
        <div class="rating-item">
            <div class="rating-label">${r.label}</div>
            <div class="rating-stars">
                ${'★'.repeat(r.filled)}<span class="empty">${'★'.repeat(r.total - r.filled)}</span>
            </div>
        </div>
    `).join('');

    // Extract non-rating text
    let extraText = content.replace(/[^：\n]+：\s*[★☆]+/g, '').trim();
    if (extraText.startsWith('\n')) extraText = extraText.substring(1);

    return `
        <div class="result-card">
            <div class="result-card-header"><span class="card-badge ${badge.class}">聊天评分</span></div>
            <div class="rating-grid">${ratingHtml}</div>
            ${extraText ? `<div class="result-card-body" style="margin-top: 12px;">${renderMarkdown(extraText)}</div>` : ''}
        </div>
    `;
}

// ===== Render Reply Section =====
function renderReplySection(content, badge) {
    // Parse 方案A/B/C
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

    // If no schemes found, show raw content
    if (schemes.length === 0) {
        return `
            <div class="result-card">
                <div class="result-card-header"><span class="card-badge ${badge.class}">最佳回复方案</span></div>
                <div class="result-card-body">${renderMarkdown(content)}</div>
            </div>
        `;
    }

    const tagClassMap = { '建立信任型': 'trust', '专业分析型': 'pro', '引导客户继续聊天型': 'chat', '引导继续聊天型': 'chat' };

    const schemesHtml = schemes.map(s => {
        const tagClass = tagClassMap[s.tag] || 'trust';
        const copyText = s.content;
        return `
            <div class="scheme-card">
                <div class="scheme-header">
                    <span class="scheme-label">方案${s.letter}<span class="tag ${tagClass}">${s.tag}</span></span>
                    <button class="copy-btn" data-copy-text="${escapeAttr(copyText)}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        复制
                    </button>
                </div>
                <div class="scheme-content">${escapeHtml(s.content)}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="result-card">
            <div class="result-card-header"><span class="card-badge ${badge.class}">最佳回复方案</span></div>
            ${schemesHtml}
        </div>
    `;
}

// ===== Render Rhythm Section =====
function renderRhythmSection(content, badge) {
    // Try to parse as numbered list
    const lines = content.split('\n').filter(l => l.trim());

    // Check if it looks like a list
    const isList = lines.some(l => /^\d+[.、）)]/.test(l.trim()));

    if (isList) {
        const items = lines.map((line, idx) => {
            const text = line.replace(/^\d+[.、）)]\s*/, '').trim();
            return `<div class="rhythm-item"><div class="rhythm-num">${idx + 1}</div><div>${renderMarkdown(text)}</div></div>`;
        }).join('');
        return `
            <div class="result-card">
                <div class="result-card-header"><span class="card-badge ${badge.class}">发送节奏</span></div>
                <div class="rhythm-list">${items}</div>
            </div>
        `;
    }

    return `
        <div class="result-card">
            <div class="result-card-header"><span class="card-badge ${badge.class}">发送节奏</span></div>
            <div class="result-card-body">${renderMarkdown(content)}</div>
        </div>
    `;
}

// ===== Render Suggestion Section =====
function renderSuggestionSection(content, badge) {
    // Parse structured items like "客户现在真正担心的是：..."
    const itemRegex = /([^：\n]+[：:])\s*([\s\S]*?)(?=[^：\n]+[：:]|$)/g;
    let match;
    let items = [];
    while ((match = itemRegex.exec(content)) !== null) {
        const label = match[1].trim();
        const text = match[2].trim();
        if (label && text) items.push({ label, text });
    }

    if (items.length === 0) {
        return `
            <div class="result-card">
                <div class="result-card-header"><span class="card-badge ${badge.class}">后续建议</span></div>
                <div class="result-card-body">${renderMarkdown(content)}</div>
            </div>
        `;
    }

    const itemsHtml = items.map(item => {
        const isRisk = item.label.includes('风险') || item.label.includes('不要');
        if (isRisk) {
            // Split by 不要
            const risks = item.text.split(/不要/).filter(s => s.trim()).map(s => `不要${s.trim()}`);
            return `
                <div class="suggestion-item">
                    <div class="suggestion-label">${escapeHtml(item.label)}</div>
                    <ul class="risk-list">${risks.map(r => `<li class="risk-item">${escapeHtml(r)}</li>`).join('')}</ul>
                </div>
            `;
        }
        return `
            <div class="suggestion-item">
                <div class="suggestion-label">${escapeHtml(item.label)}</div>
                <div class="suggestion-text">${renderMarkdown(item.text)}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="result-card">
            <div class="result-card-header"><span class="card-badge ${badge.class}">后续建议</span></div>
            ${itemsHtml}
        </div>
    `;
}

// ===== Markdown Renderer (Simple) =====
function renderMarkdown(text) {
    let html = escapeHtml(text);
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    return html;
}

// ===== Utils =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeAttr(text) {
    return text.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== Export =====
function exportResults(text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `销售分析_${new Date().toISOString().slice(0, 10)}_${Date.now().toString(36)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('已导出');
}

// ===== Init =====
// Check if team config has key on load
if (!hasApiKey()) {
    setTimeout(() => {
        showToast('首次使用请先配置API Key', 3000);
    }, 500);
}

// Close modal on overlay click
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
