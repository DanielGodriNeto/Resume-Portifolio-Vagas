// Tests the real rules module used by the page (assets/js/jokenpo-rules.js).
// Run: node tests/jokenpo-logic.test.js
const assert = require('assert');

const { roundResult, resolve2v2, brEliminate } = require('../assets/js/jokenpo-rules.js');

// --- roundResult: all 9 pairings, reciprocal ---
const P = ['1', '2', '3'];
for (const a of P) {
  for (const b of P) {
    const r = roundResult(a, b);
    if (a === b) assert.strictEqual(r, 'draw', `${a} vs ${b}`);
    else {
      assert.ok(r === 'a' || r === 'b', `${a} vs ${b}`);
      assert.strictEqual(roundResult(b, a), r === 'a' ? 'b' : 'a', `${a} vs ${b} reciprocity`);
    }
  }
}
assert.strictEqual(roundResult('1', '3'), 'a'); // pedra beats tesoura
assert.strictEqual(roundResult('2', '1'), 'a'); // papel beats pedra
assert.strictEqual(roundResult('3', '2'), 'a'); // tesoura beats papel
console.log('jokenpo-logic: all 9 outcomes correct');

// --- 2v2: simultaneous resolution vs original picks ---
// Team 1 (pedra) attacks Team 2 (papel); papel beats pedra, so both Team 1 attackers die.
assert.deepStrictEqual(
  resolve2v2(['1', '1', '2', '2'], ['1', '1', '1', '1']),
  [false, false, true, true]
);
// mutual tie: everyone picks pedra -> nobody dies
assert.deepStrictEqual(
  resolve2v2(['1', '1', '1', '1'], ['1', '1', '1', '1']),
  [true, true, true, true]
);
// an attacker that loses its own duel dies: J1 tesoura into J3 pedra -> J1 dies
assert.strictEqual(resolve2v2(['3', '1', '1', '1'], ['1', '1', '1', '1'])[0], false);
console.log('jokenpo-2v2: combat resolves correctly');

// --- Battle Royale elimination table ---
assert.strictEqual(brEliminate(4, 0, 0, 4), null);        // one team only
assert.strictEqual(brEliminate(2, 2, 2, 6), null);        // all tied
assert.strictEqual(brEliminate(3, 2, 1, 6), 'tesoura');   // pedra dominates -> scissors out
assert.strictEqual(brEliminate(1, 3, 2, 6), 'pedra');     // papel dominates -> rock out
assert.strictEqual(brEliminate(2, 1, 3, 6), 'papel');     // tesoura dominates -> paper out
assert.strictEqual(brEliminate(3, 3, 1, 7), 'tesoura');   // pedra & papel tie -> scissors out
assert.strictEqual(brEliminate(1, 3, 3, 7), 'pedra');     // papel & tesoura tie -> rock out
assert.strictEqual(brEliminate(3, 1, 3, 7), 'papel');     // pedra & tesoura tie -> paper out
console.log('jokenpo-br: elimination table correct');

// --- BR: every legal split resolves to null or one of the three types ---
for (let pe = 0; pe <= 8; pe++) {
  for (let pa = 0; pa <= 8; pa++) {
    for (let te = 0; te <= 8; te++) {
      const total = pe + pa + te;
      if (total < 3) continue;
      const e = brEliminate(pe, pa, te, total);
      assert.ok(e === null || e === 'pedra' || e === 'papel' || e === 'tesoura', `${pe}/${pa}/${te}`);
    }
  }
}
console.log('jokenpo-br: all splits classified');
