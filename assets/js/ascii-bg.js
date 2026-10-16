/* ASCII height-map background: value-noise terrain drawn with letters and digits only.
   Low ground = faint thin letters, peaks = denser, brighter letters, with contour lines.
   Cursor acts as a lantern. Everything stays dark grey (text contrast stays > 4.5:1).
   Pauses on hidden tabs; prefers-reduced-motion gets a single still frame. */
(function () {
  const canvas = document.querySelector('.ascii-bg');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  // Glyph ramp ordered by visual ink density: letters and digits only.
  const RAMP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const hash = (a, b) => { let n = (a * 374761393 + b * 668265263) | 0; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const LEVELS = 10;               // brightness steps per glyph
  const MAX_GREY = 0x3a;           // ambient ceiling (#303030) over a black page
  const LIGHT_GREY = 0x86;         // ceiling under the cursor lantern
  const FPS = 15;
  const FONT = '600 13px "IBM Plex Mono", monospace';

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const CW = coarse ? 14 : 11;     // cell size in CSS px
  const CH = coarse ? 20 : 16;

  let cols = 0, rows = 0, atlas = null, W = 0, H = 0;
  const mouse = { x: -999, y: -999, tx: -999, ty: -999 };

  // ---- value noise (fbm, 3 octaves) ----
  const P = new Uint8Array(512);
  (function seed() {
    let s = 20260416;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const a = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    for (let i = 0; i < 512; i++) P[i] = a[i & 255];
  })();
  const fade = (t) => t * t * (3 - 2 * t);
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const X = xi & 255, Y = yi & 255;
    const v = (a, b) => P[P[a] + b] / 255;
    const u = fade(xf), w = fade(yf);
    const top = v(X, Y) + (v(X + 1, Y) - v(X, Y)) * u;
    const bot = v(X, Y + 1) + (v(X + 1, Y + 1) - v(X, Y + 1)) * u;
    return top + (bot - top) * w;
  }
  function height(x, y) {
    return (vnoise(x, y) * 0.55 + vnoise(x * 2.1 + 7.3, y * 2.1 + 3.1) * 0.3 + vnoise(x * 4.3 + 1.7, y * 4.3 + 9.4) * 0.15);
  }

  // ---- glyph atlas: RAMP.length columns x LEVELS rows, pre-tinted ----
  function buildAtlas() {
    const cw = Math.round(CW * dpr), ch = Math.round(CH * dpr);
    atlas = document.createElement('canvas');
    atlas.width = cw * RAMP.length;
    atlas.height = ch * LEVELS;
    const a = atlas.getContext('2d');
    a.font = FONT.replace('13px', Math.round(13 * dpr) + 'px');
    a.textBaseline = 'middle';
    a.textAlign = 'center';
    for (let l = 0; l < LEVELS; l++) {
      const g = Math.round(0x10 + (LIGHT_GREY - 0x10) * (l / (LEVELS - 1)));
      a.fillStyle = `rgb(${g},${g},${g})`;
      for (let i = 0; i < RAMP.length; i++) a.fillText(RAMP[i], i * cw + cw / 2, l * ch + ch / 2);
    }
  }

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    cols = Math.ceil(W / CW); rows = Math.ceil(H / CH);
    if (!atlas) buildAtlas();
    draw(performance.now());
  }

  function draw(now) {
    const t = now / 1000;
    const scroll = window.scrollY || 0;
    const cw = Math.round(CW * dpr), ch = Math.round(CH * dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const driftX = reduced ? 0 : t * 0.045;
    const driftY = reduced ? 0 : t * 0.02;
    const scrollY = scroll * 0.0009;
    const ambientTop = (MAX_GREY - 0x10) / (LIGHT_GREY - 0x10); // ambient share of the brightness range
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const h = height(c * 0.02 + driftX, (r * CH / CW) * 0.02 + driftY + scrollY);
        const x = Math.min(1, Math.max(0, (h - 0.5) / 0.22));          // only peaks survive: islands
        const k = x * x * (3 - 2 * x);
        const rnd = hash(c, r);
        let lvl = k * (0.35 + 0.65 * rnd) * ambientTop;                // per-glyph jitter
        if (rnd > 0.97) lvl = Math.min(1, lvl * 2.2);                  // rare brighter glyph
        if (mouse.x > -900) {
          const dx = c * CW - mouse.x, dy = r * CH - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 32400) lvl = Math.max(lvl, (1 - d2 / 32400) * (0.2 + 0.8 * k) * rnd);
        }
        if (lvl < 0.03) continue;
        const li = Math.round(lvl * (LEVELS - 1));
        const gi = Math.floor(hash(c + 31, r + 17 + Math.floor(reduced ? 0 : t * 0.4)) * RAMP.length);
        ctx.drawImage(atlas, gi * cw, li * ch, cw, ch, c * cw, r * ch, cw, ch);
      }
    }
  }

  // ---- loop ----
  let last = 0, raf = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - last < 1000 / FPS) return;
    last = now;
    mouse.x += (mouse.tx - mouse.x) * 0.25;
    mouse.y += (mouse.ty - mouse.y) * 0.25;
    draw(now);
  }
  function start() { if (!raf && !reduced) raf = requestAnimationFrame(frame); }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  window.addEventListener('resize', resize);
  if (!reduced && !coarse) {
    window.addEventListener('pointermove', (e) => {
      if (mouse.tx < -900) { mouse.x = e.clientX; mouse.y = e.clientY; }
      mouse.tx = e.clientX; mouse.ty = e.clientY;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { mouse.tx = mouse.ty = mouse.x = mouse.y = -999; });
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  if (reduced) window.addEventListener('scroll', () => draw(0), { passive: true });

  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => {
    atlas = null;
    resize();
    start();
  });
})();
