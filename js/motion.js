/*
 * Coreografia da página com GSAP + ScrollTrigger (e Lenis para a rolagem suave).
 * Cada seção tem um comportamento próprio; nada prende a rolagem.
 * Só roda quando as bibliotecas carregaram. Com "menos movimento" ativo,
 * as animações ficam mais rápidas e a rolagem fica nativa (sem inércia).
 */
import { travel } from "./ui/travel.js";

const escapeHTML = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* Divide o texto em palavras com máscara; data-glow destaca palavras com luz */
export function splitWords(node) {
  if (node.dataset.splitDone) return node.querySelectorAll(".split-word > span");
  const glow = new Set((node.dataset.glow || "").split(" ").filter(Boolean));
  const words = node.textContent.trim().split(/\s+/);
  node.innerHTML = words
    .map((w) => `<span class="split-word"><span${glow.has(w) ? ' class="glow-text"' : ""}>${escapeHTML(w)}</span></span>`)
    .join(" ");
  node.dataset.splitDone = "1";
  return node.querySelectorAll(".split-word > span");
}

export function startMotion({ gsap, ScrollTrigger, Lenis, reduceMotion }) {
  const root = document.documentElement;
  gsap.registerPlugin(ScrollTrigger);
  const wide = window.matchMedia("(min-width: 64em)").matches;

  /* ---------- Rolagem suave ---------- */
  let lenis = null;
  if (!reduceMotion && Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  document.querySelectorAll("[data-split]").forEach(splitWords);

  /* ---------- Trajetória: linha que se desenha (também com menos movimento) ---------- */
  const timeline = document.querySelector("[data-timeline]");
  const items = [...document.querySelectorAll("[data-timeline-item]")];
  if (timeline) {
    ScrollTrigger.create({
      trigger: timeline,
      start: "top 62%",
      end: "bottom 62%",
      onUpdate: (st) => timeline.style.setProperty("--tp", st.progress.toFixed(4)),
    });
    items.forEach((item) => {
      ScrollTrigger.create({
        trigger: item.querySelector(".timeline__marker"),
        start: "top 62%",
        onEnter: () => item.classList.add("is-on"),
        onLeaveBack: () => item.classList.remove("is-on"),
      });
    });
  }

  /* Com "menos movimento" a coreografia continua, só que mais curta e contida
     (sem rolagem com inércia); antes ela era desligada por completo */
  if (reduceMotion) gsap.globalTimeline.timeScale(1.4);

  /* ---------- Entrada: um único momento orquestrado ---------- */
  const heroWords = document.querySelectorAll("[data-hero-word]");
  const headWords = document.querySelectorAll(".hero__headline .split-word > span");
  const heroBits = document.querySelectorAll("[data-hero]");
  gsap.set(heroWords, { yPercent: 115 });
  gsap.set(headWords, { yPercent: 115 });
  gsap.set(heroBits, { y: 26, autoAlpha: 0 });
  root.classList.remove("intro");

  gsap.timeline({ defaults: { ease: "expo.out" } })
    .to(heroWords, { yPercent: 0, duration: 1.6, stagger: 0.12 }, 0.1)
    .to(headWords, { yPercent: 0, duration: 1.2, stagger: 0.035 }, 0.35)
    .to(heroBits, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.07, ease: "power3.out" }, 0.6);

  /* Saída do hero: o nome sobe mais devagar que o resto (profundidade) */
  gsap.to(".hero__name", {
    yPercent: -18,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero__copy, .hero__facts", {
    y: -60,
    autoAlpha: 0.15,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "35% top", end: "bottom top", scrub: true },
  });

  /* ---------- Cabeçalhos de capítulo: linha, palavras com máscara, texto ---------- */
  document.querySelectorAll(".chapter-head, .contact__inner").forEach((head) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: head, start: "top 82%", once: true } });
    const line = head.querySelector(".chapter-index__line");
    const words = head.querySelectorAll(".split-word > span");
    const rest = head.querySelectorAll(":scope > [data-reveal]:not(.chapter-index)");
    const index = head.querySelector(".chapter-index");
    if (index) tl.from(index, { autoAlpha: 0, x: -16, duration: 0.8, ease: "power3.out" }, 0);
    if (line) tl.from(line, { scaleX: 0, duration: 1.2, ease: "expo.out" }, 0.05);
    if (words.length) tl.from(words, { yPercent: 115, rotate: 4, duration: 1.2, stagger: 0.045, ease: "expo.out" }, 0.1);
    if (rest.length) tl.from(rest, { y: 30, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out" }, 0.35);
  });

  /* ---------- Projetos: galeria diagonal ---------- */
  setupWorks({ gsap, ScrollTrigger, getLenis: () => lenis });

  /* ---------- Cramer: o bloco se aproxima e os símbolos flutuam em camadas ---------- */
  const cramer = document.querySelector(".cramer");
  if (cramer) {
    gsap.from(cramer, { y: 80, autoAlpha: 0, scale: 0.97, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: cramer, start: "top 85%", once: true } });
    cramer.querySelectorAll(".cramer__bg span").forEach((s, i) => {
      gsap.to(s, { y: (i % 2 ? -1 : 1) * (40 + i * 18), ease: "none", scrollTrigger: { trigger: cramer, start: "top bottom", end: "bottom top", scrub: true } });
    });
    gsap.from(".cramer__demo", { x: 50, autoAlpha: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".cramer__demo", start: "top 85%", once: true } });
  }

  gsap.utils.toArray(".wip").forEach((w) => {
    gsap.from(w.querySelectorAll(".wip__item"), { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: w, start: "top 85%", once: true } });
  });

  /* ---------- Tecnologias: as órbitas se abrem do centro ---------- */
  const clusters = gsap.utils.toArray(".cluster");
  if (clusters.length) {
    gsap.fromTo(clusters,
      { clipPath: "circle(0% at 50% 50%)", autoAlpha: 0 },
      {
        clipPath: "circle(80% at 50% 50%)",
        autoAlpha: 1,
        duration: 1.4,
        stagger: 0.12,
        ease: "expo.out",
        clearProps: "clipPath",
        scrollTrigger: { trigger: ".stack-map", start: "top 75%", once: true },
      });
    gsap.from("[data-stack-links]", { autoAlpha: 0, duration: 1.5, delay: 0.6, scrollTrigger: { trigger: ".stack-map", start: "top 75%", once: true } });
    gsap.from(".stack-detail", { y: 30, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".stack__layout", start: "top 75%", once: true } });
  }

  /* ---------- Engenharia: a requisição atravessa as camadas ---------- */
  const nodes = gsap.utils.toArray(".arch__node");
  if (nodes.length) {
    gsap.from(nodes, {
      y: wide ? 0 : 24,
      x: wide ? -24 : 0,
      autoAlpha: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out",
      clearProps: "transform",
      scrollTrigger: { trigger: ".arch", start: "top 78%", once: true },
    });
  }
  gsap.from(".topic", { x: -24, autoAlpha: 0, duration: 0.8, stagger: 0.06, ease: "power3.out", clearProps: "transform", scrollTrigger: { trigger: ".topics", start: "top 82%", once: true } });

  /* ---------- Trajetória: cartões chegam dos dois lados da linha ---------- */
  items.forEach((item, i) => {
    const card = item.querySelector(".timeline__card");
    gsap.from(card, {
      x: wide ? (i % 2 ? 60 : -60) : 30,
      autoAlpha: 0,
      duration: 1.1,
      ease: "expo.out",
      clearProps: "transform",
      scrollTrigger: { trigger: item, start: "top 80%", once: true },
    });
  });

  /* ---------- Processo: etapas viram em perspectiva, uma após a outra ---------- */
  gsap.from(".step", {
    y: 60,
    rotateX: -28,
    transformPerspective: 900,
    transformOrigin: "50% 0%",
    autoAlpha: 0,
    duration: 1.1,
    stagger: 0.1,
    ease: "expo.out",
    clearProps: "transform",
    scrollTrigger: { trigger: ".steps", start: "top 80%", once: true },
  });

  /* ---------- Contato ---------- */
  gsap.from(".contact__links li", { y: 24, autoAlpha: 0, scale: 0.92, duration: 0.9, stagger: 0.07, ease: "back.out(1.6)", scrollTrigger: { trigger: ".contact__links", start: "top 90%", once: true } });

  /* ---------- Revelações genéricas restantes ---------- */
  gsap.utils.toArray("[data-reveal]").forEach((n) => {
    if (n.closest(".chapter-head, .contact__inner, .cramer__intro")) return;
    gsap.from(n, { y: 30, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: n, start: "top 88%", once: true } });
  });
  gsap.from(".cramer__intro [data-reveal]", { y: 30, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: ".cramer__intro", start: "top 80%", once: true } });

  refreshLater(ScrollTrigger);
  return { lenis };
}

function refreshLater(ScrollTrigger) {
  window.addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/*
 * Galeria diagonal: o palco fica preso na tela e a rolagem "leva a câmera" por
 * uma diagonal. Camadas em velocidades diferentes dão a profundidade:
 *   fundo     cena 3D (estrelas e planeta), via js/ui/travel.js
 *   meio      números gigantes dos projetos (0,4×)
 *   principal cards, com profundidade real (translateZ) (1×)
 *   frente    partículas que passam rápido (1,8×)
 * O ativo fica no centro com o texto ao lado; ao parar de rolar, a galeria
 * se encaixa no projeto mais próximo.
 */
function setupWorks({ gsap, ScrollTrigger, getLenis }) {
  const works = document.querySelector("[data-works]");
  const items = works ? [...works.querySelectorAll(".project")] : [];
  if (items.length < 2) return;
  const stage = works.querySelector(".works__stage");
  const frames = items.map((p) => p.querySelector(".project__frame"));
  const dots = [...works.querySelectorAll("[data-go]")];
  const num = works.querySelector("[data-works-num]");
  const bar = works.querySelector("[data-works-bar]");
  const total = works.querySelector("[data-works-total]");
  const last = items.length - 1;
  const pad = (n) => String(n).padStart(2, "0");
  if (total) total.textContent = pad(items.length);
  travel.n = items.length;

  /* Camada do meio: números gigantes */
  const ghostWrap = works.querySelector("[data-works-ghosts]");
  const ghosts = items.map((p, i) => {
    const g = document.createElement("span");
    g.className = "works__ghost";
    g.textContent = pad(i + 1);
    g.style.setProperty("--accent", p.style.getPropertyValue("--accent"));
    ghostWrap?.append(g);
    return g;
  });

  /* Camada da frente: partículas */
  const dustWrap = works.querySelector("[data-works-dust]");
  const rand = (n) => { const x = Math.sin(n * 91.7) * 43758.5453; return x - Math.floor(x); };
  const dust = Array.from({ length: window.innerWidth < 768 ? 10 : 22 }, (_, i) => {
    const d = document.createElement("span");
    d.className = "works__mote";
    const size = 2 + rand(i + 3) * 5;
    d.style.width = d.style.height = `${size.toFixed(1)}px`;
    d.style.opacity = (0.25 + rand(i + 7) * 0.5).toFixed(2);
    if (size > 5) d.style.filter = "blur(1.5px)";
    dustWrap?.append(d);
    return { el: d, bx: rand(i + 1), by: rand(i + 2), k: 1.3 + rand(i + 5) * 1.2 };
  });

  works.classList.add("is-diagonal");

  let step = { x: 0, y: 0 };
  let vw = window.innerWidth;
  let vh = window.innerHeight;
  const measure = () => {
    const w = frames[0].offsetWidth;
    const h = frames[0].offsetHeight;
    vw = window.innerWidth;
    vh = window.innerHeight;
    const wide = vw >= 1024;
    // passo entre um projeto e o próximo, ao longo da diagonal
    step = wide ? { x: w * 0.74, y: h * 0.78 } : { x: w * 0.62, y: h * 0.72 };
  };

  const wrap = (v, m) => ((v % m) + m) % m;
  let target = 0;
  let current = 0;
  let vel = 0;
  let active = -1;

  const st = ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: () => `+=${last * window.innerHeight * 0.75}`,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onRefresh: () => { measure(); render(true); },
    onUpdate: (self) => { target = self.progress * last; },
    onToggle: (self) => { travel.on = self.isActive ? 1 : 0; },
  });

  function render(force) {
    const lean = Math.max(-1, Math.min(1, vel * 6)); // inclinação conforme a velocidade
    for (let i = 0; i < items.length; i++) {
      const d = i - current;
      const a = Math.min(Math.abs(d), 3);
      // os que já passaram somem mais rápido, para não cobrir o texto
      const alpha = d < 0 ? Math.max(0, 1 + d * 1.7) : Math.max(0, 1 - d * 0.42);
      gsap.set(frames[i], {
        xPercent: -50,
        yPercent: -50,
        x: d * step.x,
        y: d * step.y,
        z: -a * 360, // profundidade real: os vizinhos ficam mais longe da câmera
        rotationY: -9 - lean * 6,
        rotationX: 4 + lean * 2,
        rotationZ: -lean * 1.5,
        transformPerspective: 1600,
        autoAlpha: alpha,
        zIndex: 100 - Math.round(a * 10),
      });
      // números gigantes: mesma diagonal, menos da metade da velocidade
      if (ghosts[i]) {
        gsap.set(ghosts[i], {
          x: d * step.x * 0.4,
          y: d * step.y * 0.4,
          autoAlpha: Math.max(0, 1 - Math.abs(d) * 0.8),
        });
      }
    }
    // partículas: passam mais rápido que os cards e dão a volta na tela
    for (const m of dust) {
      const x = wrap(m.bx * vw * 1.2 - current * step.x * m.k, vw * 1.2) - vw * 0.1;
      const y = wrap(m.by * vh * 1.2 - current * step.y * m.k, vh * 1.2) - vh * 0.1;
      m.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
    travel.t = current;
    if (bar) bar.parentElement.style.setProperty("--p", (current / last).toFixed(4));
    const next = Math.round(current);
    if (next !== active) setActive(next, force);
  }

  function setActive(i, instant) {
    const prev = items[active];
    active = i;
    items.forEach((p, k) => p.classList.toggle("is-active", k === i));
    dots.forEach((b, k) => (k === i ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")));
    if (num) num.textContent = pad(i + 1);
    if (instant) return;
    // o texto também troca na diagonal: o novo chega de baixo/direita
    const parts = items[i].querySelectorAll("[data-anim]");
    gsap.fromTo(parts, { x: 36, y: 28, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.04, ease: "power3.out", overwrite: true });
    if (prev) gsap.set(prev.querySelectorAll("[data-anim]"), { clearProps: "all" });
  }

  // a posição na tela persegue a rolagem com amortecimento: começa e termina suave
  gsap.ticker.add(() => {
    const diff = target - current;
    if (Math.abs(diff) < 0.0005 && Math.abs(vel) < 0.0005) {
      if (current !== target) { current = target; vel = 0; render(); }
      return;
    }
    const prev = current;
    current += diff * 0.09;
    vel += (current - prev - vel) * 0.25;
    render();
  });

  const posOf = (i) => st.start + (st.end - st.start) * (i / last);
  const goTo = (i, duration = 1.3) => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(posOf(i), { duration, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
    else window.scrollTo({ top: posOf(i), behavior: "smooth" });
  };
  dots.forEach((b) => b.addEventListener("click", () => goTo(Number(b.dataset.go))));

  // ao parar de rolar (roda, trackpad ou toque), encaixa no projeto mais próximo
  ScrollTrigger.addEventListener("scrollEnd", () => {
    if (!st.isActive) return;
    const p = st.progress * last;
    const i = Math.round(p);
    if (Math.abs(p - i) > 0.02) goTo(i, 0.8);
  });

  // clicar num projeto que não é o ativo traz ele para o centro
  frames.forEach((f, i) => f.addEventListener("click", (e) => {
    if (i === active) return;
    e.preventDefault();
    goTo(i);
  }));

  // teclado: ao focar um link de outro projeto, a galeria vai até ele
  items.forEach((p, i) => p.addEventListener("focusin", () => { if (i !== active) goTo(i); }));

  new ResizeObserver(() => { measure(); render(true); }).observe(stage);
  measure();
  render(true);
}
