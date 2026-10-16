/* Jokenpô — faithful browser port of the terminal game (Jokenpo.py).
   All 5 modes, pyfiglet banners, ASCII shake animation, screen clears.
   Runs in Portuguese like the original. Music (winsound) is omitted.
   time.sleep(5) pauses are shortened to ~1.4s for the web. */
(function () {
  const root = document.getElementById('jokenpo');
  if (!root) return;

  const screenEl = root.querySelector('[data-jkp-screen]');
  const inputWrap = root.querySelector('[data-jkp-inputline]');
  const inputEl = root.querySelector('[data-jkp-input]');
  const startBtn = root.querySelector('[data-jkp-start]');
  if (!screenEl || !inputEl || !startBtn) return;

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SLEEP_LONG = 1400; // stands in for the original's time.sleep(5)

  // The terminal boots on its own; it only grabs focus once the player
  // has clicked/typed into it at least once.
  let engaged = false;
  const engage = () => { engaged = true; };
  inputEl.addEventListener('focus', engage);
  inputEl.addEventListener('keydown', engage);
  screenEl.addEventListener('pointerdown', engage);

  // Only scroll the terminal's scrollback when it's the focused element;
  // otherwise let the wheel scroll the page so you can pass over the game.
  screenEl.addEventListener('wheel', (e) => {
    if (document.activeElement !== screenEl) {
      e.preventDefault();
      window.scrollBy({ top: e.deltaY });
    }
  }, { passive: false });

  // pyfiglet output, base64'd to survive backslashes/backticks intact.
  // Jokenpo=larry3d, Placar Atual=chunky, Placar Final=alligator, Victory Royale!=big_money-ne
  const FIG = {
    jokenpo: 'IF9fX19fICAgICAgICAgIF9fICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCi9cX19fIFwgICAgICAgIC9cIFwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIApcL19fL1wgXCAgICBfX19cIFwgXC8nXCAgICAgIF9fICAgIF9fXyAgIF9fX19fICAgICBfX18gICAKICAgX1wgXCBcICAvIF9fYFwgXCAsIDwgICAgLydfX2BcLycgXyBgXC9cICdfX2BcICAvIF9fYFwgCiAgL1wgXF9cIFwvXCBcTFwgXCBcIFxcYFwgL1wgIF9fLy9cIFwvXCBcIFwgXExcIFwvXCBcTFwgXAogIFwgXF9fX18vXCBcX19fXy9cIFxfXCBcX1wgXF9fX19cIFxfXCBcX1wgXCAsX18vXCBcX19fXy8KICAgXC9fX18vICBcL19fXy8gIFwvXy9cL18vXC9fX19fL1wvXy9cL18vXCBcIFwvICBcL19fXy8gCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIFxfXCAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwvXy8gICAgICAgICA=',
    placarAtual: 'IF9fX19fXyBfXyAgICAgICAgICAgICAgICAgICAgICAgICAgX19fX19fXyBfXyAgICAgICAgICAgICAgICBfXyAKfCAgIF9fIFwgIHwuLS0tLi0uLS0tLS4tLS0uLS4tLS0tLiB8ICAgXyAgIHwgIHxfLi0tLi0tLi0tLS4tLnwgIHwKfCAgICBfXy8gIHx8ICBfICB8ICBfX3wgIF8gIHwgICBffCB8ICAgICAgIHwgICBffCAgfCAgfCAgXyAgfHwgIHwKfF9fX3wgIHxfX3x8X19fLl98X19fX3xfX18uX3xfX3wgICB8X19ffF9fX3xfX19ffF9fX19ffF9fXy5ffHxfX3wKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA=',
    placarFinal: 'ICAgICAgOjo6Ojo6Ojo6IDo6OiAgICAgICAgICAgOjo6ICAgICA6Ojo6Ojo6OiAgICAgOjo6ICAgIDo6Ojo6Ojo6OiAKICAgICA6KzogICAgOis6Ois6ICAgICAgICAgOis6IDorOiAgOis6ICAgIDorOiAgOis6IDorOiAgOis6ICAgIDorOiAKICAgICs6KyAgICArOisrOisgICAgICAgICs6KyAgICs6KyArOisgICAgICAgICs6KyAgICs6KyArOisgICAgKzorICAKICAgKyMrKzorKyMrICsjKyAgICAgICArIysrOisrIysrOisjKyAgICAgICArIysrOisrIysrOisjKys6KysjOiAgICAKICArIysgICAgICAgKyMrICAgICAgICsjKyAgICAgKyMrKyMrICAgICAgICsjKyAgICAgKyMrKyMrICAgICsjKyAgICAKICMrIyAgICAgICAjKyMgICAgICAgIysjICAgICAjKyMjKyMgICAgIysjIysjICAgICAjKyMjKyMgICAgIysjICAgICAKIyMjICAgICAgICMjIyMjIyMjIyMjIyMgICAgICMjIyAjIyMjIyMjIyAjIyMgICAgICMjIyMjIyAgICAjIyMgICAgICAKICAgICAgOjo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6OiAgICA6OjogICAgOjo6ICAgIDo6OiAgCiAgICAgOis6ICAgICAgICAgICA6KzogICAgOis6KzogICA6KzogIDorOiA6KzogIDorOiAgIAogICAgKzorICAgICAgICAgICArOisgICAgOis6KzorICArOisgKzorICAgKzorICs6KyAgICAKICAgOiM6Ois6OiMgICAgICArIysgICAgKyMrICs6KyArIysrIysrOisrIysrOisjKyAgICAgCiAgKyMrICAgICAgICAgICArIysgICAgKyMrICArIysjKyMrIysgICAgICsjKysjKyAgICAgIAogIysjICAgICAgICAgICAjKyMgICAgIysjICAgIysjKyMjKyMgICAgICMrIyMrIyAgICAgICAKIyMjICAgICAgICMjIyMjIyMjIyMjIyMjICAgICMjIyMjIyMgICAgICMjIyMjIyMjIyMjIyMg',
    victoryRoyale: 'IC8kJCAgICAvJCQgLyQkICAgICAgICAgICAgIC8kJCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKfCAkJCAgIHwgJCR8X18vICAgICAgICAgICAgfCAkJCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKfCAkJCAgIHwgJCQgLyQkICAvJCQkJCQkJCAvJCQkJCQkICAgIC8kJCQkJCQgICAvJCQkJCQkICAvJCQgICAvJCQKfCAgJCQgLyAkJC98ICQkIC8kJF9fX19fL3xfICAkJF8vICAgLyQkX18gICQkIC8kJF9fICAkJHwgJCQgIHwgJCQKIFwgICQkICQkLyB8ICQkfCAkJCAgICAgICAgfCAkJCAgICB8ICQkICBcICQkfCAkJCAgXF9fL3wgJCQgIHwgJCQKICBcICAkJCQvICB8ICQkfCAkJCAgICAgICAgfCAkJCAvJCR8ICQkICB8ICQkfCAkJCAgICAgIHwgJCQgIHwgJCQKICAgXCAgJC8gICB8ICQkfCAgJCQkJCQkJCAgfCAgJCQkJC98ICAkJCQkJCQvfCAkJCAgICAgIHwgICQkJCQkJCQKICAgIFxfLyAgICB8X18vIFxfX19fX19fLyAgIFxfX18vICAgXF9fX19fXy8gfF9fLyAgICAgICBcX19fXyAgJCQKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvJCQgIHwgJCQKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICQkJCQkJC8KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcX19fX19fLyAKIC8kJCQkJCQkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvJCQgICAgICAgICAgIC8kJAp8ICQkX18gICQkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAkJCAgICAgICAgICB8ICQkCnwgJCQgIFwgJCQgIC8kJCQkJCQgIC8kJCAgIC8kJCAgLyQkJCQkJCB8ICQkICAvJCQkJCQkIHwgJCQKfCAkJCQkJCQkLyAvJCRfXyAgJCR8ICQkICB8ICQkIHxfX19fICAkJHwgJCQgLyQkX18gICQkfCAkJAp8ICQkX18gICQkfCAkJCAgXCAkJHwgJCQgIHwgJCQgIC8kJCQkJCQkfCAkJHwgJCQkJCQkJCR8X18vCnwgJCQgIFwgJCR8ICQkICB8ICQkfCAkJCAgfCAkJCAvJCRfXyAgJCR8ICQkfCAkJF9fX19fLyAgICAKfCAkJCAgfCAkJHwgICQkJCQkJC98ICAkJCQkJCQkfCAgJCQkJCQkJHwgJCR8ICAkJCQkJCQkIC8kJAp8X18vICB8X18vIFxfX19fX18vICBcX19fXyAgJCQgXF9fX19fX18vfF9fLyBcX19fX19fXy98X18vCiAgICAgICAgICAgICAgICAgICAgIC8kJCAgfCAkJCAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICB8ICAkJCQkJCQvICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICBcX19fX19fLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'
  };
  const decode = (b) => { try { return atob(b); } catch (e) { return '[banner]'; } };

  // ---- pure rules (mirrored in tests/jokenpo-logic.test.js) ----
  const NAME = { '1': 'pedra', '2': 'papel', '3': 'tesoura' };
  const HAND = { '1': '✊', '2': '🖐️', '3': '✌' }; // ✊ 🖐️ ✌
  const BEATS = { '1': '3', '2': '1', '3': '2' }; // pedra>tesoura, papel>pedra, tesoura>papel

  function roundResult(a, b) {
    if (a === b) return 'draw';
    return BEATS[a] === b ? 'a' : 'b';
  }

  // 2v2: players J1..J4 (idx 0..3). J1/J2 hit J3(2)/J4(3); J3/J4 hit J1(0)/J2(1).
  // Per attacker vs original picks: win -> defender dies, loss -> attacker dies, tie -> nothing.
  function resolve2v2(picks, targets) {
    const alive = [true, true, true, true];
    const dst = [[2, 3], [2, 3], [0, 1], [0, 1]];
    for (let i = 0; i < 4; i++) {
      const d = dst[i][targets[i] === '1' ? 0 : 1];
      const r = roundResult(picks[i], picks[d]);
      if (r === 'a') alive[d] = false;
      else if (r === 'b') alive[i] = false;
    }
    return alive;
  }

  // Battle Royale round: which type is eliminated (null = nothing happens).
  function brEliminate(pedra, papel, tesoura, total) {
    if (pedra === total || papel === total || tesoura === total) return null;
    if (pedra === papel && papel === tesoura) return null;
    if (pedra > papel && pedra > tesoura) return 'tesoura';
    if (papel > pedra && papel > tesoura) return 'pedra';
    if (tesoura > pedra && tesoura > papel) return 'papel';
    if (pedra === papel && tesoura !== pedra) return 'tesoura';
    if (papel === tesoura && pedra !== papel) return 'pedra';
    if (pedra === tesoura && papel !== pedra) return 'papel';
    return null;
  }

  // ---- terminal ----
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));

  const term = {
    buf: '',
    _pending: null,
    _paint() { screenEl.innerHTML = this.buf; screenEl.scrollTop = screenEl.scrollHeight; },
    write(s) { this.buf += esc(s); this._paint(); },
    line(s = '') { this.write(s + '\n'); },
    bold(s) { this.buf += '<b>' + esc(s) + '</b>\n'; this._paint(); },
    clear() { this.buf = ''; this._paint(); },
    frame(s) { this.buf = esc(s) + '\n'; this._paint(); },
    figlet(key) { this.write(decode(FIG[key]) + '\n\n'); },
    sleep(ms) { return new Promise((r) => setTimeout(r, ms)); },
    read() {
      return new Promise((res) => {
        this._pending = res;
        inputWrap.hidden = false;
        inputEl.disabled = false;
        // Auto-focus only after the player has interacted once, so the
        // auto-started game never yanks focus / pops the mobile keyboard.
        if (engaged) inputEl.focus({ preventScroll: true });
      });
    },
    async ask(prompt, valid, silent) {
      while (true) {
        this.write(prompt);
        const v = (await this.read()).trim();
        this.write(v + '\n');
        if (!valid || valid(v)) return v;
        if (!silent) this.write('\nNão é uma possibilidade, insira novamente.\n\n');
      }
    }
  };

  inputEl.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !term._pending) return;
    e.preventDefault();
    const v = inputEl.value;
    inputEl.value = '';
    inputEl.disabled = true;
    inputWrap.hidden = true;
    const done = term._pending;
    term._pending = null;
    done(v);
  });

  const is123 = (v) => v === '1' || v === '2' || v === '3';
  const is12 = (v) => v === '1' || v === '2';
  const isSN = (v) => { const x = v.toLowerCase(); return x === 's' || x === 'n'; };
  const PICK_PROMPT = "escolha:\n'1' - Pedra\n'2' - Papel\n'3' - Tesoura\n";

  // ---- ASCII shake + reveal ----
  const ARMS_REST = '  /|\\          /|\\ ';
  const ARMS_UP = '  /|/          \\|\\ ';
  const FEET = '  / \\          / \\ ';
  function headLine(leftCPU, rightCPU) {
    if (!leftCPU && !rightCPU) return '   O            O';
    if (!leftCPU && rightCPU) return '   O           📺'; // O vs 📺
    return '  📺           📺'; // 📺 vs 📺
  }
  async function shakeReveal(leftCPU, rightCPU, a, b) {
    const head = headLine(leftCPU, rightCPU);
    const loops = REDUCED ? 1 : 5;
    for (let i = 0; i < loops; i++) {
      term.frame(head + '\n' + ARMS_REST + '\n' + FEET);
      await term.sleep(200);
      term.frame(head + '\n' + ARMS_UP + '\n' + FEET);
      await term.sleep(200);
    }
    term.frame(head + '\n' + '  /|\\' + HAND[a] + '      ' + HAND[b] + ' /|\\ ' + '\n' + FEET);
    await term.sleep(500);
  }

  const THANKS = 'Muito obrigado por jogar!\nFeito por Daniel Godri, Diego Soares e João Victor M. B.';

  async function scoreDuel(labelA, labelB, vA, vB, roundWord) {
    term.line();
    term.figlet('placarAtual');
    term.line(`             ${labelA} tem ${vA} ponto(s) atualmente.\n             ${labelB} tem ${vB} ponto(s) atualmente.`);
    const again = (await term.ask('\nGostaria de jogar novamente? (s/n)\n', isSN)).toLowerCase();
    term.clear();
    if (again === 'n') {
      term.figlet('placarFinal');
      term.line(`          ${labelA} obteve ${vA} ponto(s).\n          ${labelB} obteve ${vB} ponto(s).`);
      await term.sleep(SLEEP_LONG);
      term.clear();
      term.line(THANKS);
    }
    return again;
  }

  // ---- Mode 1: Humano X Humano ----
  async function mode1() {
    let vJ1 = 0, vJ2 = 0, again = 's';
    while (again === 's') {
      const j1 = await term.ask('Jogador 1, ' + PICK_PROMPT, is123);
      term.clear();
      const j2 = await term.ask('Jogador 2, ' + PICK_PROMPT, is123);
      term.clear();
      await shakeReveal(false, false, j1, j2);
      const r = roundResult(j1, j2);
      if (r === 'draw') term.bold('O jogo empatou.');
      else if (r === 'a') { term.bold('O jogador 1 venceu!'); vJ1++; }
      else { term.bold('O jogador 2 venceu!'); vJ2++; }
      term.line(`O jogador 1 escolheu ${NAME[j1]} e o jogador 2 escolheu ${NAME[j2]}.`);
      again = await scoreDuel('O jogador 1', 'O jogador 2', vJ1, vJ2);
    }
  }

  // ---- Mode 2: Humano X Computador ----
  async function mode2() {
    let vJ1 = 0, vJ2 = 0, again = 's';
    while (again === 's') {
      const j1 = await term.ask('Jogador, ' + PICK_PROMPT, is123);
      term.clear();
      const j2 = String(1 + Math.floor(Math.random() * 3));
      await shakeReveal(false, true, j1, j2);
      const r = roundResult(j1, j2);
      if (r === 'draw') term.bold('O jogo empatou.');
      else if (r === 'a') { term.bold('O jogador venceu!'); vJ1++; }
      else { term.bold('O computador venceu!'); vJ2++; }
      term.line(`O jogador escolheu ${NAME[j1]} e o computador escolheu ${NAME[j2]}.`);
      again = await scoreDuel('O jogador', 'O computador', vJ1, vJ2);
    }
  }

  // ---- Mode 3: Computador X Computador ----
  async function mode3() {
    let vJ1 = 0, vJ2 = 0, again = 's';
    while (again === 's') {
      const j1 = String(1 + Math.floor(Math.random() * 3));
      const j2 = String(1 + Math.floor(Math.random() * 3));
      await shakeReveal(true, true, j1, j2);
      const r = roundResult(j1, j2);
      if (r === 'draw') term.bold('O jogo empatou.');
      else if (r === 'a') { term.bold('O computador 1 venceu!'); vJ1++; }
      else { term.bold('O computador 2 venceu!'); vJ2++; }
      term.line(`O computador 1 escolheu ${NAME[j1]} e o computador 2 escolheu ${NAME[j2]}.`);
      again = await scoreDuel('O computador 1', 'O computador 2', vJ1, vJ2);
    }
  }

  // ---- Mode 4: 2v2 ----
  async function mode4() {
    let vEquipe1 = 0, vEquipe2 = 0, again = 's';
    while (again === 's') {
      term.line('TIME 1');
      const j1 = await term.ask('J1 escolha (1 Pedra 2 Papel 3 Tesoura): ', is123, true);
      const a1 = await term.ask('J1 ataca (1)J3 ou (2)J4: ', is12);
      term.clear();
      const j2 = await term.ask('J2 escolha (1 Pedra 2 Papel 3 Tesoura): ', is123, true);
      const a2 = await term.ask('J2 ataca (1)J3 ou (2)J4: ', is12);
      term.clear();
      term.line('TIME 2');
      const j3 = await term.ask('J3 escolha (1 Pedra 2 Papel 3 Tesoura): ', is123, true);
      const a3 = await term.ask('J3 ataca (1)J1 ou (2)J2: ', is12);
      term.clear();
      const j4 = await term.ask('J4 escolha (1 Pedra 2 Papel 3 Tesoura): ', is123, true);
      const a4 = await term.ask('J4 ataca (1)J1 ou (2)J2: ', is12);
      term.clear();

      const alive = resolve2v2([j1, j2, j3, j4], [a1, a2, a3, a4]);
      term.line('\nMortos:');
      if (!alive[0]) term.line('J1 morreu');
      if (!alive[1]) term.line('J2 morreu');
      if (!alive[2]) term.line('J3 morreu');
      if (!alive[3]) term.line('J4 morreu');

      const t1 = (alive[0] ? 1 : 0) + (alive[1] ? 1 : 0);
      const t2 = (alive[2] ? 1 : 0) + (alive[3] ? 1 : 0);
      if (t1 > t2) { term.bold('TIME 1 venceu'); vEquipe1++; }
      else if (t2 > t1) { term.bold('TIME 2 venceu'); vEquipe2++; }
      else term.bold('Empate');

      again = (await term.ask('\nOutra rodada? (s/n): ', null)).toLowerCase();
    }
    term.clear();
    term.figlet('placarFinal');
    term.line(`          A equipe 1 obteve ${vEquipe1} ponto(s).\n          A equipe 2 obteve ${vEquipe2} ponto(s).`);
    await term.sleep(SLEEP_LONG);
    term.clear();
    term.line(THANKS);
  }

  // ---- Mode 5: Battle Royale ----
  async function mode5() {
    let quantJog = 0, again = 's', vencedor = null;
    while (again === 's') {
      let pedra = 0, papel = 0, tesoura = 0;
      let nomesPedra = '', nomesPapel = '', nomesTesoura = '';

      if (!(Number.isInteger(quantJog) && quantJog > 1)) {
        const q = await term.ask('Insira a quantidade de jogadores: ',
          (v) => /^\d+$/.test(v.trim()) && parseInt(v, 10) > 1);
        quantJog = parseInt(q.trim(), 10);
      }
      term.clear();

      if (quantJog > 2) {
        const total = quantJog;
        for (let i = 1; i <= total; i++) {
          term.line(`${i}ª pessoa. Outra(s) ${total - i} restante(s).`);
          const nome = ((await term.ask('Insira seu nome: ', null)).trim()) || `Jogador ${i}`;
          const pick = await term.ask(`\n${nome}, ` + PICK_PROMPT, is123);
          if (pick === '1') { pedra++; nomesPedra = nomesPedra ? nomesPedra + ', ' + nome : nome; }
          else if (pick === '2') { papel++; nomesPapel = nomesPapel ? nomesPapel + ', ' + nome : nome; }
          else { tesoura++; nomesTesoura = nomesTesoura ? nomesTesoura + ', ' + nome : nome; }
          term.clear();
        }

        const elim = brEliminate(pedra, papel, tesoura, total);
        if (elim === null) {
          term.line('🪨          📄          ✂️');
          await term.sleep(SLEEP_LONG);
          term.clear();
          term.line(pedra === total || papel === total || tesoura === total
            ? 'Apenas um time foi escolhido, nada acontece. :('
            : 'Todos os times empataram, nada acontece. :(');
          await term.ask('\nDigite qualquer coisa para ir para a próxima rodada.\n', null);
        } else {
          const boom = {
            pedra: '💥         📄          ✂️',
            papel: '🪨          💥          ✂️',
            tesoura: '🪨          📄          💥'
          };
          term.line('🪨          📄          ✂️');
          await term.sleep(SLEEP_LONG);
          term.clear();
          term.line(boom[elim]);
          await term.sleep(500);
          term.clear();

          let survivors;
          if (elim === 'tesoura') {
            term.line((pedra === papel)
              ? `Pedra e papel empataram, logo, ${tesoura} tesoura(s) foi(ram) eliminada(s): ${nomesTesoura}.`
              : `Pedra domina, logo, ${tesoura} tesoura(s) foi(ram) eliminada(s): ${nomesTesoura}.`);
            quantJog -= tesoura;
            survivors = nomesPapel ? `${nomesPedra}, ${nomesPapel}` : nomesPedra;
          } else if (elim === 'pedra') {
            term.line((papel === tesoura)
              ? `Papel e tesoura empataram, logo, ${pedra} pedra(s) foi(ram) eliminada(s): ${nomesPedra}.`
              : `Papel domina, logo, ${pedra} pedra(s) foi(ram) eliminada(s): ${nomesPedra}.`);
            quantJog -= pedra;
            survivors = nomesTesoura ? `${nomesPapel}, ${nomesTesoura}` : nomesPapel;
          } else {
            term.line((pedra === tesoura)
              ? `Pedra e tesoura empataram, logo, ${papel} papel(éis) foi(ram) eliminado(s): ${nomesPapel}.`
              : `Tesoura domina, logo, ${papel} papel(éis) foi(ram) eliminado(s): ${nomesPapel}.`);
            quantJog -= papel;
            survivors = nomesPedra ? `${nomesTesoura}, ${nomesPedra}` : nomesTesoura;
          }
          await term.sleep(SLEEP_LONG);
          term.clear();
          term.line(`Os sobreviventes são: ${survivors}.`);
          await term.ask('\nDigite qualquer coisa para ir para a próxima rodada.\n', null);
        }
      } else if (quantJog === 2) {
        term.line('Rodada final!');
        const n1 = ((await term.ask('Insira seu nome: ', null)).trim()) || 'Jogador 1';
        const p1 = await term.ask(`\n${n1}, ` + PICK_PROMPT, is123);
        term.clear();
        term.line('Rodada final!');
        const n2 = ((await term.ask('Insira seu nome: ', null)).trim()) || 'Jogador 2';
        const p2 = await term.ask(`\n${n2}, ` + PICK_PROMPT, is123);
        term.clear();
        await shakeReveal(false, false, p1, p2);
        const r = roundResult(p1, p2);
        if (r === 'draw') { term.line('\nO jogo empatou.'); await term.sleep(1200); }
        else if (r === 'a') { quantJog = 1; vencedor = n1; }
        else { quantJog = 1; vencedor = n2; }
      }

      again = quantJog > 1 ? 's' : 'n';
    }
    term.figlet('victoryRoyale');
    term.bold(vencedor || 'Ninguém');
    await term.sleep(SLEEP_LONG);
    term.clear();
    term.line(THANKS);
  }

  async function menu() {
    term.clear();
    term.figlet('jokenpo');
    term.line('1. Humano X Humano');
    term.line('2. Humano X Computador');
    term.line('3. Computador X Computador');
    term.line('4. 2v2');
    term.line('5. Battle Royale\n');
    const m = await term.ask('Escolha uma modalidade (1-5): ', (v) => ['1', '2', '3', '4', '5'].includes(v));
    term.clear();
    if (m === '1') await mode1();
    else if (m === '2') await mode2();
    else if (m === '3') await mode3();
    else if (m === '4') await mode4();
    else await mode5();
  }

  let running = false;
  async function run() {
    if (running) return;
    running = true;
    startBtn.hidden = true;
    try {
      await menu();
    } catch (e) {
      term.line('\n[erro: ' + (e && e.message ? e.message : e) + ']');
    } finally {
      running = false;
      startBtn.hidden = false; // now a "play again" button
    }
  }
  startBtn.addEventListener('click', run);
  startBtn.hidden = true;
  run(); // auto-start — no click needed

  // expose pure rules for quick console checks
  root.__jokenpo = { roundResult, resolve2v2, brEliminate };
})();
