(function() {
  var script = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var clinic = script.getAttribute('data-clinic') || 'smilecare';
  var widgetUrl = 'https://mxsystems.md/widget.html';

  // Inject styles
  var style = document.createElement('style');
  style.textContent = `
    #clinicai-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      background: #1a6b4a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(26,107,74,0.45);
      z-index: 99999;
      transition: all 0.2s;
      border: none;
    }
    #clinicai-btn:hover { transform: scale(1.08); background: #134f37; }
    #clinicai-btn svg { transition: all 0.2s; }

    #clinicai-bubble {
      position: fixed;
      bottom: 92px;
      right: 24px;
      background: #1a6b4a;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      font-size: 13px;
      padding: 8px 14px;
      border-radius: 20px 20px 4px 20px;
      box-shadow: 0 4px 16px rgba(26,107,74,0.3);
      z-index: 99998;
      white-space: nowrap;
      animation: clinicaiBubble 0.3s ease;
      cursor: pointer;
    }
    @keyframes clinicaiBubble {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    #clinicai-frame-wrap {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 370px;
      height: 560px;
      border-radius: 20px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04);
      z-index: 99997;
      overflow: hidden;
      display: none;
      animation: clinicaiOpen 0.25s ease;
    }
    @keyframes clinicaiOpen {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    #clinicai-frame-wrap iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  `;
  document.head.appendChild(style);

  // Create bubble hint
  var bubble = document.createElement('div');
  bubble.id = 'clinicai-bubble';
  bubble.textContent = 'Записаться на приём 👋';
  bubble.onclick = openWidget;
  document.body.appendChild(bubble);

  // Create button
  var btn = document.createElement('button');
  btn.id = 'clinicai-btn';
  btn.setAttribute('aria-label', 'Открыть чат');
  btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  btn.onclick = toggleWidget;
  document.body.appendChild(btn);

  // Create iframe wrapper
  var wrap = document.createElement('div');
  wrap.id = 'clinicai-frame-wrap';
  var iframe = document.createElement('iframe');
  iframe.src = widgetUrl;
  iframe.allow = 'microphone';
  iframe.scrolling = 'no';
  iframe.style.overflow = 'hidden';
  wrap.appendChild(iframe);
  document.body.appendChild(wrap);

  var isOpen = false;

  function openWidget() {
    if (bubble && bubble.parentNode) bubble.parentNode.removeChild(bubble);
    isOpen = true;
    wrap.style.display = 'block';
    wrap.style.animation = 'none';
    wrap.offsetHeight;
    wrap.style.animation = 'clinicaiOpen 0.25s ease';
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  }

  function closeWidget() {
    isOpen = false;
    wrap.style.display = 'none';
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  }

  function toggleWidget() {
    if (isOpen) closeWidget(); else openWidget();
  }

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen) closeWidget();
  });

})();
