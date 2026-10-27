/*
 * Mapa orbital de tecnologias: cada categoria é uma órbita, cada tecnologia um
 * botão sobre o anel. Em telas menores vira uma lista de cartões, com as mesmas
 * informações e sem depender de hover.
 */
import { stack, stackLinks, statusLabel } from "../data.js";
import { el } from "./render.js";

/* Posição do centro de cada órbita no mapa (em % da largura/altura) */
const LAYOUT = {
  data: { x: 11, y: 66 },
  backend: { x: 30.5, y: 33 },
  tools: { x: 50, y: 67 },
  frontend: { x: 69.5, y: 33 },
  "3d": { x: 89, y: 66 },
};

const wide = window.matchMedia("(min-width: 72em)");

export function setupStack() {
  const map = document.querySelector("[data-stack-map]");
  const linksSvg = document.querySelector("[data-stack-links]");
  const detail = document.querySelector("[data-stack-detail]");
  const layout = detail?.parentElement;
  const filterBar = document.querySelector("[data-stack-filter]");
  if (!map || !detail) return;

  const buttons = [];
  const byId = {};

  stack.forEach((cat) => {
    const pos = LAYOUT[cat.id] || { x: 50, y: 50 };
    const nodes = el("ul", { class: "cluster__nodes", role: "list" });
    const n = cat.items.length;
    cat.items.forEach((item, i) => {
      // Começa meio passo depois do topo: nenhum nó fica sobre o nome da categoria
      const a = -Math.PI / 2 + ((i + 0.5) / n) * Math.PI * 2;
      const btn = el("button", {
        class: "tech",
        type: "button",
        "aria-pressed": "false",
        "data-status": item.status,
        style: `--nx:${(50 + 50 * Math.cos(a)).toFixed(2)}%;--ny:${(50 + 50 * Math.sin(a)).toFixed(2)}%`,
      }, [el("span", { class: "tech__sym", "aria-hidden": "true", text: item.sym }), item.name]);
      btn.setAttribute("aria-label", `${item.name}, ${statusLabel[item.status].toLowerCase()}`);
      btn._item = item;
      btn._cat = cat;
      buttons.push(btn);
      nodes.append(el("li", {}, btn));
    });

    const cluster = el("section", {
      class: "cluster",
      "aria-label": cat.name,
      "data-cluster": cat.id,
      style: `--x:${pos.x}%;--y:${pos.y}%`,
    }, [
      el("span", { class: "cluster__ring", "aria-hidden": "true" }),
      el("h3", { class: "cluster__name" }, [cat.name, el("span", { class: "cluster__count", text: `${n} itens` })]),
      nodes,
    ]);
    byId[cat.id] = cluster;
    map.append(cluster);
  });

  /* Linhas de luz entre as órbitas (coordenadas em %) */
  if (linksSvg) {
    const ns = "http://www.w3.org/2000/svg";
    const defs = document.createElementNS(ns, "defs");
    defs.innerHTML = '<linearGradient id="linkGrad" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#9d8cff"/><stop offset="1" stop-color="#7fe3ff"/></linearGradient>';
    linksSvg.append(defs);
    stackLinks.forEach(([a, b], k) => {
      const A = LAYOUT[a];
      const B = LAYOUT[b];
      for (const cls of ["", "pulse"]) {
        const line = document.createElementNS(ns, "line");
        line.setAttribute("x1", `${A.x}%`);
        line.setAttribute("y1", `${A.y}%`);
        line.setAttribute("x2", `${B.x}%`);
        line.setAttribute("y2", `${B.y}%`);
        if (cls) {
          line.setAttribute("class", cls);
          line.style.animationDelay = `${k * 0.7}s`;
        }
        linksSvg.append(line);
      }
    });
  }

  /* Tamanho das órbitas acompanha a largura do mapa */
  const sizeClusters = () => {
    if (!wide.matches) return;
    const w = map.clientWidth;
    const h = map.clientHeight;
    const d = Math.min(w * 0.175, h * 0.42, 250);
    Object.values(byId).forEach((c) => c.style.setProperty("--d", `${Math.round(d)}px`));
  };
  sizeClusters();
  new ResizeObserver(sizeClusters).observe(map);

  /* Painel de detalhes */
  let selected = null;
  function show(btn) {
    const { _item: item, _cat: cat } = btn;
    const color = { published: "var(--st-published)", practice: "var(--st-practice)", study: "var(--st-study)" }[item.status];
    detail.style.setProperty("--c", color);
    detail.replaceChildren(
      el("span", { class: "stack-detail__sym", "aria-hidden": "true", text: item.sym }),
      el("p", { class: "stack-detail__cat", text: cat.name }),
      el("h3", { class: "stack-detail__name", text: item.name }),
      el("p", { class: "stack-detail__desc", text: item.desc }),
      el("p", { class: "stack-detail__status" }, [el("span", { class: "status-dot", style: `--c:${color}`, "aria-hidden": "true" }), statusLabel[item.status]]),
      item.where?.length
        ? el("p", { class: "stack-detail__where" }, [el("strong", { text: "Onde aparece: " }), item.where.join(", ")])
        : null,
    );
    // No celular o painel aparece logo abaixo da categoria tocada
    if (!wide.matches) byId[cat.id].after(detail);
    else if (detail.parentElement !== layout) layout.append(detail);
  }

  function select(btn) {
    if (selected && selected !== btn) selected.setAttribute("aria-pressed", "false");
    selected = btn;
    btn.setAttribute("aria-pressed", "true");
    show(btn);
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => select(btn));
    btn.addEventListener("focus", () => wide.matches && show(btn));
    btn.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") show(btn); });
    btn.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && selected) show(selected); });
  });

  wide.addEventListener("change", () => {
    sizeClusters();
    if (wide.matches && detail.parentElement !== layout) layout.append(detail);
  });

  /* Primeiro item já aberto, para mostrar o que o painel faz */
  select(buttons[0]);

  /* Filtro por estado */
  filterBar?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-filter]");
    if (!b) return;
    const f = b.dataset.filter;
    filterBar.querySelectorAll("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    buttons.forEach((btn) => btn.classList.toggle("is-dim", f !== "all" && btn._item.status !== f));
  });
}
