(function() {
  var CLIENT_ID = 'boutique1';
  var SERVER_URL = 'https://thriving-eagerness-production-8505.up.railway.app';

  var style = document.createElement('style');
  style.innerHTML = `
    #ic-btn {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: #7c5cfc; border: none; cursor: pointer;
      box-shadow: 0 4px 20px rgba(124,92,252,0.5);
      z-index: 99999; display: flex; align-items: center;
      justify-content: center; transition: transform 0.2s;
    }
    #ic-btn:hover { transform: scale(1.1); }
    #ic-box {
      position: fixed; bottom: 90px; right: 24px;
      width: 360px; height: 500px; background: #0f0f0f;
      border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.4);
      z-index: 99999; display: none; flex-direction: column;
      overflow: hidden; font-family: 'Segoe UI', sans-serif;
      border: 1px solid #2a2a2a;
    }
    #ic-box.open { display: flex; }
    #ic-header { background: #1a1a1a; padding: 14px 16px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #2a2a2a; }
    #ic-header h3 { color: #f0f0f0; font-size: 14px; margin: 0; flex: 1; }
    #ic-status { color: #4ade80; font-size: 11px; }
    #ic-close { background: none; border: none; color: #888; cursor: pointer; font-size: 18px; }
    #ic-messages { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .ic-msg { display: flex; max-width: 85%; }
    .ic-msg.user { align-self: flex-end; justify-content: flex-end; }
    .ic-msg.bot { align-self: flex-start; }
    .ic-bubble { padding: 9px 13px; border-radius: 14px; font-size: 13px; line-height: 1.5; word-wrap: break-word; }
    .ic-msg.user .ic-bubble { background: #7c5cfc; color: white; border-bottom-right-radius: 4px; }
    .ic-msg.bot .ic-bubble { background: #1e1e1e; color: #f0f0f0; border: 1px solid #2a2a2a; border-bottom-left-radius: 4px; }
    .ic-typing { display: flex; gap: 4px; align-items: center; padding: 10px 13px; }
    .ic-dot { width: 6px; height: 6px; border-radius: 50%; background: #888; animation: ic-bounce 1.2s infinite; }
    .ic-dot:nth-child(2) { animation-delay: 0.2s; }
    .ic-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ic-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
    #ic-input-area { padding: 10px 12px; border-top: 1px solid #2a2a2a; display: flex; gap: 8px; background: #1a1a1a; }
    #ic-input { flex: 1; background: #242424; border: 1px solid #2a2a2a; border-radius: 8px; padding: 8px 10px; color: #f0f0f0; font-size: 13px; outline: none; resize: none; font-family: inherit; }
    #ic-input:focus { border-color: #7c5cfc; }
    #ic-send { width: 36px; height: 36px; border-radius: 8px; background: #7c5cfc; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; align-self: flex-end; }
    #ic-send:hover { background: #a78bfa; }
    #ic-send:disabled { opacity: 0.4; cursor: not-allowed; }
    #ic-powered { text-align: center; font-size: 10px; color: #444; padding: 4px; background: #0f0f0f; }
    #ic-powered a { color: #7c5cfc; text-decoration: none; }
  `;
  document.head.appendChild(style);

  document.body.innerHTML += `
    <button id="ic-btn" onclick="icToggle()">
      <svg width="26" height="26" fill="white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
    </button>
    <div id="ic-box">
      <div id="ic-header">
        <span>🤖</span>
        <h3>Support Client</h3>
        <span id="ic-status">● En ligne</span>
        <button id="ic-close" onclick="icToggle()">✕</button>
      </div>
      <div id="ic-messages"></div>
      <div id="ic-input-area">
        <textarea id="ic-input" placeholder="Écrivez votre message..." rows="1" onkeydown="icKey(event)"></textarea>
        <button id="ic-send" onclick="icSend()">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5"/></svg>
        </button>
      </div>
      <div id="ic-powered">Propulsé par <a href="#">InstantChat</a></div>
    </div>
  `;

  var history = [];
  var loading = false;
  var started = false;

  window.icToggle = function() {
    var box = document.getElementById('ic-box');
    box.classList.toggle('open');
    if (box.classList.contains('open') && !started) {
      started = true;
      icAddMsg('bot', 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?');
    }
  };

  window.icKey = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); icSend(); }
  };

  function icAddMsg(role, text) {
    var msgs = document.getElementById('ic-messages');
    var div = document.createElement('div');
    div.className = 'ic-msg ' + role;
    div.innerHTML = '<div class="ic-bubble">' + text.replace(/\n/g, '<br>') + '</div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function icShowTyping() {
    var msgs = document.getElementById('ic-messages');
    var div = document.createElement('div');
    div.className = 'ic-msg bot';
    div.id = 'ic-typing';
    div.innerHTML = '<div class="ic-bubble ic-typing"><div class="ic-dot"></div><div class="ic-dot"></div><div class="ic-dot"></div></div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  window.icSend = async function() {
    if (loading) return;
    var input = document.getElementById('ic-input');
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    loading = true;
    document.getElementById('ic-send').disabled = true;
    icAddMsg('user', text);
    history.push({ role: 'user', content: text });
    icShowTyping();
    try {
      var res = await fetch(SERVER_URL + '/chat/' + CLIENT_ID, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      var data = await res.json();
      document.getElementById('ic-typing').remove();
      if (data && data.content && data.content[0]) {
        var reply = data.content[0].text;
        history.push({ role: 'assistant', content: reply });
        icAddMsg('bot', reply);
      }
    } catch(e) {
      var t = document.getElementById('ic-typing');
      if (t) t.remove();
      icAddMsg('bot', '😔 Désolé, une erreur est survenue. Veuillez réessayer ou contacter notre équipe par email.');
    }
    loading = false;
    document.getElementById('ic-send').disabled = false;
  };
})();
