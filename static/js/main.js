/* ═══════════════════════════════════════════════
   NOSSO ESPAÇO ❤️ — Main Orchestrator
═══════════════════════════════════════════════ */
(function () {

  /* ── Days Together ────────────────────────── */
  function updateDays() {
    fetch('/api/days-together')
      .then(r => r.json())
      .then(d => {
        const el = document.getElementById('days-num');
        if (el) animateNumber(el, 0, d.days, 1500);
      })
      .catch(() => {});
  }

  function animateNumber(el, from, to, duration) {
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(from + (to - from) * ease).toLocaleString('pt-BR');
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ── Typing Messages ──────────────────────── */
  const msgEl = document.getElementById('message-text');
  let messages = [];
  let msgIdx   = 0;
  let typingTimer = null;

  function typeMessage(text, callback) {
    if (!msgEl) return;
    msgEl.classList.remove('visible');
    msgEl.classList.add('typing');
    msgEl.textContent = '';

    setTimeout(() => {
      msgEl.classList.add('visible');
      let i = 0;
      clearInterval(typingTimer);
      typingTimer = setInterval(() => {
        msgEl.textContent += text[i++];
        if (i >= text.length) {
          clearInterval(typingTimer);
          msgEl.classList.remove('typing');
          if (callback) setTimeout(callback, 3500);
        }
      }, 42);
    }, 400);
  }

  function showNextMessage() {
    if (!messages.length) return;
    msgIdx = Math.floor(Math.random() * messages.length);
    typeMessage(messages[msgIdx], () => {
      // Fade out, then show next
      if (msgEl) {
        msgEl.classList.remove('visible');
        setTimeout(showNextMessage, 1200);
      }
    });
  }

  function initMessages(msgs) {
    messages = msgs || [];
    if (messages.length > 0) {
      setTimeout(showNextMessage, 2000);
    }
  }

  /* ── Couple names in title ────────────────── */
  function updateTitle(names) {
    const n1 = document.getElementById('name1');
    const n2 = document.getElementById('name2');
    if (n1 && names[0]) n1.textContent = names[0];
    if (n2 && names[1]) n2.textContent = names[1];
  }

  /* ── Boot ─────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    updateTitle(CONFIG.couple_names || ['Amor', 'Vida']);
    updateDays();

    Carousel.init(PHOTOS, VIDEOS, CONFIG);
    MusicPlayer.init(MUSIC, CONFIG.autoplay_music);
    initMessages(CONFIG.messages);

    const tlContainer = document.getElementById('timeline-list');
    if (CONFIG.timeline && tlContainer) {
      Timeline.render(CONFIG.timeline, tlContainer);
    }

    // Live reload on config change from admin
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) updateDays();
    });
  });

})();
