/* ═══════════════════════════════════════════════
   NOSSO ESPAÇO ❤️ — Carousel Engine
═══════════════════════════════════════════════ */
const Carousel = (() => {
  let media     = [];   // {type:'photo'|'video', src:string}
  let idx       = 0;
  let playing   = true;
  let shuffle   = false;
  let interval  = 5000;
  let animSpeed = 1200;
  let timer     = null;
  let slides    = [];

  const track   = document.getElementById('carousel-track');
  const dotsEl  = document.getElementById('progress-dots');
  const speedSlider = document.getElementById('speed-slider');
  const speedVal    = document.getElementById('speed-val');

  /* ── Build media array ─────────────────────── */
  function buildMedia(photos, videos, shuffled) {
    let arr = [];
    photos.forEach(f => arr.push({ type: 'photo', src: `/static/media/photos/${f}` }));
    videos.forEach(f => arr.push({ type: 'video', src: `/static/media/videos/${f}` }));
    if (shuffled) arr = arr.sort(() => Math.random() - 0.5);
    return arr;
  }

  /* ── Create slide element ──────────────────── */
  function createSlide(item) {
    const div = document.createElement('div');
    div.className = 'carousel-slide';

    // Fundo desfocado — preenche laterais do letterbox com a mesma imagem
    const bg = document.createElement('div');
    bg.className = 'slide-bg-blur';

    if (item.type === 'photo') {
      bg.style.backgroundImage = "url('" + item.src + "')";
      div.appendChild(bg);
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = '';
      img.draggable = false;
      img.decoding = 'async';
      div.appendChild(img);
    } else {
      bg.style.background = '#000';
      div.appendChild(bg);
      const vid = document.createElement('video');
      vid.src = item.src;
      vid.muted = true;
      vid.loop  = false;
      vid.playsInline = true;
      vid.preload = 'metadata';
      vid.addEventListener('ended', () => next());
      div.appendChild(vid);
    }
    return div;
  }

  /* ── Build dots ────────────────────────────── */
  function buildDots() {
    dotsEl.innerHTML = '';
    const max = Math.min(media.length, 30);
    for (let i = 0; i < max; i++) {
      const d = document.createElement('div');
      d.className = 'prog-dot' + (i === idx ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    }
  }

  function updateDots() {
    const dots = dotsEl.querySelectorAll('.prog-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  /* ── Render all slides (lazy) ──────────────── */
  function renderSlides() {
    track.innerHTML = '';
    slides = [];
    media.forEach(item => {
      const s = createSlide(item);
      track.appendChild(s);
      slides.push(s);
    });
    if (slides.length > 0) showSlide(0, false);
  }

  /* ── Show slide ────────────────────────────── */
  function showSlide(newIdx, animate) {
    const prev = slides[idx];
    idx = ((newIdx % slides.length) + slides.length) % slides.length;
    const cur = slides[idx];

    slides.forEach(s => {
      s.classList.remove('active', 'prev');
      const vid = s.querySelector('video');
      if (vid) vid.pause();
    });

    if (prev && prev !== cur && animate) prev.classList.add('prev');
    cur.classList.add('active');

    const vid = cur.querySelector('video');
    if (vid) {
      vid.currentTime = 0;
      vid.play().catch(() => {});
    }

    updateDots();
  }

  /* ── Navigation ────────────────────────────── */
  function next() {
    if (!slides.length) return;
    const nextIdx = shuffle
      ? Math.floor(Math.random() * slides.length)
      : (idx + 1) % slides.length;
    showSlide(nextIdx, true);
    resetTimer();
  }

  function prev() {
    if (!slides.length) return;
    showSlide(idx - 1, true);
    resetTimer();
  }

  function goTo(i) {
    showSlide(i, true);
    resetTimer();
  }

  /* ── Timer ─────────────────────────────────── */
  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      const cur = slides[idx];
      const vid = cur && cur.querySelector('video');
      if (vid && !vid.paused) return; // video controls own timing
      next();
    }, interval);
  }

  function stopTimer() { clearInterval(timer); }

  function resetTimer() {
    if (playing) startTimer();
  }

  /* ── Play / Pause ──────────────────────────── */
  function setPlaying(state) {
    playing = state;
    const iconP = document.getElementById('icon-pause');
    const iconPl = document.getElementById('icon-play');
    if (playing) {
      startTimer();
      iconP.style.display = '';
      iconPl.style.display = 'none';
    } else {
      stopTimer();
      iconP.style.display = 'none';
      iconPl.style.display = '';
    }
  }

  /* ── Shuffle toggle ────────────────────────── */
  function toggleShuffle() {
    shuffle = !shuffle;
    document.getElementById('btn-shuffle').classList.toggle('active', shuffle);
  }

  /* ── Fullscreen ────────────────────────────── */
  function toggleFullscreen() {
    const el = document.getElementById('carousel-container');
    const iconE = document.getElementById('icon-expand');
    const iconC = document.getElementById('icon-compress');
    if (!document.fullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
      iconE.style.display = 'none';
      iconC.style.display = '';
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      iconE.style.display = '';
      iconC.style.display = 'none';
    }
  }

  /* ── Speed slider ──────────────────────────── */
  function initSpeedSlider(initSec) {
    speedSlider.value = initSec;
    speedVal.textContent = initSec + 's';
    speedSlider.addEventListener('input', () => {
      const s = +speedSlider.value;
      speedVal.textContent = s + 's';
      interval = s * 1000;
      resetTimer();
    });
  }

  /* ── Fit mode toggle ──────────────────────── */
  let fitCover = false;
  function toggleFitMode() {
    fitCover = !fitCover;
    slides.forEach(s => s.classList.toggle('fit-cover', fitCover));
    const btn = document.getElementById('btn-fitmode');
    if (btn) {
      btn.title = fitCover ? 'Modo: Preencher Tela (clique para Imagem Completa)' : 'Modo: Imagem Completa (clique para Preencher Tela)';
      btn.style.color = fitCover ? 'var(--rose-light)' : '';
    }
  }

  /* ── CSS variable for anim speed ──────────── */
  function setAnimSpeed(ms) {
    animSpeed = ms;
    document.documentElement.style.setProperty('--anim', ms + 'ms');
  }

  /* ── Init ──────────────────────────────────── */
  function init(photos, videos, config) {
    interval  = config.carousel_interval || 5000;
    shuffle   = config.shuffle_media || false;
    setAnimSpeed(config.animation_speed || 1200);
    media = buildMedia(photos, videos, shuffle);

    if (media.length === 0) {
      track.innerHTML = `
        <div style="
          position:absolute;inset:0;display:flex;align-items:center;
          justify-content:center;flex-direction:column;gap:16px;
          color:rgba(255,255,255,0.4);font-family:'Cormorant Garamond',serif;
          font-size:1.4rem;font-style:italic;">
          <div style="font-size:3rem">💕</div>
          <div>Adicione fotos e vídeos no painel</div>
          <a href="/admin" style="font-size:0.9rem;color:#f9a8b8;text-decoration:none;
            border:1px solid rgba(249,168,184,0.3);padding:8px 20px;border-radius:20px;">
            ⚙️ Abrir Painel
          </a>
        </div>`;
      return;
    }

    renderSlides();
    buildDots();
    initSpeedSlider(Math.round(interval / 1000));

    if (shuffle) document.getElementById('btn-shuffle').classList.add('active');
    startTimer();

    // Controls
    document.getElementById('btn-prev').addEventListener('click', prev);
    document.getElementById('btn-next').addEventListener('click', next);
    document.getElementById('btn-playpause').addEventListener('click', () => setPlaying(!playing));
    document.getElementById('btn-shuffle').addEventListener('click', toggleShuffle);
    document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);
    const fitBtn = document.getElementById('btn-fitmode');
    if (fitBtn) fitBtn.addEventListener('click', toggleFitMode);

    // Keyboard
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === ' ') { e.preventDefault(); setPlaying(!playing); }
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    });

    // Swipe
    let touchX = null;
    const cont = document.getElementById('carousel-container');
    cont.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    cont.addEventListener('touchend', e => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
      touchX = null;
    }, { passive: true });
  }

  return { init, next, prev, goTo };
})();
