// Testes da matemática da demonstração de Cramer: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { Frac, parseFrac, sarrus, rank, solve, randomSystem } from "../js/lib/cramer-math.js";

const F = (rows) => rows.map((r) => r.map((v) => parseFrac(String(v))));
const V = (vals) => vals.map((v) => parseFrac(String(v)));

test("lê inteiros, decimais com vírgula, frações e sinais", () => {
  assert.equal(parseFrac("3").toString(), "3");
  assert.equal(parseFrac("-2,5").toString(), "−5/2");
  assert.equal(parseFrac("−1/3").toString(), "−1/3");
  assert.equal(parseFrac(" 4/8 ").toString(), "1/2");
  assert.equal(parseFrac(".5").toString(), "1/2");
  assert.equal(parseFrac("").toString(), "0");
  assert.equal(parseFrac("abc"), null);
  assert.equal(parseFrac("1/0"), null);
  assert.equal(parseFrac("-"), null);
  assert.equal(parseFrac("1.2.3"), null);
});

test("Sarrus confere com o determinante conhecido", () => {
  assert.equal(sarrus(F([[1, 2, 1], [1, -1, 2], [2, 1, -1]])).det.toString(), "12");
  assert.equal(sarrus(F([[2, 0, 0], [0, 3, 0], [0, 0, 4]])).det.toString(), "24");
  assert.ok(sarrus(F([[1, 2, 3], [2, 4, 6], [1, 1, 1]])).det.zero);
});

test("solução única: exemplo do site (1, 2, 3)", () => {
  const r = solve(F([[1, 2, 1], [1, -1, 2], [2, 1, -1]]), V([8, 5, 1]));
  assert.equal(r.type, "unica");
  assert.deepEqual(r.cols.map((c) => c.value.toString()), ["1", "2", "3"]);
});

test("solução fracionária exata", () => {
  const r = solve(F([[2, 1, 0], [0, 3, 1], [1, 0, 4]]), V([1, 1, 1]));
  assert.equal(r.type, "unica");
  const [x, y, z] = r.cols.map((c) => c.value);
  // confere substituindo de volta
  const A = F([[2, 1, 0], [0, 3, 1], [1, 0, 4]]);
  A.forEach((row) => assert.equal(row[0].mul(x).add(row[1].mul(y)).add(row[2].mul(z)).toString(), "1"));
});

test("det = 0: impossível e indeterminado pelo posto", () => {
  const A = F([[1, 1, 1], [2, 2, 2], [1, -1, 0]]);
  const imp = solve(A, V([3, 7, 0]));
  assert.equal(imp.type, "impossivel");
  assert.equal(imp.rA, 2);
  assert.equal(imp.rAb, 3);
  const ind = solve(A, V([3, 6, 0]));
  assert.equal(ind.type, "indeterminado");
  assert.equal(ind.rA, 2);
  assert.equal(ind.rAb, 2);
});

test("posto de matrizes especiais", () => {
  assert.equal(rank(F([[0, 0, 0], [0, 0, 0], [0, 0, 0]])), 0);
  assert.equal(rank(F([[1, 2, 3], [2, 4, 6], [3, 6, 9]])), 1);
});

test("sorteio sempre gera sistema com solução inteira", () => {
  for (let k = 0; k < 50; k++) {
    const { A, b } = randomSystem();
    const r = solve(F(A), V(b));
    assert.equal(r.type, "unica");
    r.cols.forEach((c) => assert.equal(c.value.d, 1n));
  }
});

test("Frac normaliza sinal e fração", () => {
  assert.equal(new Frac(2n, -4n).toString(), "−1/2");
  assert.throws(() => new Frac(1n, 0n));
});
