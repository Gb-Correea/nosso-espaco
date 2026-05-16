/* ═══════════════════════════════════════════════
   NOSSO ESPAÇO ❤️ — Timeline Renderer
═══════════════════════════════════════════════ */
const Timeline = (() => {
  function formatDate(dateStr) {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  function render(events, container) {
    if (!container) return;
    container.innerHTML = '';
    if (!events || !events.length) {
      container.innerHTML = '<p style="color:rgba(255,255,255,0.3);font-size:0.85rem;font-style:italic;">Nenhum evento ainda. Adicione no painel! ✨</p>';
      return;
    }
    const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    sorted.forEach((ev, i) => {
      const item = document.createElement('div');
      item.className = 'tl-item';
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      item.style.transition = `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`;

      const isLast = i === sorted.length - 1;
      item.innerHTML = `
        <div class="tl-line">
          <div class="tl-dot">${ev.emoji || '💕'}</div>
          ${!isLast ? '<div class="tl-connector"></div>' : ''}
        </div>
        <div class="tl-content">
          <div class="tl-title">${ev.title}</div>
          <div class="tl-date">${formatDate(ev.date)}</div>
        </div>`;
      container.appendChild(item);

      // Animate in
      requestAnimationFrame(() => requestAnimationFrame(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }));
    });
  }

  return { render };
})();
