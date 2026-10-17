(function () {
  const root = document.documentElement;
  const STORAGE_KEY = 'site-lang';

  const LANGS = ['pt', 'en', 'jp'];

  function applyLang(lang) {
    if (!LANGS.includes(lang)) lang = 'pt';
    root.classList.remove('lang-pt', 'lang-en', 'lang-jp');
    root.classList.add('lang-' + lang);
    root.setAttribute('lang', lang === 'jp' ? 'ja' : lang);
    const input = document.querySelector('[data-jkp-input]');
    if (input) input.setAttribute('aria-label', JKP_ARIA[lang] || JKP_ARIA.pt);
  }

  // Screen readers reading hidden alternates too (e.g. translation tools)
  // should still get the right per-run language, not just the visible one.
  document.querySelectorAll('[data-lang]').forEach((el) => {
    const l = el.getAttribute('data-lang');
    el.setAttribute('lang', l === 'jp' ? 'ja' : l);
  });

  const JKP_ARIA = {
    pt: 'Terminal, digite e pressione Enter',
    en: 'Terminal, type and press Enter',
    jp: 'ターミナル、入力してEnterを押してください'
  };

  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* private mode etc. */ }
  // First visit follows the browser language (pt, ja, otherwise en); the toggle overrides and is remembered.
  const browserLang = (navigator.language || 'pt').toLowerCase();
  applyLang(saved || (browserLang.startsWith('pt') ? 'pt' : browserLang.startsWith('ja') ? 'jp' : 'en'));

  document.querySelectorAll('[data-set-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.setLang;
      applyLang(lang);
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    });
  });

  // Mobile nav: collapse the link list behind a toggle button.
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('[data-nav-toggle]');
  if (nav && navToggle) {
    const closeNav = () => { nav.classList.remove('is-open'); navToggle.setAttribute('aria-expanded', 'false'); navToggle.textContent = '☰'; };
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.textContent = open ? '✕' : '☰';
    });
    nav.querySelectorAll('.nav__links a').forEach((a) => a.addEventListener('click', closeNav));
  }

  // Scroll-reveal for sections/cards
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Click to load an embed. Once loaded it ignores the mouse until you click the
  // scrim, so the wheel scrolls the page while you pass over it; leaving the
  // frame or pressing Esc hands scroll back.
  document.querySelectorAll('[data-lazy-game]').forEach((container) => {
    const trigger = container.querySelector('.play-frame__trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      if (container.dataset.loaded) return;
      container.dataset.loaded = '1';

      const iframe = document.createElement('iframe');
      iframe.src = container.dataset.gameSrc || '';
      iframe.title = container.dataset.gameTitle || 'game';
      iframe.allow = 'autoplay';

      const scrim = document.createElement('button');
      scrim.type = 'button';
      scrim.className = 'play-frame__scrim';
      scrim.setAttribute('aria-label', container.dataset.gameTitle || 'game');
      const hint = document.createElement('span');
      [['pt', '▶ clique para interagir'], ['en', '▶ click to interact'], ['jp', '▶ クリックして操作']].forEach(([lang, txt]) => {
        const s = document.createElement('span');
        s.dataset.lang = lang;
        s.textContent = txt;
        hint.appendChild(s);
      });
      scrim.appendChild(hint);
      scrim.addEventListener('click', () => container.classList.add('is-live'));
      container.addEventListener('mouseleave', () => container.classList.remove('is-live'));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') container.classList.remove('is-live'); });

      container.replaceChildren(iframe, scrim);
    });
  });
})();
