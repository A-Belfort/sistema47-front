(function () {
  'use strict';
  const fab = document.getElementById('fabBtn');
  const widget = document.getElementById('chatWidget');
  const closeBtn = document.getElementById('chatClose');
  const messages = document.getElementById('chatMessages');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  let isOpen = false;

  function getTime() { const now = new Date(); return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'); }
  function scrollToBottom() { requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; }); }

  async function getBotReply(text) {
    try {
        const response = await fetch('http://https://sistema47-back.onrender.com/api/chatbot/mensagens', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pergunta: text })
        });
        const data = await response.json(); return data.resposta;
    } catch (error) { return "🤖 Servidor offline. Verifique o Flask."; }
  }

  function appendUserMessage(text) {
    const wrap = document.createElement('div'); wrap.className = 'message message--user';
    wrap.innerHTML = `<div class="message__bubble">${text}<span class="message__time">${getTime()}</span></div>`;
    messages.appendChild(wrap); scrollToBottom();
  }

  function appendBotMessage(text) {
    const wrap = document.createElement('div'); wrap.className = 'message message--bot';
    wrap.innerHTML = `<div class="message__avatar"><svg viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="3" fill="#1565C0"/><circle cx="8.5" cy="14" r="1.5" fill="white"/><circle cx="15.5" cy="14" r="1.5" fill="white"/><rect x="7" y="3" width="2" height="4" rx="1" fill="#1565C0"/><rect x="15" y="3" width="2" height="4" rx="1" fill="#1565C0"/><rect x="9" y="17" width="6" height="1.5" rx="0.75" fill="white"/></svg></div><div class="message__bubble">${text}<span class="message__time">${getTime()}</span></div>`;
    messages.appendChild(wrap); scrollToBottom();
  }

  async function sendMessage(text) {
    if (!text.trim()) return;
    appendUserMessage(text); input.value = ''; input.focus();
    
    // Pequeno truque para mostrar que está "pensando"
    const thinking = document.createElement('div'); thinking.className = 'message message--bot';
    thinking.innerHTML = `<div class="message__avatar"><svg viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="3" fill="#1565C0"/><circle cx="8.5" cy="14" r="1.5" fill="white"/><circle cx="15.5" cy="14" r="1.5" fill="white"/></svg></div><div class="message__bubble">...</div>`;
    messages.appendChild(thinking); scrollToBottom();

    const respostaDaIA = await getBotReply(text);
    thinking.remove();
    appendBotMessage(respostaDaIA);
  }

  function toggleWidget() {
    isOpen = !isOpen;
    if(isOpen) { widget.classList.add('is-visible'); fab.classList.add('is-open'); input.focus(); }
    else { widget.classList.remove('is-visible'); fab.classList.remove('is-open'); }
  }

  if(fab) fab.addEventListener('click', toggleWidget);
  if(closeBtn) closeBtn.addEventListener('click', toggleWidget);
  if(sendBtn) sendBtn.addEventListener('click', () => sendMessage(input.value));
  if(input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(input.value); } });
})();   