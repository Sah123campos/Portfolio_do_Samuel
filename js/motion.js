/*
 * Coreografia da página com GSAP + ScrollTrigger (e Lenis para a rolagem suave).
 * Cada seção tem um comportamento próprio; nada prende a rolagem.
 * Só roda quando as bibliotecas carregaram. Com "menos movimento" ativo,
 * as animações ficam mais rápidas e a rolagem fica nativa (sem inércia).
 */
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

  /* ---------- Projetos: a imagem se abre como uma cortina, o texto chega do lado ---------- */
  document.querySelectorAll(".project").forEach((p) => {
    const flip = p.classList.contains("is-flip");
    const visual = p.querySelector(".project__visual");
    const parts = p.querySelectorAll("[data-anim]");
    const tl = gsap.timeline({ scrollTrigger: { trigger: p, start: "top 82%", once: true } });
    tl.fromTo(visual,
      { clipPath: `inset(18% ${flip ? "0% 18% 36%" : "36% 18% 0%"} round 28px)`, autoAlpha: 0 },
      { clipPath: "inset(0% 0% 0% 0% round 28px)", autoAlpha: 1, duration: 1.5, ease: "expo.out", clearProps: "clipPath" }, 0)
      .from(parts, { x: flip ? -40 : 40, autoAlpha: 0, duration: 1, stagger: 0.06, ease: "power3.out" }, 0.25);
    const ghost = p.querySelector(".project__ghost");
    if (ghost) {
      gsap.fromTo(ghost, { y: 80 }, { y: -80, ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: true } });
    }
  });

  /* Órbita que conecta os destaques: uma luz percorre o caminho com a rolagem */
  setupGalleryOrbit(gsap, ScrollTrigger);

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

/* Caminho curvo entre os centros das imagens em destaque, com uma luz que o percorre */
function setupGalleryOrbit(gsap, ScrollTrigger) {
  const svg = document.querySelector("[data-gallery-orbit]");
  const wrap = svg?.parentElement;
  if (!svg || !wrap) return;
  const ns = "http://www.w3.org/2000/svg";
  svg.innerHTML = '<defs><linearGradient id="orbitGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9d8cff"/><stop offset="1" stop-color="#7fe3ff"/></linearGradient></defs>';
  const path = document.createElementNS(ns, "path");
  const dot = document.createElementNS(ns, "circle");
  dot.setAttribute("r", "4");
  svg.append(path, dot);

  let len = 0;
  let progress = 0;
  function build() {
    const box = wrap.getBoundingClientRect();
    const pts = [...wrap.querySelectorAll(".project__visual")].map((v) => {
      const r = v.getBoundingClientRect();
      const flip = v.closest(".project").classList.contains("is-flip");
      // ponto na borda interna da imagem, voltado para o texto
      return { x: (flip ? r.left : r.right) - box.left, y: r.top + r.height / 2 - box.top };
    });
    if (pts.length < 2) return;
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const midY = (a.y + b.y) / 2;
      d += ` C${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
    }
    path.setAttribute("d", d);
    len = path.getTotalLength();
    place();
  }
  function place() {
    if (!len) return;
    const p = path.getPointAtLength(len * progress);
    dot.setAttribute("cx", p.x.toFixed(1));
    dot.setAttribute("cy", p.y.toFixed(1));
  }

  ScrollTrigger.create({
    trigger: wrap,
    start: "top 55%",
    end: "bottom 55%",
    onUpdate: (st) => { progress = st.progress; place(); },
    onRefresh: build,
  });
  new ResizeObserver(() => build()).observe(wrap);
  build();
}
