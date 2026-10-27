/*
 * Ponto de entrada.
 * 1. Monta o conteúdo (sempre — o site funciona sem 3D e sem animação).
 * 2. Liga navegação, demonstração de Cramer, stack interativa e cópia de e-mail.
 * 3. Se GSAP/ScrollTrigger carregaram, liga a coreografia e a rolagem suave.
 * 4. Se houver WebGL, carrega a cena 3D (Three.js) sob demanda; senão, fica o
 *    planeta em CSS.
 */
import { renderProjects } from "./ui/render.js";
import { setupStack } from "./ui/stack.js";
import { setupCramer } from "./ui/cramer.js";
import { setupNav } from "./ui/nav.js";
import { setupPointer } from "./ui/pointer.js";

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;
const saveData = navigator.connection?.saveData === true;

let lenis = null;
let scene = null;

/* ---------- Conteúdo ---------- */
renderProjects();
setupStack();
setupCramer(document.querySelector("[data-cramer]"));
setupCopy();
setupTopics();
setupInView();
const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

setupNav({
  scrollTo(target) {
    if (lenis) lenis.scrollTo(target, { duration: 1.5 });
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  },
});

if (finePointer) setupPointer({ reduceMotion });

/* ---------- Animação ---------- */
const { gsap, ScrollTrigger, Lenis } = window;
if (gsap && ScrollTrigger) {
  try {
    const { startMotion } = await import("./motion.js");
    ({ lenis } = startMotion({ gsap, ScrollTrigger, Lenis, reduceMotion }));
  } catch (err) {
    console.warn("Animações desligadas:", err);
    root.classList.remove("intro");
    root.classList.add("no-motion");
  }
} else {
  root.classList.remove("intro");
  root.classList.add("no-motion");
}
root.classList.add("is-ready");

/* ---------- Cena 3D ---------- */
startScene().catch((err) => {
  root.classList.remove("is-3d", "will-3d");
  console.info("Portfólio sem 3D:", err.message);
});

async function startScene() {
  if (saveData) throw new Error("economia de dados ativada");
  const { createScene, hasWebGL } = await import("./scene.js");
  if (!hasWebGL()) throw new Error("WebGL indisponível");
  const canvas = document.querySelector(".scene");
  scene = createScene(canvas, {
    mobile: coarse || window.innerWidth < 768,
    reducedMotion: reduceMotion,
    onContextLost() {
      root.classList.remove("is-3d", "will-3d");
      scene?.destroy();
      scene = null;
    },
  });
  root.classList.add("is-3d");

  const { state } = scene;
  {
    // Entrada: as partículas se montam e a câmera se aproxima
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / 2600);
      state.assemble = ease(t);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    state.intro = 1;
  }

  /* Capítulo atual (número com fração) a partir da rolagem */
  const sections = [...document.querySelectorAll("main > section[id]")];
  let bounds = [];
  const measure = () => {
    bounds = sections.map((s) => ({ top: s.offsetTop, bottom: s.offsetTop + s.offsetHeight }));
  };
  const update = () => {
    const vh = window.innerHeight;
    const y = window.scrollY;
    const center = y + vh * 0.5;
    let k = bounds.findIndex((b) => center < b.bottom);
    if (k < 0) k = bounds.length - 1;
    const b = bounds[k];
    let c = k;
    const band = vh * 0.4;
    if (center > b.bottom - band && k < bounds.length - 1) c = k + Math.min(1, (center - (b.bottom - band)) / (band * 2));
    else if (center < b.top + band && k > 0) c = k - Math.min(1, (b.top + band - center) / (band * 2));
    state.chapter = c;
    state.scroll = y / vh;
  };
  measure();
  update();
  let pending = false;
  window.addEventListener("scroll", () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; update(); });
  }, { passive: true });
  new ResizeObserver(() => { measure(); update(); }).observe(document.body);

  /* Ponteiro → paralaxe e repulsão das partículas */
  window.addEventListener("pointermove", (e) => {
    state.px = (e.clientX / window.innerWidth - 0.5) * 2;
    state.py = (e.clientY / window.innerHeight - 0.5) * 2;
    state.pointerActive = e.pointerType === "mouse";
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => { state.pointerActive = false; });
  window.addEventListener("blur", () => { state.pointerActive = false; });

  window.addEventListener("pagehide", (e) => {
    if (!e.persisted) scene?.destroy();
  });
}

/* ---------- Copiar e-mail ---------- */
function setupCopy() {
  const btn = document.querySelector("[data-copy]");
  const label = document.querySelector("[data-copy-label]");
  const status = document.querySelector("[data-copy-status]");
  const iconUse = document.querySelector("[data-copy-icon]");
  if (!btn || !label) return;
  let timer = 0;
  btn.addEventListener("click", async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      ok = true;
    } catch {
      // Sem permissão para a área de transferência: seleciona o texto para Ctrl+C
      const address = document.querySelector(".contact__address");
      if (address) {
        const range = document.createRange();
        range.selectNodeContents(address);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
      }
    }
    label.textContent = ok ? "E-mail copiado" : "Selecionado: use Ctrl+C";
    if (status) status.textContent = ok ? "E-mail copiado para a área de transferência." : "O e-mail foi selecionado. Use Ctrl+C para copiar.";
    btn.classList.toggle("is-done", ok);
    iconUse?.setAttribute("href", ok ? "#i-check" : "#i-copy");
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = "Copiar e-mail";
      btn.classList.remove("is-done");
      iconUse?.setAttribute("href", "#i-copy");
      if (status) status.textContent = "";
    }, 2800);
  });
}

/* ---------- Engenharia: tema destacado acende as camadas do diagrama ---------- */
function setupTopics() {
  const nodes = [...document.querySelectorAll(".arch__node")];
  nodes.forEach((n, i) => n.style.setProperty("--n", i));
  const topics = [...document.querySelectorAll(".topic")];
  let pinned = null;
  const light = (topic) => {
    const layers = (topic?.dataset.layers || "").split(" ");
    nodes.forEach((n) => n.classList.toggle("is-lit", !!topic && layers.includes(n.dataset.layer)));
  };
  topics.forEach((t) => {
    const btn = t.querySelector(".topic__btn");
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => {
      pinned = pinned === t ? null : t;
      topics.forEach((x) => x.querySelector(".topic__btn").setAttribute("aria-pressed", String(x === pinned)));
      light(pinned);
    });
    t.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && light(t));
    t.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && light(pinned));
    btn.addEventListener("focus", () => light(t));
    btn.addEventListener("blur", () => light(pinned));
  });
}

/* ---------- Classe .is-inview para animações em CSS ---------- */
function setupInView() {
  document.querySelectorAll(".uml__links path").forEach((p, i) => {
    p.style.setProperty("--len", Math.ceil(p.getTotalLength()));
    p.style.setProperty("--i", i);
  });
  document.querySelectorAll(".uml__boxes g").forEach((g, i) => g.style.setProperty("--i", i));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-inview");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -15% 0px" });
  document.querySelectorAll(".step, .uml, .arch").forEach((n) => io.observe(n));
}
