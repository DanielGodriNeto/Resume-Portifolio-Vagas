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
