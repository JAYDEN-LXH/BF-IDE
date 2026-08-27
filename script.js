// =======================================
// VARIABLES & CONSTANTS
// =======================================

const themeswitch = document.getElementById('themeswitch');
const body = document.body;
const code = document.getElementById('code-bg');
const IDEarea = document.getElementById('textarea');
const codeInput = document.getElementById('codeInput');
const debuggerPanel = document.getElementById('debugger');
const highlightCode = document.getElementById('highlightCode');
let debug = true; // this is shared!

// New DOM refs
const toolbar = document.getElementById('toolbar');
const tapeEl = document.getElementById('tape');
const outputEl = document.getElementById('output');
const terminalInput = document.getElementById('terminal-input');
const terminalSend = document.getElementById('terminal-send');
const dbgStatus = document.getElementById('dbg-status');
const btnRun = document.getElementById('btn-run');
const btnStep = document.getElementById('btn-step');
const btnStepBack = document.getElementById('btn-step-back');
const btnReset = document.getElementById('btn-reset');
const btnDone = document.getElementById('btn-done');
const fileInput = document.getElementById('file-input');
const settingsModal = document.getElementById('settings-modal');
const helpModal = document.getElementById('help-modal');

// Settings modal refs
const settingFontSelect = document.getElementById('setting-font-select');
const settingFontInput = document.getElementById('setting-font-input');
const settingFontsize = document.getElementById('setting-fontsize');
const settingFontsizeValue = document.getElementById('setting-fontsize-value');
const settingShowBg = document.getElementById('setting-show-bg');
const settingPauseOnInput = document.getElementById('setting-pause-on-input');
const btnSaveThemePrefs = document.getElementById('btn-save-theme-prefs');
const btnClearThemePrefs = document.getElementById('btn-clear-theme-prefs');
const themePrefsStatus = document.getElementById('theme-prefs-status');
const settingStepInterval = document.getElementById('setting-step-interval');
const settingStepIntervalValue = document.getElementById('setting-step-interval-value');
const syntaxConfigEl = document.getElementById('syntax-config');

// =======================================
// LONG VARIABLES & CONSTANTS
// =======================================

const sunSVG = `
<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    style="width: 60%; height: 60%;">

    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
</svg>`;

const moonSVG = `
<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    style="width: 60%; height: 60%;">

    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
</svg>`;

// Default syntax configs per theme (must match the .bf-* CSS defaults)
const DARK_SYNTAX_DEFAULT = {
    '>': { color: '#FCFF70', style: 'normal' },
    '<': { color: '#FCFF70', style: 'normal' },
    '[': { color: '#FF6347', style: 'bold' },
    ']': { color: '#FF6347', style: 'bold' },
    '+': { color: '#3DFCF9', style: 'normal' },
    '-': { color: '#D29CE6', style: 'normal' },
    '.': { color: '#36ABFF', style: 'normal' },
    ',': { color: '#70FFA2', style: 'normal' },
    'comment': { color: '#FF9247', style: 'bolditalic' }
};

const LIGHT_SYNTAX_DEFAULT = {
    '>': { color: '#b8860b', style: 'normal' },
    '<': { color: '#b8860b', style: 'normal' },
    '[': { color: '#c72e1a', style: 'bold' },
    ']': { color: '#c72e1a', style: 'bold' },
    '+': { color: '#1a7a78', style: 'normal' },
    '-': { color: '#7b4a8e', style: 'normal' },
    '.': { color: '#1a6ba8', style: 'normal' },
    ',': { color: '#1e7a4a', style: 'normal' },
    'comment': { color: '#b85a1a', style: 'bolditalic' }
};

const STATUS_MAP = {
    idle: 'Idle',
    ready: 'Ready',
    running: 'Running',
    paused: 'Paused',
    waiting: 'Waiting'
}

const HELLO_WORLD_BF = '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.';

const BF_COMMANDS = '><+-.,[]';
const DEFAULT_STEP_INTERVAL_MS = 100;

// =======================================
// STATE
// =======================================

const bfState = {
    // 运行时状态
    tape: [0],
    pointer: 0,
    code: '',
    ip: 0,
    output: '',
    loopStack: [],
    running: false,
    stepInterval: null,
    sessionActive: false,
    inputPending: false,
    lastInput: null,

    // 历史记录
    history: [],
    historyIndex: -1,

    // 断点
    breakpoints: new Set(),
    breakpointMode: false,
    skipBreakpointOnce: false,

    // 错误信息（运行时限制触发时显示）
    errorMsg: '',

    // 括号匹配缓存
    unmatchedBrackets: new Set(),

    // 标记当前执行是由 Run 还是 Step 触发（用于 `,` 输入后的行为）
    startedByRun: false,

    // 当前状态
    status: 'idle',

    // 配置
    config: {
        font: 'Consolas',
        fontSize: 16,
        showBackground: true,
        theme: 'dark',
        saveThemePreference: false,
        stepIntervalMs: DEFAULT_STEP_INTERVAL_MS,
        pauseOnInput: true,
        syntax: {
            dark: cloneSyntax(DARK_SYNTAX_DEFAULT),
            light: cloneSyntax(LIGHT_SYNTAX_DEFAULT)
        }
    },

    // Currently-editing theme inside Settings Advanced syntax tabs (separate from UI theme)
    settingsSynTheme: 'dark'
};

// =======================================
// HELPERS
// =======================================

// this is logger! SHARED!
function l(log, override=false) {
    if (debug || override) console.log(log);
}

function escapeHtml(ch) {
    switch (ch) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        default: return ch;
    }
}

// The currently active syntax map (selected by UI theme).
function activeSyntax() {
    return bfState.config.syntax[bfState.config.theme] || bfState.config.syntax.dark;
}

// Editor highlight span builder — COLORS ENTIRELY DRIVEN BY USER CONFIG per theme.
// No `.bf-*` base classes are used for colors; colors+styles are fully inline.
// Only `.active-instruction`, `.breakpoint`, `.unmatched-bracket` overlay classes are added.
function getSpanHTML(char, index) {
    const syntax = activeSyntax();
    const cfg = syntax[char] || syntax['comment'];
    let style = '';
    if (cfg) {
        style = `color:${cfg.color};`;
        if (cfg.style === 'bold') style += 'font-weight:bold;';
        else if (cfg.style === 'italic') style += 'font-style:italic;';
        else if (cfg.style === 'bolditalic') style += 'font-weight:bold;font-style:italic;';
    }
    let extra = '';
    if (index !== undefined) {
        // bfState.ip is a pure-instruction index; map to raw position for highlight.
        const rawIp = bfState.ipMap ? bfState.ipMap[bfState.ip] : bfState.ip;
        if (bfState.sessionActive && index === rawIp) extra += ' active-instruction';
        // Breakpoints are stored as raw indices.
        if (bfState.breakpoints.has(index)) extra += ' breakpoint';
        if (bfState.unmatchedBrackets.has(index)) extra += ' unmatched-bracket';
    }
    const clsAttr = extra ? ` class="${extra.trim()}"` : '';
    const styleAttr = style ? ` style="${style}"` : '';
    const dataAttr = (index !== undefined) ? ` data-ip="${index}"` : '';
    return `<span${clsAttr}${styleAttr}${dataAttr}>${escapeHtml(char)}</span>`;
}
// Expose globally so type.js (and any legacy callers) use the config-aware version.
window.getSpanHTML = getSpanHTML;

function cloneSyntax(syntax) {
    const out = {};
    for (const k of Object.keys(syntax)) {
        out[k] = { ...syntax[k] };
    }
    return out;
}

function syntaxEqual(a, b) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
        if (!a[k] || !b[k]) return false;
        if (a[k].color !== b[k].color || a[k].style !== b[k].style) return false;
    }
    return true;
}

// =======================================
// BRACKET MATCHING
// =======================================

function findMatchingBracket(codeStr, startIp, direction) {
    const open = direction === 1 ? '[' : ']';
    const close = direction === 1 ? ']' : '[';
    let depth = 0;
    for (let i = startIp; direction === 1 ? i < codeStr.length : i >= 0; i += direction) {
        const c = codeStr[i];
        if (c === open) depth++;
        else if (c === close) {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

function findUnmatchedBrackets(codeStr) {
    const unmatched = new Set();
    const stack = [];
    for (let i = 0; i < codeStr.length; i++) {
        const c = codeStr[i];
        if (c === '[') {
            stack.push(i);
        } else if (c === ']') {
            if (stack.length === 0) {
                unmatched.add(i); // ] without matching [
            } else {
                stack.pop();
            }
        }
    }
    // Any remaining [ in stack are unmatched
    for (const i of stack) unmatched.add(i);
    return unmatched;
}

// =======================================
// HIGHLIGHT
// =======================================

function updateHighlight() {
    const text = codeInput.value;
    bfState.unmatchedBrackets = findUnmatchedBrackets(text);
    let html = '';
    for (let i = 0; i < text.length; i++) {
        html += getSpanHTML(text[i], i);
    }
    highlightCode.innerHTML = html || '<span class="bf-comment">&#8203;</span>';
}

function scrollToActiveInstruction() {
    if (!bfState.sessionActive) return;
    const text = codeInput.value;
    // Map pure IP to its raw position in the source text.
    const rawIp = bfState.ipMap ? bfState.ipMap[bfState.ip] : bfState.ip;
    if (rawIp === undefined || rawIp >= text.length) return;
    // Compute line number for the raw IP position.
    let line = 0;
    for (let i = 0; i < rawIp && i < text.length; i++) {
        if (text[i] === '\n') line++;
    }
    const lineHeight = parseFloat(getComputedStyle(codeInput).lineHeight) || 16;
    // Keep the active line ~30% from the top of the visible editor area.
    const containerHeight = codeInput.clientHeight;
    codeInput.scrollTop = Math.max(0, line * lineHeight - containerHeight * 0.3);
    const pre = codeInput.parentElement.querySelector('.highlight-layer');
    if (pre) pre.scrollTop = codeInput.scrollTop;
}

// =======================================
// SESSION / STATE MANAGEMENT
// =======================================

function snapshotState() {
    return {
        tape: [...bfState.tape],
        pointer: bfState.pointer,
        ip: bfState.ip,
        output: bfState.output,
        lastInput: bfState.lastInput,
        inputPending: bfState.inputPending
    };
}

function restoreState(s) {
    bfState.tape = [...s.tape];
    bfState.pointer = s.pointer;
    bfState.ip = s.ip;
    bfState.output = s.output;
    bfState.lastInput = s.lastInput;
    bfState.inputPending = false; // always clear on restore; we'll re-trigger on next step
    disableTerminalInput();
}

function pushHistory() {
    // Truncate any "future" branches (if user stepped back then forward)
    bfState.history = bfState.history.slice(0, bfState.historyIndex + 1);
    bfState.history.push(snapshotState());
    // Cap history at 1,000 entries; drop the oldest if exceeded.
    if (bfState.history.length > 1000) {
        bfState.history.shift();
    }
    bfState.historyIndex = bfState.history.length - 1;
}

function createSession() {
    const rawCode = codeInput.value;
    // Precompile: filter out non-command chars (comments/whitespace/newlines).
    const pureChars = [];
    const ipMap = []; // ipMap[pureIndex] = rawIndex
    for (let i = 0; i < rawCode.length; i++) {
        if (BF_COMMANDS.indexOf(rawCode[i]) !== -1) {
            pureChars.push(rawCode[i]);
            ipMap.push(i);
        }
    }
    if (pureChars.length > 1_000_000) {
        alert(`Program too large: ${pureChars.length.toLocaleString()} commands exceed the 1,000,000 limit.`);
        return false;
    }

    bfState.sessionActive = true;
    bfState.rawCode = rawCode;
    bfState.code = pureChars.join('');
    bfState.ipMap = ipMap;
    bfState.tape = [0];
    bfState.pointer = 0;
    bfState.ip = 0;
    bfState.output = '';
    bfState.loopStack = [];
    bfState.inputPending = false;
    bfState.lastInput = null;
    bfState.errorMsg = '';
    bfState.running = false;
    bfState.skipBreakpointOnce = false;
    bfState.history = [snapshotState()];
    bfState.historyIndex = 0;
    codeInput.readOnly = true;
    updateUI();
    return true;
}

function endSession() {
    bfState.sessionActive = false;
    stopRunning();
    bfState.breakpoints.clear();
    bfState.tape = [0];
    bfState.pointer = 0;
    bfState.ip = 0;
    bfState.output = '';
    bfState.history = [];
    bfState.historyIndex = -1;
    bfState.inputPending = false;
    bfState.lastInput = null;
    bfState.errorMsg = '';
    bfState.startedByRun = false;
    bfState.status = 'idle';
    codeInput.readOnly = false;
    disableTerminalInput();
    updateHighlight();
    updateUI();
}

// =======================================
// BRAINFUCK INTERPRETER
// =======================================

// Execute one instruction. Returns:
//   'advanced' — IP moved (normal step or jump)
//   'input'    — paused on `,` waiting for user input (IP not advanced)
//   'halt'     — could not step (end of code or unmatched bracket)
function stepOnce() {
    if (bfState.ip >= bfState.code.length) return 'halt';
    const c = bfState.code[bfState.ip];
    switch (c) {
        case '>':
            bfState.pointer++;
            if (bfState.pointer >= 10000) {
                bfState.errorMsg = 'Tape limit reached (10,000 cells)';
                return 'halt';
            }
            if (bfState.pointer >= bfState.tape.length) bfState.tape.push(0);
            break;
        case '<':
            bfState.pointer = Math.max(0, bfState.pointer - 1);
            if (bfState.pointer < 0) bfState.pointer = 0;
            break;
        case '+':
            bfState.tape[bfState.pointer] = (bfState.tape[bfState.pointer] + 1) % 256;
            break;
        case '-':
            bfState.tape[bfState.pointer] = (bfState.tape[bfState.pointer] + 255) % 256;
            break;
        case '.':
            if (bfState.output.length >= 10000) {
                bfState.errorMsg = 'Output limit reached (10,000 chars)';
                return 'halt';
            }
            bfState.output += String.fromCharCode(bfState.tape[bfState.pointer]);
            break;
        case ',':
            if (bfState.config.pauseOnInput) {
                // Pause and wait for input — do NOT advance IP.
                bfState.inputPending = true;
                enableTerminalInput();
                return 'input';
            }
            // Auto-skip: write 0 and continue (no pause).
            bfState.tape[bfState.pointer] = 0;
            break;
        case '[':
            if (bfState.tape[bfState.pointer] === 0) {
                const m = findMatchingBracket(bfState.code, bfState.ip, 1);
                if (m === -1) return 'halt'; // unmatched; halt
                bfState.ip = m;
            }
            break;
        case ']':
            if (bfState.tape[bfState.pointer] !== 0) {
                const m = findMatchingBracket(bfState.code, bfState.ip, -1);
                if (m === -1) return 'halt'; // unmatched; halt
                bfState.ip = m;
            }
            break;
        // non-command chars: ignored (comments)
    }
    bfState.ip++;
    return 'advanced';
}

// =======================================
// DEBUGGER CONTROLS
// =======================================

function startRun() {
    if (bfState.inputPending) return; // must input first
    bfState.startedByRun = true; // 标记为 Run 触发
    if (!bfState.sessionActive) {
        if (!createSession()) return; // too large, aborted
        bfState.status = 'running';
    };
    if (bfState.ip >= bfState.code.length) return;

    // If we're sitting on a breakpoint, skip the breakpoint check on first step.
    // Breakpoints are stored as raw indices; map pure IP back to raw.
    if (bfState.breakpoints.has(bfState.ipMap[bfState.ip])) {
        bfState.skipBreakpointOnce = true;
    }

    bfState.running = true;
    bfState.status = 'running'; // make sure it is correct
    if (bfState.stepInterval) clearInterval(bfState.stepInterval);
    bfState.stepInterval = setInterval(runStep, bfState.config.stepIntervalMs);
    updateUI();
}

function runStep() {
    if (bfState.skipBreakpointOnce) {
        bfState.skipBreakpointOnce = false;
    } else if (bfState.breakpoints.has(bfState.ipMap[bfState.ip])) {
        // Pause at breakpoint
        stopRunning();
        bfState.status = 'paused';
        updateUI();
        return;
    }

    const status = stepOnce();

    if (status === 'halt') {
        stopRunning();
        bfState.status = bfState.errorMsg ? 'idle' : 'finished';
        updateUI();
        return;
    }

    // Push the resulting state — including the input-paused state — so that
    // Step Back from an input pause correctly returns to the pre-`,` state.
    pushHistory();

    if (status === 'input') {
        stopRunning();
        bfState.status = 'waiting';
        updateUI();
        return;
    }

    updateUI();

    if (bfState.ip >= bfState.code.length) {
        stopRunning();
        bfState.status = 'finished';
        updateUI();
    }
}

function stepOver() {
    if (bfState.inputPending) return;
    bfState.startedByRun = false; // 标记为 Step 触发
    if (!bfState.sessionActive) {
        if (!createSession()) return; // too large, aborted
        bfState.status = 'paused';
    }
    if (bfState.ip >= bfState.code.length) return;

    const status = stepOnce();

    if (status === 'halt') {
        bfState.status = bfState.errorMsg ? 'idle' : 'finished';
        updateUI();
        return;
    }

    // Push the resulting state (including input-paused state).
    pushHistory();
    bfState.status = status === 'input' ? 'waiting' : 'paused';
    updateUI();
}

function stepBack() {
    if (!bfState.sessionActive) return;
    if (bfState.historyIndex > 0) {
        bfState.historyIndex--;
        restoreState(bfState.history[bfState.historyIndex]);
        // Per spec: if we stepped back to before a `,`, clear lastInput
        // (the next Step Over past `,` will re-request user input).
        if (bfState.code[bfState.ip] === ',') {
            bfState.lastInput = null;
        }
        bfState.status = 'paused';
        updateUI();
    }
}

function resetSession() {
    if (!bfState.sessionActive) return;
    stopRunning();
    bfState.tape = [0];
    bfState.pointer = 0;
    bfState.ip = 0;
    bfState.output = '';
    bfState.inputPending = false;
    bfState.lastInput = null;
    bfState.errorMsg = '';
    bfState.skipBreakpointOnce = false;
    bfState.startedByRun = false;
    bfState.status = 'ready';
    disableTerminalInput();
    bfState.history = [snapshotState()];
    bfState.historyIndex = 0;
    updateHighlight();
    updateUI();
}

function stopRunning() {
    bfState.running = false;
    if (bfState.stepInterval) {
        clearInterval(bfState.stepInterval);
        bfState.stepInterval = null;
    }
}

// =======================================
// TERMINAL INPUT
// =======================================

function enableTerminalInput() {
    terminalInput.disabled = false;
    terminalSend.disabled = false;
    terminalSend.hidden = false;
    terminalInput.placeholder = 'Enter a character...';
    terminalInput.value = '';
    terminalInput.focus();
}

function disableTerminalInput() {
    terminalInput.disabled = true;
    terminalSend.disabled = true;
    terminalSend.hidden = true;
    terminalInput.placeholder = 'Waiting for input...';
    terminalInput.value = '';
}

function submitTerminalInput() {
    if (!bfState.inputPending) return;
    const raw = terminalInput.value;
    if (raw.length === 0) return;
    const ch = raw.charAt(0);
    // Clamp input byte to 0-255 (cell values wrap mod 256; & 0xFF masks to a byte).
    const codeVal = ch.charCodeAt(0) & 0xFF;
    bfState.tape[bfState.pointer] = codeVal;
    bfState.lastInput = ch;
    bfState.inputPending = false;
    disableTerminalInput();
    bfState.ip++; // advance past the `,`
    pushHistory();

    if (bfState.startedByRun) {
        // Run 触发的 → 输入完成后自动继续全速运行
        startRun();
    } else {
        // Step 触发的 → 输入完成后停在原处
        bfState.status = 'paused';
        updateUI();
    }
}

// =======================================
// TAPE RENDERING
// =======================================

function getVisibleRange(tape, pointer, visibleCount) {
    const total = tape.length;
    if (total <= visibleCount) {
        return { start: 0, end: total };
    }
    let start = Math.max(0, pointer - Math.floor(visibleCount / 2));
    let end = Math.min(total, start + visibleCount);
    if (end - start < visibleCount) {
        start = Math.max(0, end - visibleCount);
    }
    return { start, end };
}

function computeVisibleCount() {
    const w = debuggerPanel.clientWidth - 24; // padding
    const cellW = 42; // approx (min-width 38 + gap)
    const fit = Math.max(1, Math.floor(w / cellW));
    return Math.min(10, fit);
}

function renderTape() {
    const visibleCount = computeVisibleCount();
    const { start, end } = getVisibleRange(bfState.tape, bfState.pointer, visibleCount);
    let html = '';
    for (let i = start; i < end; i++) {
        const isPtr = i === bfState.pointer;
        const val = bfState.tape[i] ?? 0;
        const cls = 'tape-cell' + (isPtr ? ' tape-pointer' : '');
        html += `<div class="${cls}" data-cell="${i}"><span class="cell-idx">${i}</span><span class="cell-val">${val}</span></div>`;
    }
    // If pointer is beyond visible range, show empty
    if (end - start === 0) {
        html = '<div class="tape-cell"><span class="cell-val">0</span></div>';
    }
    tapeEl.innerHTML = html;
}

// =======================================
// UI UPDATE
// =======================================

function updateUI() {
    updateHighlight();
    scrollToActiveInstruction();
    renderTape();
    outputEl.textContent = bfState.output;

    const cellVal = bfState.tape[bfState.pointer] ?? 0;
    const charDisplay = (cellVal >= 32 && cellVal <= 126)
        ? `'${String.fromCharCode(cellVal)}'`
        : '';
    if (bfState.errorMsg) {
        dbgStatus.textContent = bfState.errorMsg;
    } else {
        dbgStatus.innerHTML = `Status: <span class="dbg-status-${bfState.status}">${STATUS_MAP[bfState.status]}</span> | IP: ${bfState.ip} | Cell[${bfState.pointer}] = ${cellVal}${charDisplay ? ' (' + charDisplay + ')' : ''} | Breakpoints: ${bfState.breakpoints.size}`;
    }

    // Button enabled/disabled states
    btnRun.disabled = bfState.inputPending || (bfState.sessionActive && bfState.ip >= bfState.code.length);
    btnStep.disabled = bfState.inputPending || (bfState.sessionActive && bfState.ip >= bfState.code.length);
    btnStepBack.disabled = !bfState.sessionActive || bfState.historyIndex <= 0;
    btnReset.disabled = !bfState.sessionActive;
    btnDone.disabled = !bfState.sessionActive;
}

// =======================================
// BREAKPOINTS
// =======================================

function toggleBreakpointMode() {
    bfState.breakpointMode = !bfState.breakpointMode;
    body.classList.toggle('bp-mode', bfState.breakpointMode);
    l(`Breakpoint mode: ${bfState.breakpointMode}`);
}

function toggleBreakpoint(ip) {
    if (bfState.breakpoints.has(ip)) {
        bfState.breakpoints.delete(ip);
    } else {
        bfState.breakpoints.add(ip);
    }
    updateHighlight();
    updateUI();
}

function clearAllBreakpoints() {
    bfState.breakpoints.clear();
    updateHighlight();
    updateUI();
}

// =======================================
// FILE MENU
// =======================================

const HELLO_WORLD_PROGRAM = HELLO_WORLD_BF;

function actionStartOver() {
    stopRunning();
    codeInput.value = '';
    codeInput.readOnly = false;
    bfState.sessionActive = false;
    bfState.tape = [0];
    bfState.pointer = 0;
    bfState.ip = 0;
    bfState.output = '';
    bfState.history = [];
    bfState.historyIndex = -1;
    bfState.inputPending = false;
    bfState.lastInput = null;
    bfState.breakpoints.clear();
    bfState.status = 'idle';
    disableTerminalInput();
    updateHighlight();
    updateUI();
}

function actionLoadFile() {
    fileInput.value = ''; // reset so selecting same file re-triggers change
    fileInput.click();
}

function actionLoadHello() {
    stopRunning();
    codeInput.value = HELLO_WORLD_PROGRAM;
    codeInput.readOnly = false;
    bfState.sessionActive = false;
    bfState.tape = [0];
    bfState.pointer = 0;
    bfState.ip = 0;
    bfState.output = '';
    bfState.history = [];
    bfState.historyIndex = -1;
    bfState.inputPending = false;
    bfState.lastInput = null;
    bfState.breakpoints.clear();
    bfState.status = 'ready';
    disableTerminalInput();
    updateHighlight();
    updateUI();
}

function handleFileLoad(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        stopRunning();
        codeInput.value = e.target.result;
        codeInput.readOnly = false;
        bfState.sessionActive = false;
        bfState.tape = [0];
        bfState.pointer = 0;
        bfState.ip = 0;
        bfState.output = '';
        bfState.history = [];
        bfState.historyIndex = -1;
        bfState.inputPending = false;
        bfState.lastInput = null;
        bfState.breakpoints.clear();
        bfState.status = 'ready';
        disableTerminalInput();
        updateHighlight();
        updateUI();
    };
    reader.onerror = () => {
        l(`Failed to read file: ${file.name}`, true);
        alert(`Failed to read file: ${file.name}`);
    };
    reader.readAsText(file);
    updateUI();
}

// =======================================
// MENU DROPDOWN LOGIC
// =======================================

function closeAllMenus() {
    document.querySelectorAll('.menu.open').forEach(m => m.classList.remove('open'));
}

toolbar.addEventListener('click', (e) => {
    const trigger = e.target.closest('.menu-trigger');
    if (trigger) {
        const menu = trigger.parentElement;
        const wasOpen = menu.classList.contains('open');
        closeAllMenus();
        if (!wasOpen) menu.classList.add('open');
        e.stopPropagation();
        return;
    }
    const item = e.target.closest('.menu-dropdown button');
    if (item) {
        const action = item.dataset.action;
        closeAllMenus();
        handleMenuAction(action);
        return;
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu')) closeAllMenus();
});

function handleMenuAction(action) {
    switch (action) {
        case 'start-over': actionStartOver(); break;
        case 'load-file': actionLoadFile(); break;
        case 'load-hello': actionLoadHello(); break;
        case 'breakpoint-mode': toggleBreakpointMode(); break;
        case 'clear-breakpoints': clearAllBreakpoints(); break;
        case 'open-settings': openSettings(); break;
        case 'open-help': openHelp(); break;
    }
}

// =======================================
// SETTINGS PANEL
// =======================================

async function enumerateFonts() {
    // Try the spec's API first (navigator.fonts.query)
    try {
        if (navigator.fonts && typeof navigator.fonts.query === 'function') {
            const result = await navigator.fonts.query();
            if (result) {
                const list = [];
                for (const f of result) {
                    if (f && f.family) list.push(f.family);
                }
                if (list.length > 0) return Array.from(new Set(list)).sort();
            }
        }
    } catch (err) {
        l(`navigator.fonts.query failed: ${err}`);
    }
    // Fall back to the Local Font Access API (window.queryLocalFonts)
    try {
        if (typeof window.queryLocalFonts === 'function') {
            const fonts = await window.queryLocalFonts();
            if (fonts && fonts.length > 0) {
                return Array.from(new Set(fonts.map(f => f.family))).sort();
            }
        }
    } catch (err) {
        l(`queryLocalFonts failed: ${err}`);
    }
    return null;
}

function setSyntaxTabActive(tab) {
    bfState.settingsSynTheme = (tab === 'light') ? 'light' : 'dark';
    document.querySelectorAll('.syn-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.synTheme === bfState.settingsSynTheme);
    });
    populateSyntaxUI();
}

function populateSyntaxUI() {
    const cfg = bfState.config.syntax[bfState.settingsSynTheme] || bfState.config.syntax.dark;
    const rows = syntaxConfigEl.querySelectorAll('.syntax-row');
    rows.forEach(row => {
        const ch = row.dataset.char;
        if (!cfg[ch]) return;
        const colorInput = row.querySelector('.syn-color');
        const styleSelect = row.querySelector('.syn-style');
        colorInput.value = cfg[ch].color;
        styleSelect.value = cfg[ch].style;
    });
}

function readSyntaxUI() {
    const syntax = {};
    const rows = syntaxConfigEl.querySelectorAll('.syntax-row');
    rows.forEach(row => {
        const ch = row.dataset.char;
        const colorInput = row.querySelector('.syn-color');
        const styleSelect = row.querySelector('.syn-style');
        syntax[ch] = {
            color: colorInput.value,
            style: styleSelect.value
        };
    });
    return syntax;
}

// Snapshot of config taken when settings open, used by Cancel to discard edits
let settingsSnapshot = null;

function openSettings() {
    // Snapshot current config so Cancel can revert any live changes (incl. Restore Defaults)
    settingsSnapshot = {
        font: bfState.config.font,
        fontSize: bfState.config.fontSize,
        showBackground: bfState.config.showBackground,
        theme: bfState.config.theme,
        saveThemePreference: bfState.config.saveThemePreference,
        stepIntervalMs: bfState.config.stepIntervalMs,
        pauseOnInput: bfState.config.pauseOnInput,
        syntax: {
            dark: cloneSyntax(bfState.config.syntax.dark),
            light: cloneSyntax(bfState.config.syntax.light)
        }
    };
    // populate font
    settingFontInput.value = bfState.config.font;
    settingFontSelect.innerHTML = '';
    enumerateFonts().then(list => {
        if (list && list.length > 0) {
            settingFontSelect.hidden = false;
            settingFontInput.hidden = true;
            list.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f;
                opt.textContent = f;
                if (f === bfState.config.font) opt.selected = true;
                settingFontSelect.appendChild(opt);
            });
            // also include manual input as fallback option
            const opt = document.createElement('option');
            opt.value = '__custom__';
            opt.textContent = 'Custom...';
            settingFontSelect.appendChild(opt);
        } else {
            settingFontSelect.hidden = true;
            settingFontInput.hidden = false;
        }
    });

    settingFontsize.value = bfState.config.fontSize;
    settingFontsizeValue.value = bfState.config.fontSize;
    settingShowBg.checked = bfState.config.showBackground;
    settingPauseOnInput.checked = bfState.config.pauseOnInput;
    settingStepInterval.value = bfState.config.stepIntervalMs;
    settingStepIntervalValue.value = bfState.config.stepIntervalMs;
    updateThemePrefsStatus();

    // Initialize syntax tab to match current UI theme, then populate
    setSyntaxTabActive(bfState.config.theme);

    settingsModal.hidden = false;
}

function closeSettings() {
    settingsModal.hidden = true;
}

function cancelSettings() {
    // Revert any live changes (slider edits, Restore Defaults) to the snapshot
    if (settingsSnapshot) {
        const s = settingsSnapshot;
        bfState.config.font = s.font;
        bfState.config.fontSize = s.fontSize;
        bfState.config.showBackground = s.showBackground;
        bfState.config.theme = s.theme;
        bfState.config.saveThemePreference = s.saveThemePreference;
        bfState.config.stepIntervalMs = s.stepIntervalMs;
        bfState.config.pauseOnInput = s.pauseOnInput;
        bfState.config.syntax.dark = cloneSyntax(s.syntax.dark);
        bfState.config.syntax.light = cloneSyntax(s.syntax.light);
        applyTheme(s.theme);
        applyConfig();
        applyBackgroundSetting();
        updateHighlight();
    }
    settingsSnapshot = null;
    closeSettings();
}

function restoreDefaults() {
    // Reset config to factory defaults
    bfState.config.font = 'Consolas';
    bfState.config.fontSize = 16;
    bfState.config.showBackground = true;
    bfState.config.theme = 'dark';
    bfState.config.saveThemePreference = false;
    bfState.config.stepIntervalMs = DEFAULT_STEP_INTERVAL_MS;
    bfState.config.pauseOnInput = true;
    bfState.config.syntax.dark = cloneSyntax(DARK_SYNTAX_DEFAULT);
    bfState.config.syntax.light = cloneSyntax(LIGHT_SYNTAX_DEFAULT);

    // Sync UI controls
    settingFontInput.value = bfState.config.font;
    settingFontsize.value = bfState.config.fontSize;
    settingFontsizeValue.value = bfState.config.fontSize;
    settingShowBg.checked = bfState.config.showBackground;
    settingPauseOnInput.checked = bfState.config.pauseOnInput;
    settingStepInterval.value = bfState.config.stepIntervalMs;
    settingStepIntervalValue.value = bfState.config.stepIntervalMs;

    // Sync font select if visible
    if (!settingFontSelect.hidden) {
        const opt = Array.from(settingFontSelect.options).find(o => o.value === bfState.config.font);
        if (opt) {
            settingFontSelect.value = bfState.config.font;
        } else {
            settingFontSelect.value = '__custom__';
        }
    }

    // Reset syntax table for the currently-edited theme
    setSyntaxTabActive(bfState.config.theme);
    populateSyntaxUI();

    // Apply live so the user can preview the restored state
    applyTheme('dark');
    applyConfig();
    applyBackgroundSetting();
    updateHighlight();
    updateThemePrefsStatus();
    // Keep the modal open — user decides whether to Save or Cancel
}

function saveSettings() {
    // font
    let font;
    if (!settingFontSelect.hidden && settingFontSelect.value && settingFontSelect.value !== '__custom__') {
        font = settingFontSelect.value;
    } else {
        font = settingFontInput.value.trim() || 'Consolas';
    }
    bfState.config.font = font;

    // font size
    const size = parseInt(settingFontsize.value, 10);
    if (!isNaN(size)) bfState.config.fontSize = Math.max(10, Math.min(32, size));

    // background
    bfState.config.showBackground = settingShowBg.checked;
    applyBackgroundSetting();

    // pause on input
    bfState.config.pauseOnInput = settingPauseOnInput.checked;

    // run speed (immediate effect: restart the run interval if currently running)
    const stepMs = parseInt(settingStepInterval.value, 10);
    if (!isNaN(stepMs)) {
        bfState.config.stepIntervalMs = Math.max(8, Math.min(1000, stepMs));
        if (bfState.running && bfState.stepInterval) {
            clearInterval(bfState.stepInterval);
            bfState.stepInterval = setInterval(runStep, bfState.config.stepIntervalMs);
        }
    }

    // syntax: save the tab we just edited, leaving the other theme's config untouched
    const edited = readSyntaxUI();
    bfState.config.syntax[bfState.settingsSynTheme] = edited;

    applyConfig();
    updateHighlight();
    persistConfig(); // persist all settings (including restored defaults) to localStorage
    updateThemePrefsStatus();
    settingsSnapshot = null; // changes committed; discard snapshot
    closeSettings();
}

function applyBackgroundSetting() {
    if (bfState.config.showBackground) {
        window.typingActive = true;
        code.style.display = '';
        document.getElementById('code-bg-margin').style.display = '';
    } else {
        window.typingActive = false;
        code.style.display = 'none';
        document.getElementById('code-bg-margin').style.display = 'none';
    }
}

function quoteFont(font) {
    // Strip surrounding quotes (single or double) then wrap in single quotes
    const trimmed = String(font || '').replace(/^['"]|['"]$/g, '').trim();
    return `'${trimmed}'`;
}

function applyConfig() {
    const fontFamily = quoteFont(bfState.config.font) + ', monospace';
    document.documentElement.style.setProperty('--bf-font', fontFamily);
    codeInput.style.fontFamily = fontFamily;
    codeInput.style.fontSize = bfState.config.fontSize + 'px';
    highlightCode.style.fontFamily = fontFamily;
    highlightCode.style.fontSize = bfState.config.fontSize + 'px';
    code.style.fontSize = bfState.config.fontSize + 'px';
}

function themePrefsSaved() {
    return !!localStorage.getItem('bf-config');
}

function updateThemePrefsStatus() {
    if (!themePrefsStatus) return;
    if (themePrefsSaved()) {
        themePrefsStatus.textContent = 'Theme saved';
    } else {
        themePrefsStatus.textContent = 'Default theme';
    }
}

function saveThemePrefs() {
    persistConfig();
    updateThemePrefsStatus();
}

function clearThemePrefs() {
    // Remove all persisted preference keys.
    localStorage.removeItem('bf-config');
    localStorage.removeItem('bf-theme');
    localStorage.removeItem('bf-syntax-config');
    localStorage.removeItem('bf-syntax-dark');
    localStorage.removeItem('bf-syntax-light');

    // Restore defaults.
    bfState.config.font = 'Consolas';
    bfState.config.fontSize = 16;
    bfState.config.showBackground = true;
    bfState.config.stepIntervalMs = DEFAULT_STEP_INTERVAL_MS;
    bfState.config.theme = 'dark';
    bfState.config.syntax.dark = cloneSyntax(DARK_SYNTAX_DEFAULT);
    bfState.config.syntax.light = cloneSyntax(LIGHT_SYNTAX_DEFAULT);

    applyTheme('dark');
    applyConfig();
    applyBackgroundSetting();
    updateHighlight();
    updateThemePrefsStatus();
}

function mergeOneSyntax(saved, base) {
    const merged = cloneSyntax(base);
    for (const k of Object.keys(saved || {})) {
        if (merged[k] && saved[k].color && saved[k].style) {
            merged[k] = { color: saved[k].color, style: saved[k].style };
        }
    }
    return merged;
}

function persistConfig() {
    try {
        localStorage.setItem('bf-config', JSON.stringify({
            theme: bfState.config.theme,
            font: bfState.config.font,
            fontSize: bfState.config.fontSize,
            showBackground: bfState.config.showBackground,
            stepIntervalMs: bfState.config.stepIntervalMs,
            pauseOnInput: bfState.config.pauseOnInput,
            syntax: {
                dark: bfState.config.syntax.dark,
                light: bfState.config.syntax.light
            }
        }));
        // Also keep per-theme keys for backward compatibility.
        localStorage.setItem('bf-syntax-dark', JSON.stringify(bfState.config.syntax.dark));
        localStorage.setItem('bf-syntax-light', JSON.stringify(bfState.config.syntax.light));
    } catch (e) {
        l(`Failed to persist config: ${e}`);
    }
}

function loadConfig() {
    try {
        const raw = localStorage.getItem('bf-config');
        if (raw) {
            const saved = JSON.parse(raw);
            if (saved.theme === 'dark' || saved.theme === 'light') bfState.config.theme = saved.theme;
            if (saved.font) bfState.config.font = saved.font;
            if (saved.fontSize) bfState.config.fontSize = saved.fontSize;
            if (typeof saved.showBackground === 'boolean') bfState.config.showBackground = saved.showBackground;
            if (typeof saved.stepIntervalMs === 'number' && saved.stepIntervalMs >= 8 && saved.stepIntervalMs <= 1000) bfState.config.stepIntervalMs = saved.stepIntervalMs;
            if (typeof saved.pauseOnInput === 'boolean') bfState.config.pauseOnInput = saved.pauseOnInput;

            // Nested per-theme syntax stored in bf-config
            if (saved.syntax) {
                if (saved.syntax.dark) bfState.config.syntax.dark = mergeOneSyntax(saved.syntax.dark, DARK_SYNTAX_DEFAULT);
                if (saved.syntax.light) bfState.config.syntax.light = mergeOneSyntax(saved.syntax.light, LIGHT_SYNTAX_DEFAULT);
            }
            // Legacy flat single syntax object → treat as dark theme
            if (saved.syntax && saved.syntax['>']) {
                bfState.config.syntax.dark = mergeOneSyntax(saved.syntax, DARK_SYNTAX_DEFAULT);
            }
        }

        // Modern per-theme storage (takes precedence)
        const darkRaw = localStorage.getItem('bf-syntax-dark');
        if (darkRaw) {
            const parsed = JSON.parse(darkRaw);
            bfState.config.syntax.dark = mergeOneSyntax(parsed, DARK_SYNTAX_DEFAULT);
        }
        const lightRaw = localStorage.getItem('bf-syntax-light');
        if (lightRaw) {
            const parsed = JSON.parse(lightRaw);
            bfState.config.syntax.light = mergeOneSyntax(parsed, LIGHT_SYNTAX_DEFAULT);
        }

        // Legacy combined key
        const synRaw = localStorage.getItem('bf-syntax-config');
        if (synRaw) {
            const parsed = JSON.parse(synRaw);
            if (parsed && parsed['>']) {
                // Old flat storage - treat as dark syntax
                bfState.config.syntax.dark = mergeOneSyntax(parsed, DARK_SYNTAX_DEFAULT);
            } else if (parsed && (parsed.dark || parsed.light)) {
                if (parsed.dark) bfState.config.syntax.dark = mergeOneSyntax(parsed.dark, DARK_SYNTAX_DEFAULT);
                if (parsed.light) bfState.config.syntax.light = mergeOneSyntax(parsed.light, LIGHT_SYNTAX_DEFAULT);
            }
        }
    } catch (e) {
        l(`Failed to load config: ${e}`);
    }
}

// =======================================
// HELP PANEL
// =======================================

function openHelp() {
    helpModal.hidden = false;
}

function closeHelp() {
    helpModal.hidden = true;
}

// =======================================
// THEME
// =======================================

function applyTheme(theme) {
    bfState.config.theme = theme;
    if (theme === 'light') {
        body.classList.add('light-theme');
        themeswitch.innerHTML = sunSVG;
    } else {
        body.classList.remove('light-theme');
        themeswitch.innerHTML = moonSVG;
    }
    // `activeSyntax()` picks the theme-appropriate config map automatically.
    updateHighlight();
}

function toggleTheme() {
    const newTheme = body.classList.contains('light-theme') ? 'dark' : 'light';
    applyTheme(newTheme);
    // Theme is persisted only when the user explicitly clicks "Save Theme Preferences".
}

// =======================================
// EVENT LISTENERS
// =======================================

themeswitch.addEventListener('click', toggleTheme);

codeInput.addEventListener('input', updateHighlight);

codeInput.addEventListener('scroll', () => {
    const code = document.getElementById('highlightCode');
    code.scrollTop = codeInput.scrollTop;
    code.scrollLeft = codeInput.scrollLeft;
});

// Debug controls
btnRun.addEventListener('click', () => {
    if (bfState.running) {
        // Pause
        stopRunning();
        updateUI();
    } else {
        startRun();
    }
});

btnStep.addEventListener('click', stepOver);
btnStepBack.addEventListener('click', stepBack);
btnReset.addEventListener('click', resetSession);
btnDone.addEventListener('click', endSession);

// Terminal input — submitted only on Enter or Send button (no auto-submit on input).
terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && bfState.inputPending) {
        e.preventDefault();
        submitTerminalInput();
    }
});

terminalSend.addEventListener('click', () => {
    if (bfState.inputPending) submitTerminalInput();
});

// File input
fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    handleFileLoad(file);
});

// Breakpoint clicks (only active in breakpoint mode via CSS pointer-events)
highlightCode.addEventListener('click', (e) => {
    if (!bfState.breakpointMode) return;
    let target = e.target;
    while (target && target !== highlightCode) {
        if (target.dataset && target.dataset.ip !== undefined) {
            const ip = parseInt(target.dataset.ip, 10);
            if (!isNaN(ip)) {
                toggleBreakpoint(ip);
                e.preventDefault();
            }
            return;
        }
        target = target.parentElement;
    }
});

// Settings modal — bidirectional sync between sliders and numeric inputs
function clampNumValue(input, min, max) {
    let v = input.value;
    if (v === '' || v === null) {
        v = min;
    }
    let n = parseInt(v, 10);
    if (isNaN(n)) n = min;
    if (n < min) n = min;
    if (n > max) n = max;
    input.value = String(n);
    return n;
}
settingFontsize.addEventListener('input', () => {
    settingFontsizeValue.value = settingFontsize.value;
});
settingStepInterval.addEventListener('input', () => {
    settingStepIntervalValue.value = settingStepInterval.value;
});
settingFontsizeValue.addEventListener('input', () => {
    const n = clampNumValue(settingFontsizeValue, 10, 32);
    settingFontsize.value = String(n);
    bfState.config.fontSize = n;
    applyConfig();
});
settingStepIntervalValue.addEventListener('input', () => {
    const n = clampNumValue(settingStepIntervalValue, 8, 1000);
    settingStepInterval.value = String(n);
    bfState.config.stepIntervalMs = n;
    if (bfState.running && bfState.stepInterval) {
        clearInterval(bfState.stepInterval);
        bfState.stepInterval = setInterval(runStep, bfState.config.stepIntervalMs);
    }
});
btnSaveThemePrefs.addEventListener('click', saveThemePrefs);
btnClearThemePrefs.addEventListener('click', clearThemePrefs);
settingFontSelect.addEventListener('change', () => {
    if (settingFontSelect.value === '__custom__') {
        settingFontSelect.hidden = true;
        settingFontInput.hidden = false;
        settingFontInput.focus();
    }
});

// Settings: Advanced syntax tabs — Dark / Light
document.querySelectorAll('.syn-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
        const t = tabBtn.dataset.synTheme;
        if (t === 'dark' || t === 'light') setSyntaxTabActive(t);
    });
});

document.getElementById('settings-save').addEventListener('click', saveSettings);
document.getElementById('settings-cancel').addEventListener('click', cancelSettings);
document.getElementById('settings-restore-defaults').addEventListener('click', restoreDefaults);
document.getElementById('help-close').addEventListener('click', closeHelp);

// Click outside modal to close
[settingsModal, helpModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            // Settings modal: discard live changes (Cancel semantics).
            // Help modal: just close.
            if (modal === settingsModal) cancelSettings();
            else modal.hidden = true;
        }
    });
});

// Window resize: re-render tape
window.addEventListener('resize', () => {
    renderTape();
});

// =======================================
// KEYBOARD SHORTCUTS
// =======================================

document.addEventListener('keydown', (e) => {
    // Don't intercept shortcuts while focus is in terminal input waiting for input
    // (except for global ones like F1)
    const inTerminal = document.activeElement === terminalInput && !terminalInput.disabled;
    const inModal = !settingsModal.hidden || !helpModal.hidden;

    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;

    // Escape closes any open modal or menu
    if (e.key === 'Escape') {
        if (!settingsModal.hidden) { cancelSettings(); e.preventDefault(); return; }
        if (!helpModal.hidden) { closeHelp(); e.preventDefault(); return; }
        closeAllMenus();
        return;
    }

    // F1 — Help (always works)
    if (e.key === 'F1') {
        e.preventDefault();
        openHelp();
        return;
    }

    // If a modal is open, only Escape (above) and F1 work
    if (inModal) return;

    // F5 — Run
    if (e.key === 'F5') {
        e.preventDefault();
        if (bfState.running) { stopRunning(); updateUI(); } else { startRun(); }
        return;
    }

    // F10 — Step Over
    if (e.key === 'F10') {
        e.preventDefault();
        stepOver();
        return;
    }

    // F9 — Step Back
    if (e.key === 'F9') {
        e.preventDefault();
        stepBack();
        return;
    }

    // Ctrl+Shift+R — Reset
    if (ctrl && shift && (e.key === 'R' || e.key === 'r')) {
        e.preventDefault();
        resetSession();
        return;
    }

    // Ctrl+Shift+D — Done
    if (ctrl && shift && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        endSession();
        return;
    }

    // Ctrl+Shift+N — Start Over
    if (ctrl && shift && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault();
        actionStartOver();
        return;
    }

    // Ctrl+O — Load file
    if (ctrl && !shift && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        actionLoadFile();
        return;
    }

    // Ctrl+Shift+H — Load Hello World
    if (ctrl && shift && (e.key === 'H' || e.key === 'h')) {
        e.preventDefault();
        actionLoadHello();
        return;
    }

    // Ctrl+B — Toggle breakpoint mode
    if (ctrl && !shift && (e.key === 'B' || e.key === 'b')) {
        e.preventDefault();
        toggleBreakpointMode();
        return;
    }

    // Ctrl+Shift+B — Clear all breakpoints
    if (ctrl && shift && (e.key === 'B' || e.key === 'b')) {
        e.preventDefault();
        clearAllBreakpoints();
        return;
    }

    // Ctrl+, — Open settings
    if (ctrl && !shift && e.key === ',') {
        e.preventDefault();
        openSettings();
        return;
    }

    // If terminal input is waiting, don't intercept other keys
    if (inTerminal) return;
});

// =======================================
// INITIALIZER
// =======================================

window.onload = () => {
    loadConfig();
    applyConfig();
    applyBackgroundSetting();

    // Restore theme from persisted config (defaults to dark if none saved).
    applyTheme(bfState.config.theme || 'dark');

    bfState.status = 'idle'; // enforce
    updateHighlight();
    updateUI();
};