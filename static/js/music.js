/* ═══════════════════════════════════════════════
   NOSSO ESPAÇO ❤️ — Music Player
═══════════════════════════════════════════════ */
const MusicPlayer = (() => {
  let playlist = [];
  let trackIdx = 0;
  let isPlaying = false;

  const audio    = document.getElementById('audio-player');
  const disc     = document.getElementById('music-disc');
  const titleEl  = document.getElementById('music-title');
  const artistEl = document.getElementById('music-artist');
  const playBtn  = document.getElementById('mplay');
  const prevBtn  = document.getElementById('mprev');
  const nextBtn  = document.getElementById('mnext');
  const seekBar  = document.getElementById('mseek');
  const volBar   = document.getElementById('vol-slider');
  const timeCur  = document.getElementById('mtime-cur');
  const timeTotal= document.getElementById('mtime-total');

  function formatTime(s) {
    if (isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function cleanName(filename) {
    return filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  }

  function loadTrack(i) {
    if (!playlist.length) return;
    trackIdx = ((i % playlist.length) + playlist.length) % playlist.length;
    const name = playlist[trackIdx];
    audio.src = `/static/media/music/${name}`;
    titleEl.textContent  = cleanName(name);
    artistEl.textContent = '🎵 Playlist';
    seekBar.value = 0;
    timeCur.textContent  = '0:00';
    timeTotal.textContent = '0:00';
    if (isPlaying) audio.play().catch(() => {});
  }

  function togglePlay() {
    if (!playlist.length) return;
    if (audio.paused) {
      audio.play().catch(() => {});
      isPlaying = true;
    } else {
      audio.pause();
      isPlaying = false;
    }
    updateUI();
  }

  function updateUI() {
    playBtn.textContent = isPlaying ? '⏸' : '▶';
    disc.classList.toggle('playing', isPlaying);
  }

  audio.addEventListener('play',  () => { isPlaying = true;  updateUI(); });
  audio.addEventListener('pause', () => { isPlaying = false; updateUI(); });
  audio.addEventListener('ended', () => {
    trackIdx = (trackIdx + 1) % playlist.length;
    loadTrack(trackIdx);
    if (playlist.length > 0) audio.play().catch(() => {});
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    seekBar.value = (audio.currentTime / audio.duration) * 100;
    timeCur.textContent  = formatTime(audio.currentTime);
    timeTotal.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('loadedmetadata', () => {
    timeTotal.textContent = formatTime(audio.duration);
  });

  seekBar.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (seekBar.value / 100) * audio.duration;
  });

  volBar.addEventListener('input', () => {
    audio.volume = volBar.value / 100;
  });
  audio.volume = volBar.value / 100;

  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', () => { loadTrack(trackIdx - 1); if (isPlaying) audio.play().catch(() => {}); });
  nextBtn.addEventListener('click', () => { loadTrack(trackIdx + 1); if (isPlaying) audio.play().catch(() => {}); });

  function init(songs, autoplay) {
    playlist = songs || [];
    if (!playlist.length) {
      titleEl.textContent = 'Nenhuma música adicionada';
      artistEl.textContent = 'Adicione músicas no painel ⚙️';
      return;
    }
    loadTrack(0);
    if (autoplay) {
      audio.play().then(() => { isPlaying = true; updateUI(); }).catch(() => {});
    }
  }

  return { init };
})();
