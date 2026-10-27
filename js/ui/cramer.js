/*
 * Demonstração interativa da regra de Cramer (3×3), dentro do cartão do projeto.
 * Mostra a matriz, o determinante por Sarrus, as colunas trocadas por b e o
 * resultado — ou, quando det A = 0, se o sistema é impossível ou indeterminado.
 */
import { parseFrac, solve, randomSystem } from "../lib/cramer-math.js";

const VARS = ["x", "y", "z"];
const PRESETS = {
  unica: { A: [[1, 2, 1], [1, -1, 2], [2, 1, -1]], b: [8, 5, 1] },
  impossivel: { A: [[1, 1, 1], [2, 2, 2], [1, -1, 0]], b: [3, 7, 0] },
  infinitas: { A: [[1, 1, 1], [2, 2, 2], [1, -1, 0]], b: [3, 6, 0] },
};

const h = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

/* Frações vêm do próprio cálculo (dígitos e "−"/"/"), então é seguro montar HTML */
const fracHTML = (f) => {
  const s = f.toString();
  if (!s.includes("/")) return s;
  const neg = s.startsWith("−");
  const [n, d] = s.replace("−", "").split("/");
  return `${neg ? "−" : ""}<span class="frac" aria-label="${s}"><span>${n}</span><span>${d}</span></span>`;
};

const paren = (f) => (f.negative ? `(${f})` : `${f}`);
const term = (t) => t.map(paren).join("·");

function matrixHTML(M, highlight = -1, det = true) {
  const cells = M.flat().map((v, k) =>
    `<span class="${k % 3 === highlight ? "is-b" : ""}">${v}</span>`).join("");
  return `<span class="matrix${det ? " matrix--det" : ""}" style="--cols:3" role="img" aria-label="Matriz ${M.map((r) => r.join(", ")).join("; ")}">${cells}</span>`;
}

export function setupCramer(root) {
  if (!root) return;
  const rowsEl = root.querySelector("[data-cramer-rows]");
  const stepsEl = root.querySelector("[data-cramer-steps]");
  const errorEl = root.querySelector("[data-cramer-error]");
  const statusEl = root.querySelector("[data-cramer-status]");
  const presetBtns = [...root.querySelectorAll("[data-preset]")];

  /* Editor: três linhas  a·x + b·y + c·z = d */
  const inputs = [];
  for (let i = 0; i < 3; i++) {
    const row = h("div", "cramer__row");
    const rowInputs = [];
    for (let j = 0; j < 4; j++) {
      const inp = document.createElement("input");
      inp.type = "text";
      inp.inputMode = "decimal";
      inp.autocomplete = "off";
      inp.spellcheck = false;
      inp.maxLength = 12;
      inp.setAttribute("aria-label", j < 3 ? `Equação ${i + 1}: coeficiente de ${VARS[j]}` : `Equação ${i + 1}: resultado`);
      if (j === 3) inp.classList.add("eq-b");
      rowInputs.push(inp);
      row.append(inp);
      if (j < 3) row.append(h("span", "var", VARS[j]));
      if (j < 2) row.append(h("span", "op", "+"));
      if (j === 2) row.append(h("span", "op", "="));
    }
    inputs.push(rowInputs);
    rowsEl.append(row);
  }

  function fill({ A, b }) {
    inputs.forEach((r, i) => r.forEach((inp, j) => { inp.value = String(j < 3 ? A[i][j] : b[i]).replace("-", "−"); }));
  }

  function read() {
    let ok = true;
    const A = [[], [], []];
    const b = [];
    inputs.forEach((r, i) => r.forEach((inp, j) => {
      const q = parseFrac(inp.value);
      inp.setAttribute("aria-invalid", String(q === null));
      if (q === null) { ok = false; return; }
      if (j < 3) A[i][j] = q; else b[i] = q;
    }));
    return ok ? { A, b } : null;
  }

  function step(i, label, body, extra = "") {
    const li = h("li", `cstep ${extra}`);
    li.style.setProperty("--i", i);
    li.innerHTML = `<p class="cstep__label">${label}</p><div class="cstep__body">${body}</div>`;
    return li;
  }

  function render(animate) {
    const sys = read();
    stepsEl.dataset.animate = animate ? "1" : "0";
    if (!sys) {
      errorEl.textContent = "Algum valor não foi entendido. Use números como 3, −2, 1,5 ou 1/2.";
      return;
    }
    errorEl.textContent = "";
    const r = solve(sys.A, sys.b);
    const m = r.main;
    const items = [];
    const A = sys.A.map((row) => row.map(String));

    items.push(step(0, "<span>1 · Matriz dos coeficientes</span><span>Sarrus</span>",
      `${matrixHTML(A)}<span class="cstep__expr">det A = [${m.plus.map(term).join(" + ")}] − [${m.minus.map(term).join(" + ")}]<br>= ${m.P} − ${paren(m.N)} = <strong>${fracHTML(m.det)}</strong></span>`));

    if (r.type === "unica") {
      r.cols.forEach((c, k) => {
        items.push(step(k + 1, `<span>${k + 2} · Coluna de ${VARS[k]} trocada por b</span><span>det A<sub>${VARS[k]}</sub></span>`,
          `${matrixHTML(c.matrix.map((row) => row.map(String)), k)}<span class="cstep__expr">det A<sub>${VARS[k]}</sub> = ${c.P} − ${paren(c.N)} = <strong>${fracHTML(c.det)}</strong></span>`));
      });
      const res = r.cols.map((c, k) =>
        `<span><span class="var">${VARS[k]}</span> = <span class="frac"><span>${c.det}</span><span>${m.det}</span></span> = <strong>${fracHTML(c.value)}</strong></span>`).join("");
      items.push(step(4, "<span>5 · Resultado</span><span>Uma única solução</span>", res, "cstep--result"));
    } else {
      const imp = r.type === "impossivel";
      const geo = imp
        ? "Os três planos não têm nenhum ponto em comum."
        : r.rA === 1
          ? "Os planos coincidem: qualquer ponto de um deles serve."
          : "Os planos se cruzam ao longo de uma reta inteira.";
      items.push(step(1, "<span>2 · det A = 0</span><span>Cramer não decide sozinho</span>",
        `<p><span class="verdict">${imp ? "Sistema impossível" : "Infinitas soluções"}</span>A caixa formada pelas colunas achatou (volume zero). Comparando os postos: posto(A) = ${r.rA} e posto(A | b) = ${r.rAb}${imp ? ", então b traz uma informação que contradiz as equações." : ", iguais e menores que 3: sobram variáveis livres."} ${geo}</p>`,
        "cstep--warn"));
    }
    stepsEl.replaceChildren(...items);
    if (statusEl) {
      statusEl.textContent = r.type === "unica"
        ? `Solução: ${r.cols.map((c, k) => `${VARS[k]} = ${c.value}`).join(", ")}.`
        : r.type === "impossivel" ? "Determinante zero: sistema impossível." : "Determinante zero: infinitas soluções.";
    }
    if (!animate) items.forEach((li) => { li.style.animation = "none"; li.querySelectorAll(".is-b").forEach((s) => { s.style.animation = "none"; }); });
  }

  function choose(name) {
    presetBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.preset === name)));
    fill(name === "sortear" ? randomSystem() : PRESETS[name]);
    render(true);
  }

  presetBtns.forEach((b) => b.addEventListener("click", () => choose(b.dataset.preset)));

  let t = 0;
  rowsEl.addEventListener("input", () => {
    presetBtns.forEach((b) => b.setAttribute("aria-pressed", "false"));
    clearTimeout(t);
    t = setTimeout(() => render(false), 160);
  });

  fill(PRESETS.unica);
  render(false);
}
