/* Pure Jokenpô rules, shared by assets/js/jokenpo.js (browser) and tests/jokenpo-logic.test.js (node). */
(function (root) {
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

  const api = { roundResult, resolve2v2, brEliminate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JokenpoRules = api;
})(typeof window !== 'undefined' ? window : globalThis);
