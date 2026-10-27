/*
 * Matemática exata para a demonstração da regra de Cramer (sistemas 3×3).
 * Frações com BigInt: nada de erro de arredondamento.
 * Módulo puro, sem DOM — testado em tests/cramer-math.test.mjs.
 */

const babs = (a) => (a < 0n ? -a : a);
const gcd = (a, b) => {
  a = babs(a);
  b = babs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};

export class Frac {
  constructor(n, d = 1n) {
    n = BigInt(n);
    d = BigInt(d);
    if (d === 0n) throw new RangeError("Denominador zero");
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d) || 1n;
    this.n = n / g;
    this.d = d / g;
  }

  static of(v) { return v instanceof Frac ? v : new Frac(BigInt(v), 1n); }

  add(o) { return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Frac(this.n * o.n, this.d * o.d); }
  div(o) { return new Frac(this.n * o.d, this.d * o.n); }
  neg() { return new Frac(-this.n, this.d); }
  get zero() { return this.n === 0n; }
  get negative() { return this.n < 0n; }
  eq(o) { return this.n === o.n && this.d === o.d; }

  /* Texto com sinal de menos tipográfico: "−3/4" */
  toString() {
    const s = this.d === 1n ? babs(this.n).toString() : `${babs(this.n)}/${this.d}`;
    return this.negative ? `−${s}` : s;
  }

  toNumber() { return Number(this.n) / Number(this.d); }
}

/*
 * Lê o que a pessoa digitou: inteiros, decimais (vírgula ou ponto),
 * frações "a/b" e sinal de menos comum ou tipográfico. Vazio vale 0.
 * Devolve null quando não entende.
 */
export function parseFrac(raw) {
  const s = String(raw ?? "").trim().replace(/\s+/g, "").replace(/[−–]/g, "-").replace(",", ".");
  if (s === "" || s === "-" || s === "+") return s === "" ? new Frac(0n) : null;
  if (s.length > 18) return null;
  let m = s.match(/^([+-]?\d+)\/(\d+)$/);
  if (m) return m[2] === "0" || /^0+$/.test(m[2]) ? null : new Frac(BigInt(m[1]), BigInt(m[2]));
  m = s.match(/^([+-]?)(\d*)\.?(\d*)$/);
  if (!m || (m[2] === "" && m[3] === "")) return null;
  const sign = m[1] === "-" ? -1n : 1n;
  const intPart = m[2] || "0";
  const decPart = m[3] || "";
  const den = 10n ** BigInt(decPart.length);
  return new Frac(sign * (BigInt(intPart) * den + BigInt(decPart || "0")), den);
}

/* Determinante 3×3 pela regra de Sarrus, devolvendo também os seis produtos */
export function sarrus(M) {
  const [[a, b, c], [d, e, f], [g, h, i]] = M;
  const plus = [[a, e, i], [b, f, g], [c, d, h]];
  const minus = [[c, e, g], [a, f, h], [b, d, i]];
  const prod = (t) => t[0].mul(t[1]).mul(t[2]);
  const sum = (ts) => ts.reduce((acc, t) => acc.add(prod(t)), new Frac(0n));
  const P = sum(plus);
  const N = sum(minus);
  return { det: P.sub(N), plus, minus, P, N };
}

/* Posto por eliminação de Gauss (frações exatas) */
export function rank(M) {
  const A = M.map((row) => row.slice());
  const rows = A.length;
  const cols = A[0].length;
  let r = 0;
  for (let c = 0; c < cols && r < rows; c++) {
    let p = r;
    while (p < rows && A[p][c].zero) p++;
    if (p === rows) continue;
    [A[r], A[p]] = [A[p], A[r]];
    for (let k = r + 1; k < rows; k++) {
      if (A[k][c].zero) continue;
      const f = A[k][c].div(A[r][c]);
      for (let j = c; j < cols; j++) A[k][j] = A[k][j].sub(f.mul(A[r][j]));
    }
    r++;
  }
  return r;
}

/* Troca a coluna `col` de A pelo vetor b */
export const withColumn = (A, b, col) => A.map((row, i) => row.map((v, j) => (j === col ? b[i] : v)));

/*
 * Resolve Ax = b por Cramer.
 * tipo: "unica" (det ≠ 0), "impossivel" ou "indeterminado" (det = 0, decidido pelo posto).
 */
export function solve(A, b) {
  const main = sarrus(A);
  if (!main.det.zero) {
    const cols = [0, 1, 2].map((k) => {
      const Ak = withColumn(A, b, k);
      const s = sarrus(Ak);
      return { matrix: Ak, ...s, value: s.det.div(main.det) };
    });
    return { type: "unica", main, cols };
  }
  const rA = rank(A);
  const rAb = rank(A.map((row, i) => [...row, b[i]]));
  return { type: rA < rAb ? "impossivel" : "indeterminado", main, rA, rAb };
}

/* Sistema aleatório com solução inteira e det ≠ 0 */
export function randomSystem(rand = Math.random) {
  const ri = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
  for (let tries = 0; tries < 200; tries++) {
    const A = [0, 1, 2].map(() => [0, 1, 2].map(() => ri(-4, 5)));
    const F = A.map((r) => r.map((v) => new Frac(BigInt(v))));
    if (sarrus(F).det.zero) continue;
    const sol = [ri(-4, 6), ri(-4, 6), ri(-4, 6)];
    const b = A.map((r) => r[0] * sol[0] + r[1] * sol[1] + r[2] * sol[2]);
    return { A, b };
  }
  return { A: [[1, 2, 1], [1, -1, 2], [2, 1, -1]], b: [8, 5, 1] };
}
