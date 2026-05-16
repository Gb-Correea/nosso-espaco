/* ═══════════════════════════════════════════════
   NOSSO ESPAÇO ❤️ — Admin Panel JS
═══════════════════════════════════════════════ */
(function () {

  /* ── Tabs ─────────────────────────────────── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  /* ── Upload helpers ───────────────────────── */
  function showProgress(show, pct, text) {
    const el = document.getElementById('upload-progress');
    const fill = document.getElementById('progress-fill');
    const txt  = document.getElementById('progress-text');
    el.style.display = show ? '' : 'none';
    if (fill) fill.style.width = pct + '%';
    if (txt)  txt.textContent = text || 'Enviando...';
  }

  async function uploadFile(file, type) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`/api/upload/${type}`, { method: 'POST', body: fd });
    return res.json();
  }

  async function handleUpload(files, type, gridId, countId) {
    if (!files.length) return;
    showProgress(true, 0, `Enviando 0 de ${files.length}...`);
    let done = 0;
    for (const file of files) {
      const data = await uploadFile(file, type);
      done++;
      showProgress(true, (done / files.length) * 100, `Enviando ${done} de ${files.length}...`);
      if (data.filename) appendMediaItem(data.filename, type, gridId, countId);
    }
    showProgress(false);
    showToast('✅ Upload concluído!');
  }

  function appendMediaItem(filename, type, gridId, countId) {
    const grid = document.getElementById(gridId);
    const countEl = document.getElementById(countId);
    if (!grid) return;
    const div = document.createElement('div');
    div.className = 'media-item';
    div.dataset.file = filename;
    div.dataset.type = type;
    const isPhoto = type === 'photo';
    div.innerHTML = `
      ${isPhoto
        ? `<img src="/static/media/${type}s/${filename}" alt="${filename}">`
        : `<video src="/static/media/${type}s/${filename}" muted></video>`}
      <button class="delete-btn" onclick="deleteMedia('${type}','${filename}')">✕</button>
      <span class="media-name">${filename}</span>`;
    grid.appendChild(div);
    if (countEl) countEl.textContent = grid.querySelectorAll('.media-item').length;
  }

  /* ── Drop Zones ───────────────────────────── */
  function setupDrop(zoneId, inputId, type, gridId, countId) {
    const zone  = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone || !input) return;

    ['dragenter','dragover'].forEach(ev => zone.addEventListener(ev, e => {
      e.preventDefault(); zone.classList.add('dragover');
    }));
    ['dragleave','drop'].forEach(ev => zone.addEventListener(ev, () => zone.classList.remove('dragover')));

    zone.addEventListener('drop', e => {
      e.preventDefault();
      handleUpload([...e.dataTransfer.files], type, gridId, countId);
    });
    input.addEventListener('change', () => {
      handleUpload([...input.files], type, gridId, countId);
      input.value = '';
    });
  }

  setupDrop('photo-drop', 'photo-input', 'photo', 'photo-grid', 'photo-count');
  setupDrop('video-drop', 'video-input', 'video', 'video-grid', 'video-count');
  setupDrop('music-drop', 'music-input', 'music', 'music-list', null);

  // Music drop also shows in list
  const musicInput = document.getElementById('music-input');
  if (musicInput) {
    musicInput.addEventListener('change', () => {
      [...musicInput.files].forEach(file => {
        uploadFile(file, 'music').then(data => {
          if (data.filename) appendMusicRow(data.filename);
        });
      });
      musicInput.value = '';
    });
  }

  function appendMusicRow(filename) {
    const list = document.getElementById('music-list');
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'music-row';
    row.dataset.file = filename;
    row.innerHTML = `
      <span class="music-icon">🎵</span>
      <span class="music-name">${filename}</span>
      <button class="delete-btn-sm" onclick="deleteMedia('music','${filename}')">✕</button>`;
    list.appendChild(row);
  }

  /* ── Delete media ─────────────────────────── */
  window.deleteMedia = async function (type, filename) {
    if (!confirm(`Remover "${filename}"?`)) return;
    await fetch(`/api/delete/${type}/${encodeURIComponent(filename)}`, { method: 'DELETE' });
    // Remove from DOM
    const items = document.querySelectorAll(`.media-item[data-file="${filename}"],.music-row[data-file="${filename}"]`);
    items.forEach(el => el.remove());
    // Update counts
    const photoCount = document.querySelectorAll('#photo-grid .media-item').length;
    const videoCount = document.querySelectorAll('#video-grid .media-item').length;
    const photoCountEl = document.getElementById('photo-count');
    const videoCountEl = document.getElementById('video-count');
    if (photoCountEl) photoCountEl.textContent = photoCount;
    if (videoCountEl) videoCountEl.textContent = videoCount;
    showToast('🗑️ Removido com sucesso');
  };

  /* ── Messages ─────────────────────────────── */
  function renderMessages() {
    const list = document.getElementById('messages-list');
    if (!list) return;
    list.innerHTML = '';
    (CONFIG.messages || []).forEach((msg, i) => {
      const div = document.createElement('div');
      div.className = 'msg-item';
      div.innerHTML = `
        <span class="msg-item-text">${escHtml(msg)}</span>
        <button class="delete-btn-sm" onclick="removeMessage(${i})">✕</button>`;
      list.appendChild(div);
    });
  }

  window.addMessage = function () {
    const ta = document.getElementById('new-message');
    const text = ta.value.trim();
    if (!text) return;
    CONFIG.messages = CONFIG.messages || [];
    CONFIG.messages.push(text);
    ta.value = '';
    renderMessages();
    saveConfigSilent();
    showToast('💬 Mensagem adicionada!');
  };

  window.removeMessage = function (i) {
    CONFIG.messages.splice(i, 1);
    renderMessages();
    saveConfigSilent();
  };

  renderMessages();

  /* ── Timeline ─────────────────────────────── */
  function renderTimelineAdmin() {
    const list = document.getElementById('timeline-admin-list');
    if (!list) return;
    list.innerHTML = '';
    (CONFIG.timeline || []).sort((a,b) => new Date(a.date)-new Date(b.date)).forEach((ev, i) => {
      const div = document.createElement('div');
      div.className = 'tl-admin-item';
      div.innerHTML = `
        <span class="tl-admin-emoji">${ev.emoji || '💕'}</span>
        <div class="tl-admin-info">
          <div class="tl-admin-title">${escHtml(ev.title)}</div>
          <div class="tl-admin-date">${ev.date}</div>
        </div>
        <button class="delete-btn-sm" onclick="removeTimeline(${i})">✕</button>`;
      list.appendChild(div);
    });
  }

  window.addTimeline = function () {
    const date  = document.getElementById('tl-date').value;
    const title = document.getElementById('tl-title').value.trim();
    const emoji = document.getElementById('tl-emoji').value.trim() || '💕';
    if (!date || !title) { showToast('⚠️ Preencha data e evento', 'error'); return; }
    CONFIG.timeline = CONFIG.timeline || [];
    CONFIG.timeline.push({ date, title, emoji });
    document.getElementById('tl-date').value  = '';
    document.getElementById('tl-title').value = '';
    document.getElementById('tl-emoji').value = '';
    renderTimelineAdmin();
    saveConfigSilent();
    showToast('📅 Evento adicionado!');
  };

  window.removeTimeline = function (i) {
    CONFIG.timeline.splice(i, 1);
    renderTimelineAdmin();
    saveConfigSilent();
  };

  renderTimelineAdmin();

  /* ── Settings Save ────────────────────────── */
  window.saveSettings = async function () {
    CONFIG.couple_names    = [
      document.getElementById('s-name1').value.trim() || 'Amor',
      document.getElementById('s-name2').value.trim() || 'Vida'
    ];
    CONFIG.start_date      = document.getElementById('s-startdate').value;
    CONFIG.carousel_interval = +document.getElementById('s-interval').value || 5000;
    CONFIG.animation_speed = +document.getElementById('s-animspeed').value || 1200;
    CONFIG.autoplay_music  = document.getElementById('s-autoplay').checked;
    CONFIG.shuffle_media   = document.getElementById('s-shuffle').checked;
    await saveConfigSilent();
    const st = document.getElementById('save-status');
    if (st) { st.textContent = '✅ Configurações salvas!'; setTimeout(() => st.textContent = '', 3000); }
  };

  async function saveConfigSilent() {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CONFIG)
    });
  }

  /* ── Toast notifications ──────────────────── */
  function showToast(msg, type) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%) translateY(20px)',
      background: type === 'error' ? 'rgba(220,60,60,0.9)' : 'rgba(30,15,30,0.95)',
      border: '1px solid rgba(249,168,184,0.3)',
      color: '#fff', padding: '10px 20px', borderRadius: '40px',
      fontSize: '0.85rem', zIndex: '9999',
      backdropFilter: 'blur(12px)',
      transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
    });
    document.body.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      t.style.transform = 'translateX(-50%) translateY(0)';
      t.style.opacity = '1';
    }));
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => t.remove(), 400);
    }, 2800);
  }

  /* ── Utilities ────────────────────────────── */
  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

})();
