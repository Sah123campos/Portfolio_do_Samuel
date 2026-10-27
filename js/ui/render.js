/*
 * Renderiza a galeria de projetos e a lista "Na bancada" a partir de js/data.js.
 * Tudo é HTML comum: funciona sem 3D e sem bibliotecas de animação.
 */
import { projects, inProgress } from "../data.js";

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "text") node.textContent = v;
    else if (k === "style") node.style.cssText = v;
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of [].concat(children)) if (c != null) node.append(c);
  return node;
}

export const icon = (id, cls = "icon") => {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("class", cls);
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(ns, "use");
  use.setAttribute("href", `#${id}`);
  svg.append(use);
  return svg;
};

const newTab = () => el("span", { class: "visually-hidden", text: " (abre em nova aba)" });
const pad = (n) => String(n).padStart(2, "0");

/* Painel de código com destaque simples (para projetos sem screenshot) */
function codePanel(lines) {
  const pre = el("div", { class: "project__code", "aria-hidden": "true" });
  // Um único passe: palavras-chave em violeta, tipos em ciano
  const token = /\b(public|abstract|class|implements|extends|final|private)\b|\b([A-Z][A-Za-z]+)\b/g;
  pre.innerHTML = "<code>" + lines
    .map((l) => l.replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(token, (m, kw) => `<span class="${kw ? "k" : "t"}">${m}</span>`))
    .join("\n") + '\n<span class="caret"></span></code>';
  return pre;
}

function renderProject(p, num) {
  const titleId = `proj-${p.id}`;
  const href = p.demo || p.repo;

  const visual = el("a", {
    class: "project__visual",
    href,
    target: "_blank",
    rel: "noopener",
    tabindex: "-1",
    "aria-hidden": "true",
    "data-tilt": "",
    "data-cursor": p.demo ? "Abrir" : "Código",
  }, [
    p.image
      ? el("img", {
          src: `${p.image}-1200.webp`,
          srcset: `${p.image}-640.webp 640w, ${p.image}-1200.webp 1200w`,
          sizes: "(min-width: 64em) 46vw, 84vw",
          width: "1200",
          height: "750",
          alt: "",
          loading: "lazy",
          decoding: "async",
        })
      : codePanel(p.code || []),
    el("span", { class: "project__fx" }),
    el("span", { class: "project__cta" }, [p.demo ? "Ver projeto" : "Ver código", icon("i-external")]),
  ]);

  /* O link visual repete o botão e fica fora da árvore de acessibilidade;
     a descrição da imagem vai em texto para leitores de tela */
  const figure = p.image ? el("p", { class: "visually-hidden", text: `Prévia: ${p.alt}` }) : null;

  const links = el("div", { class: "project__links" }, [
    p.demo
      ? el("a", { class: "button button--glow button--small", href: p.demo, target: "_blank", rel: "noopener" }, [p.demoLabel, newTab(), icon("i-external")])
      : null,
    p.repo
      ? el("a", { class: "text-link", href: p.repo, target: "_blank", rel: "noopener" }, [icon("i-github"), "Código no GitHub", newTab()])
      : null,
    p.anchor ? el("a", { class: "text-link", href: p.anchor }, "Testar aqui na página ↓") : null,
    !p.demo ? el("span", { class: "project__note", text: "Sem demonstração publicada" }) : null,
  ]);

  const meta = [el("span", { class: "project__num", text: pad(num) }), p.category];
  if (p.year) meta.push(el("span", { "aria-hidden": "true", text: "·" }), p.year);

  const body = el("div", { class: "project__body" }, [
    el("p", { class: "project__meta", "data-anim": "" }, meta),
    el("h3", { class: "project__name", id: titleId, "data-anim": "" }, p.name),
    el("p", { class: "project__summary", text: p.summary, "data-anim": "" }),
    el("p", { class: "project__label", text: "O que foi desenvolvido", "data-anim": "" }),
    el("ul", { class: "project__built", "data-anim": "" }, p.built.map((f) => el("li", { text: f }))),
    p.role ? el("p", { class: "project__role", text: p.role, "data-anim": "" }) : null,
    el("ul", { class: "project__stack", role: "list", "aria-label": "Tecnologias", "data-anim": "" }, p.stack.map((s) => el("li", { text: s }))),
    el("div", { "data-anim": "" }, links),
  ]);

  // A moldura recebe o movimento da galeria; a imagem dentro dela mantém a inclinação do mouse
  return el("li", { class: `project fx-${p.fx || "none"}`, style: `--accent:${p.accent}`, "data-project": p.id }, [
    el("article", { class: "project__article", "aria-labelledby": titleId }, [
      el("div", { class: "project__frame" }, visual),
      figure,
      body,
    ]),
  ]);
}

export function renderProjects() {
  document.querySelector("[data-projects]")
    ?.replaceChildren(...projects.map((p, i) => renderProject(p, i + 1)));

  // Marcadores da galeria: um botão por projeto
  document.querySelector("[data-works-dots]")?.replaceChildren(...projects.map((p, i) =>
    el("li", {}, el("button", { type: "button", class: "works__dot", "data-go": String(i), "aria-label": `Ir para ${p.name}`, text: pad(i + 1) }))));

  document.querySelector("[data-in-progress]")?.replaceChildren(...inProgress.map((w) =>
    el("li", { class: "wip__item" }, [
      el("span", { class: "wip__name", text: w.name }),
      el("span", { class: "wip__detail", text: w.detail }),
      el("span", { class: "wip__status", "data-status": w.status, text: w.status }),
    ])));
}
