/* One-shot "decode" of the hero's outlined line: letters resolve left to right in ~0.9 s.
   Final text is already in the HTML; reduced-motion users never see the effect. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  document.querySelectorAll('.hero h1 .outline').forEach((el) => {
    if (!el.offsetParent) return; // only the language currently shown
    const final = el.textContent;
    const start = performance.now();
    const DURATION = 900;
    (function tick(now) {
      const p = Math.min(1, (now - start) / DURATION);
      const keep = Math.floor(final.length * p);
      let out = final.slice(0, keep);
      for (let i = keep; i < final.length; i++) {
        out += final[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  });
})();

/* Proof numbers count up once when they scroll into view; the final value is already in the HTML. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target, final = el.textContent;
      const m = final.match(/^([+-]?)(\d+)([.,]?)(\d*)(.*)$/);
      if (!m) return;
      const dec = m[4].length, to = parseFloat(m[2] + '.' + (m[4] || '0')), t0 = performance.now();
      (function tick(now) {
        const p = Math.min(1, (now - t0) / 900), v = to * (1 - Math.pow(1 - p, 3));
        const txt = v.toFixed(dec).replace('.', m[3] || '.');
        el.textContent = p < 1 ? m[1] + txt + m[5] : final;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.proof .count').forEach((el) => { if (el.offsetParent) io.observe(el); });
})();
