/* ═══════════════════════════════════════════════
   NOSSO ESPAÇO ❤️ — Particles (hearts + stars)
═══════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const HEARTS = ['❤', '♥', '💕', '✦', '✧', '·', '⋆'];
  const COLORS = [
    'rgba(232,99,122,',
    'rgba(249,168,184,',
    'rgba(255,200,210,',
    'rgba(255,255,255,',
  ];

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x    = Math.random() * W;
      this.y    = init ? Math.random() * H : H + 20;
      this.vy   = -(0.15 + Math.random() * 0.55);
      this.vx   = (Math.random() - 0.5) * 0.3;
      this.size = 8 + Math.random() * 16;
      this.alpha= 0;
      this.targetAlpha = 0.08 + Math.random() * 0.18;
      this.char = HEARTS[Math.floor(Math.random() * HEARTS.length)];
      this.color= COLORS[Math.floor(Math.random() * COLORS.length)];
      this.rot  = (Math.random() - 0.5) * 0.4;
      this.angle= Math.random() * Math.PI * 2;
      this.fadeIn = true;
    }
    update() {
      this.y     += this.vy;
      this.x     += this.vx;
      this.angle += 0.008;
      this.x     += Math.sin(this.angle) * 0.3;
      if (this.fadeIn) {
        this.alpha += 0.003;
        if (this.alpha >= this.targetAlpha) { this.alpha = this.targetAlpha; this.fadeIn = false; }
      }
      if (this.y < -30) { this.reset(false); }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.font = `${this.size}px serif`;
      ctx.fillStyle = this.color + '1)';
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillText(this.char, 0, 0);
      ctx.restore();
    }
  }

  const COUNT = Math.min(55, Math.floor(W * H / 18000));
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();
