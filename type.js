let sourceBf = null;
// `typingActive` exposed globally so script.js (settings panel) can stop/start the background animation.
window.typingActive = true;

function generateSourceBf() {
    let r = "";
    let choices = "+++---<<<>>>...,,,[]";
    for (let i = 0; i < 120; i++) {
        for (let j = 0; j < 80; j++) {
            r += choices[Math.floor(Math.random() * choices.length)];
        }
    }
    return r;
}

function getViewportCharCount() {
    const target = document.getElementById('code-bg');
    
    const char = document.createElement('span');
    char.textContent = 'W';
    char.style.position = 'absolute';
    char.style.visibility = 'hidden';
    char.style.fontFamily = getComputedStyle(target).fontFamily;
    char.style.fontSize = getComputedStyle(target).fontSize;
    document.body.appendChild(char);
    const charWidth = char.offsetWidth;
    document.body.removeChild(char);
    
    const lineHeight = parseFloat(getComputedStyle(target).lineHeight) || 16;
    
    const cols = Math.floor(target.clientWidth / charWidth);
    const rows = Math.floor(target.clientHeight / lineHeight);
    
    return cols * rows;
}

function charClass(char) {
    if ('<>'.includes(char)) return 'bf-pointer';
    if ('[]'.includes(char)) return 'bf-loop';
    if (char === '+') return 'bf-inc';
    if (char === '-') return 'bf-dec';
    if (char === '.') return 'bf-out';
    if (char === ',') return 'bf-in';
    return 'bf-comment';
}

function getSpan(char) {
    // return node according to our rules
    let chClass = charClass(char);
    const span = document.createElement('span');
    span.textContent = char;
    span.classList.add(chClass);
    return span;
}

// NOTE: `getSpanHTML` (config-aware) lives in script.js so the editor highlight
// layer can apply per-char user config. The background typing effect uses
// `getSpan` (DOM nodes) here and is unaffected.

function type(text) {
    const target = document.getElementById('code-bg');
    target.innerHTML = '';
    
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    target.appendChild(cursor);
    
    let viewportChars = getViewportCharCount();
    const chars = [...text];
    let index = 0;
    const BATCH_SIZE = 10;

    const MAX_CHARS = viewportChars * 3;
    const TARGET_CHARS = MAX_CHARS - 10; 
    
    
    let deleteAmount = viewportChars;
    
    l(`📊 视口: ${viewportChars}, 目标: ${TARGET_CHARS}, 初始删除: ${deleteAmount}`);
    
    let totalCharCount = 0;
    let lastTotal = 0;
    
    function getCharCount(node) {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent.length;
        if (node.tagName === 'BR') return 1;
        if (node.tagName === 'SPAN') return node.textContent.length;
        return 1;
    }
    
    function removeTopChars(count) {
        let removed = 0;
        const children = target.childNodes;
        
        for (let i = 0; i < children.length && removed < count; i++) {
            const node = children[i];
            if (node === cursor) continue;
            
            const charCount = getCharCount(node);
            
            if (removed + charCount > count) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const remain = count - removed;
                    node.textContent = node.textContent.slice(remain);
                    removed = count;
                    break;
                }
            }
            
            node.remove();
            removed += charCount;
            i--;
        }
        
        return removed;
    }
    
    function typeBatch() {
        if (!window.typingActive) {
            // we start a interval listening for restart
            l("HI!", true)
            const restartInterval = setInterval(() => {
                if (!!window.typingActive) {
                    requestAnimationFrame(typeBatch);
                    clearInterval(restartInterval);
                }
            }, 500);
            return;
        }
        
        for (let i = 0; i < BATCH_SIZE; i++) {
            index = index % chars.length;
            const cur = chars[index];
            index++;
            totalCharCount++;
            
            if (cur === '\n') {
                target.insertBefore(document.createElement('br'), cursor);
            } else {
                const span = getSpan(cur);
                target.insertBefore(span, cursor);
            }
        }
        
        target.scrollTop = target.scrollHeight;
        
        if (totalCharCount > MAX_CHARS) {
            const deleteAmount = viewportChars;
            const removed = removeTopChars(deleteAmount);
            totalCharCount -= removed;
            
            l(`📊 删了：${removed}，剩余：${totalCharCount}`);
        }

        if (totalCharCount > 35000) {
            l(`⚠️强制清空背景（${totalCharCount} 个节点）`);
            const children = target.childNodes;
            for (let i = children.length - 1; i >= 0; i--) {
                const node = children[i];
                if (node === cursor) continue;
                node.remove();
            }
            totalCharCount = 0;
            target.appendChild(cursor)
            target.scrollTop = target.scrollHeight;
        }
        
        requestAnimationFrame(typeBatch);
    }
    
    requestAnimationFrame(typeBatch);

    const recountInterval = setInterval(() => {
        if (!window.typingActive) clearInterval(recountInterval);
        viewportChars = getViewportCharCount();
    }, 1000);
}

window.addEventListener('DOMContentLoaded', () => {
    sourceBf = generateSourceBf();
    type(sourceBf);
});