/*
 * Orquestra a página:
 * - renderiza os projetos (sempre, para funcionar sem 3D);
 * - se houver WebGL, movimento liberado e bibliotecas carregadas, liga a cena 3D,
 *   a rolagem suave (Lenis) e as linhas do tempo de rolagem (GSAP ScrollTrigger);
 * - caso contrário, a página fica na versão estática completa.
 */
import { projects, inProgress } from "./projects.js";

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;

/* ---------- Utilitário DOM ---------- */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) if (c != null) node.append(c);
  return node;
}

const newTab = () => el("span", { class: "visually-hidden", text: " (abre em nova aba)" });
const pad = (n) => String(n).padStart(2, "0");

/* ---------- Projetos ---------- */
function renderProject(p, i) {
  const titleId = `proj-${p.id}`;

  const name = el("h3", { class: "project__name", id: titleId }, [
    p.logo ? el("img", { class: "project__logo", src: p.logo, alt: "", width: "40", height: "40", loading: "lazy", decoding: "async" }) : null,
    p.name,
  ]);

  const links = el("div", { class: "project__links" }, [
    p.demo ? el("a", { class: "text-link", href: p.demo, target: "_blank", rel: "noopener" }, [p.demoLabel, newTab()]) : null,
    el("a", { class: `text-link${p.demo ? " text-link--quiet" : ""}`, href: p.repo, target: "_blank", rel: "noopener" }, ["Código no GitHub", newTab()]),
    p.demo ? null : el("span", { class: "project__note", text: "Demonstração ainda não publicada" }),
  ]);

  const body = el("div", { class: "project__body" }, [
    el("p", { class: "project__meta" }, [el("span", { class: "project__num", text: pad(i + 1) }), `${p.kind}, ${p.year}`]),
    name,
    el("p", { class: "project__summary", text: p.summary }),
    el("ul", { class: "project__features" }, p.features.map((f) => el("li", { text: f }))),
    el("ul", { class: "project__stack", role: "list", "aria-label": "Tecnologias" }, p.stack.map((s) => el("li", { text: s }))),
    links,
  ]);

  const shot = el("figure", { class: "project__shot" }, el("img", {
    src: `${p.image}-1200.webp`,
    srcset: `${p.image}-640.webp 640w, ${p.image}-1200.webp 1200w`,
    sizes: "(min-width: 60em) 44rem, 92vw",
    width: "1200",
    height: "750",
    alt: `Página inicial de ${p.name}`,
    loading: "lazy",
    decoding: "async",
  }));

  return el("li", { class: "project", "data-index": String(i) },
    el("article", { class: "project__article", "aria-labelledby": titleId }, [shot, body]));
}

function renderContent() {
  document.querySelector("[data-projects]")?.replaceChildren(...projects.map(renderProject));
  document.querySelector("[data-in-progress]")?.replaceChildren(...inProgress.map((w) =>
    el("li", { class: "wip__item" }, [
      el("span", { class: "wip__name", text: w.name }),
      el("span", { class: "wip__detail", text: w.detail }),
      el("span", { class: "wip__status", "data-status": w.status, text: w.status }),
    ])));
  const total = document.querySelector("[data-hud-total]");
  if (total) total.textContent = pad(projects.length);
  const y = document.querySelector("[data-year]");
  if (y) y.textContent = String(new Date().getFullYear());
}

/* ---------- Copiar e-mail ---------- */
function setupCopy() {
  const btn = document.querySelector("[data-copy]");
  const label = document.querySelector("[data-copy-label]");
  const status = document.querySelector("[data-copy-status]");
  if (!btn || !label) return;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      label.textContent = "E-mail copiado";
      if (status) status.textContent = "E-mail copiado para a área de transferência.";
    } catch {
      const range = document.createRange();
      const email = document.querySelector(".contact__email");
      if (email) { range.selectNodeContents(email); getSelection().removeAllRanges(); getSelection().addRange(range); }
      label.textContent = "Selecionei o e-mail, use Ctrl+C";
    }
    setTimeout(() => { label.textContent = "Copiar e-mail"; }, 2600);
  });
}

/* ---------- Modo 3D ---------- */
async function start3D() {
  const { gsap, ScrollTrigger, Lenis } = window;
  if (!gsap || !ScrollTrigger || !Lenis) throw new Error("Bibliotecas de animação não carregaram");

  const { createScene, hasWebGL } = await import("./scene.js");
  if (!hasWebGL()) throw new Error("WebGL indisponível");

  const canvas = document.querySelector(".scene");
  root.classList.add("is-3d");
  root.style.setProperty("--n", String(projects.length));

  let scene;
  try {
    scene = createScene(canvas, projects, { mobile: coarse || window.innerWidth < 768 });
  } catch (err) {
    root.classList.remove("is-3d");
    throw err;
  }
  const { state } = scene;

  gsap.registerPlugin(ScrollTrigger);

  /* Rolagem suave */
  // Com "menos movimento" ativado no sistema, a cena 3D continua, mas a rolagem
  // fica nativa (sem inércia) e as entradas automáticas não acontecem
  const lenis = new Lenis(reduceMotion ? { smoothWheel: false, syncTouch: false } : { lerp: 0.085, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* Links internos passam pelo Lenis */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id === "#" || id === "#conteudo") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (a.dataset.orbitIndex) scrollToProject(Number(a.dataset.orbitIndex));
    else lenis.scrollTo(id === "#projetos" ? document.querySelector("[data-orbit]") : target, { duration: 1.6 });
  });

  const orbit = document.querySelector("[data-orbit]");
  const items = [...document.querySelectorAll(".project")];
  const n = projects.length;

  function scrollToProject(i) {
    const top = orbit.getBoundingClientRect().top + window.scrollY;
    const span = orbit.offsetHeight - window.innerHeight;
    lenis.scrollTo(top + (span * i) / (n - 1) + 1, { duration: 1.8 });
  }

  /* Trilho de paradas */
  const rail = document.querySelector("[data-rail]");
  const railLinks = [];
  const addStop = (label, href, extra = {}) => {
    const a = el("a", { href, ...extra }, [el("span", { class: "rail__label", text: label })]);
    railLinks.push(a);
    rail.append(el("li", {}, a));
    return a;
  };
  addStop("Início", "#topo");
  rail.append(el("li", { class: "rail__gap", "aria-hidden": "true" }));
  projects.forEach((p, i) => addStop(p.name, "#projetos", { "data-orbit-index": String(i) }));
  rail.append(el("li", { class: "rail__gap", "aria-hidden": "true" }));
  const tailStops = ["stack", "trajetoria", "contato"].map((id) =>
    addStop(document.getElementById(id).dataset.stop, `#${id}`));

  let currentStop = -1;
  function setStop(idx) {
    if (idx === currentStop) return;
    currentStop = idx;
    railLinks.forEach((a, i) => (i === idx ? a.setAttribute("aria-current", "step") : a.removeAttribute("aria-current")));
  }

  /* HUD e projeto ativo */
  const hudIndex = document.querySelector("[data-hud-index]");
  const hudAngle = document.querySelector("[data-hud-angle]");
  const hudBar = document.querySelector("[data-hud-bar]");
  let active = -1;
  function setActive(i) {
    if (i === active) return;
    active = i;
    items.forEach((li, k) => li.classList.toggle("is-active", k === i));
    if (hudIndex) hudIndex.textContent = pad(i + 1);
  }
  setActive(0);

  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  /* Hero → órbita: a câmera sai do núcleo e vai até a primeira tela */
  ScrollTrigger.create({
    trigger: "#topo",
    start: "top top",
    endTrigger: orbit,
    end: "top top",
    onUpdate: (self) => {
      state.hero = self.progress;
      root.style.setProperty("--veil", (0.35 + 0.65 * self.progress).toFixed(3));
    },
  });

  /* Órbita: a rolagem gira a câmera de tela em tela, pausando em cada uma */
  ScrollTrigger.create({
    trigger: orbit,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const x = self.progress * (n - 1);
      const i = Math.min(Math.floor(x), n - 1);
      const o = i + smooth(0.3, 0.7, x - i);
      state.orbit = o;
      const idx = Math.round(o);
      setActive(idx);
      setStop(1 + idx);
      if (hudAngle) hudAngle.textContent = ((o / n) * 360).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      if (hudBar) hudBar.style.setProperty("--p", self.progress.toFixed(3));
    },
    onLeaveBack: () => setStop(0),
  });

  /* Saída: a câmera sobe e mostra o anel inteiro de cima */
  ScrollTrigger.create({
    trigger: "#stack",
    start: "top bottom",
    end: "top 25%",
    onUpdate: (self) => {
      state.outro = self.progress;
      if (self.progress > 0) root.style.setProperty("--veil", (1 - 0.45 * self.progress).toFixed(3));
    },
  });

  ["stack", "trajetoria", "contato"].forEach((id, k) => {
    ScrollTrigger.create({
      trigger: `#${id}`,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => self.isActive && setStop(railLinks.indexOf(tailStops[k])),
    });
  });
  ScrollTrigger.create({ trigger: "#topo", start: "top top", end: "bottom center", onToggle: (s) => s.isActive && setStop(0) });

  /* Cabeçalho ganha fundo após o topo */
  const header = document.querySelector(".site-header");
  ScrollTrigger.create({ start: 40, end: "max", onToggle: (s) => header.classList.toggle("is-scrolled", s.isActive) });

  /* Entrada da página: um único momento orquestrado */
  if (reduceMotion) {
    state.assemble = 1;
  } else {
    gsap.to(state, { assemble: 1, duration: 2.8, ease: "power2.out", delay: 0.15 });
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(".hero__line", { yPercent: 110, duration: 1.3, stagger: 0.12 }, 0.35)
      .from(".hero__kicker, .hero__lede, .hero__actions, .hero__facts, .scroll-hint", { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.7);
  }

  /* Revelação das seções seguintes */
  if (!reduceMotion) gsap.utils.toArray(".section").forEach((section) => {
    const els = section.querySelectorAll("[data-reveal]");
    gsap.from(els, {
      y: 36,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      stagger: 0.07,
      scrollTrigger: { trigger: section, start: "top 78%", once: true },
    });
  });

  /* Paralaxe do ponteiro */
  window.addEventListener("pointermove", (e) => {
    state.px = (e.clientX / window.innerWidth - 0.5) * 2;
    state.py = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  if (finePointer) setupCursor(gsap);

  /* Imagens e fontes mudam alturas: recalcula os gatilhos */
  window.addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  window.__portfolio = { lenis, scene };
}

/* ---------- Cursor ---------- */
function setupCursor(gsap) {
  const cursor = document.querySelector(".cursor");
  if (!cursor) return;
  root.classList.add("has-cursor");
  const ring = { x: -100, y: -100 };
  const toX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out", onUpdate: () => cursor.style.setProperty("--x", `${ring.x}px`) });
  const toY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out", onUpdate: () => cursor.style.setProperty("--y", `${ring.y}px`) });
  window.addEventListener("pointermove", (e) => {
    cursor.style.setProperty("--dx", `${e.clientX}px`);
    cursor.style.setProperty("--dy", `${e.clientY}px`);
    toX(e.clientX);
    toY(e.clientY);
  }, { passive: true });
  document.addEventListener("pointerover", (e) => {
    cursor.classList.toggle("is-hover", !!e.target.closest("a, button"));
  });
  document.addEventListener("pointerleave", () => {
    cursor.style.setProperty("--dx", "-100px");
    cursor.style.setProperty("--dy", "-100px");
    toX(-100);
    toY(-100);
  });
}

/* ---------- Início ---------- */
renderContent();
setupCopy();

start3D().catch((err) => {
  // Sem 3D (sem WebGL ou bibliotecas bloqueadas): a versão estática já está completa
  root.classList.remove("is-3d", "has-cursor");
  console.info("Portfólio em modo estático:", err.message);
});
