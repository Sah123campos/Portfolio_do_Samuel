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
  setupWorks({ gsap, ScrollTrigger, getLenis: () => lenis, reduceMotion });

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
 * Galeria diagonal: um projeto enorme por vez.
 *
 * Uma única posição (`current`, em projetos: 0 = primeiro, 1 = segundo...)
 * comanda tudo: painéis, texto, partículas e a cena 3D (via js/ui/travel.js).
 * Três entradas mexem nela, sem sistemas paralelos:
 *   rolagem  o palco fica preso e a rolagem avança a sequência (ScrollTrigger + Lenis)
 *   arraste  o painel segue o dedo/mouse; ao soltar, completa ou volta (GSAP)
 *   botões   setas, números e teclado (GSAP)
 * Depois de um arraste ou clique, a rolagem é sincronizada em silêncio com o
 * novo projeto; como o palco está preso, isso não mexe nada na tela.
 *
 * Os vizinhos esperam na diagonal (o próximo embaixo à direita, o anterior em
 * cima à esquerda), menores, mais fundos e mais apagados; durante o movimento
 * o painel inclina de leve e volta reto ao parar.
 */
function setupWorks({ gsap, ScrollTrigger, getLenis, reduceMotion }) {
  const works = document.querySelector("[data-works]");
  const items = works ? [...works.querySelectorAll(".project")] : [];
  if (items.length < 2) return;
  const stage = works.querySelector("[data-works-stage]");
  const frames = items.map((p) => p.querySelector(".project__frame"));
  const bodies = items.map((p) => p.querySelector(".project__body"));
  const names = items.map((p) => p.querySelector(".project__name")?.textContent || "");
  const dots = [...works.querySelectorAll("[data-go]")];
  const num = works.querySelector("[data-works-num]");
  const bar = works.querySelector("[data-works-bar]");
  const total = works.querySelector("[data-works-total]");
  const live = works.querySelector("[data-works-live]");
  const prevBtn = works.querySelector("[data-works-prev]");
  const nextBtn = works.querySelector("[data-works-next]");
  const last = items.length - 1;
  const pad = (n) => String(n).padStart(2, "0");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  if (total) total.textContent = pad(items.length);
  travel.n = items.length;
  stage.tabIndex = 0;

  /* Camada da frente: partículas */
  const dustWrap = works.querySelector("[data-works-dust]");
  const rand = (n) => { const x = Math.sin(n * 91.7) * 43758.5453; return x - Math.floor(x); };
  const dust = reduceMotion ? [] : Array.from({ length: window.innerWidth < 768 ? 8 : 14 }, (_, i) => {
    const d = document.createElement("span");
    d.className = "works__mote";
    const size = 2 + rand(i + 3) * 4;
    d.style.width = d.style.height = `${size.toFixed(1)}px`;
    d.style.opacity = (0.2 + rand(i + 7) * 0.4).toFixed(2);
    if (size > 4.5) d.style.filter = "blur(1.5px)";
    dustWrap?.append(d);
    return { el: d, bx: rand(i + 1), by: rand(i + 2), k: 1.3 + rand(i + 5) * 1.0 };
  });

  works.classList.add("is-diagonal");

  /* Geometria: passo da diagonal entre um painel e o próximo */
  let W = 1;
  let step = { x: 0, y: 0 };
  let vw = window.innerWidth;
  let vh = window.innerHeight;
  const measure = () => {
    W = frames[0].offsetWidth || 1;
    const H = frames[0].offsetHeight || 1;
    vw = window.innerWidth;
    vh = window.innerHeight;
    // o próximo espera logo depois da borda direita, um pouco mais abaixo
    step = { x: W * 0.96, y: H * 0.24 };
  };

  /* Estado */
  let current = 0; // posição exibida
  let target = 0; // posição pedida pela rolagem
  let lastShown = 0;
  let vel = 0; // velocidade (projetos por quadro), para a inclinação
  let active = -1;
  let manual = false; // arraste ou animação de botão no comando
  let tween = null;
  let dragging = false;
  const wrap = (v, m) => ((v % m) + m) % m;
  const lean = reduceMotion ? 0 : 1;

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
    vel += (current - lastShown - vel) * 0.3;
    lastShown = current;
    const tilt = clamp(vel * 40, -1, 1) * lean; // só inclina em movimento

    for (let i = 0; i < items.length; i++) {
      const d = i - current;
      const a = Math.min(Math.abs(d), 2.5);
      // o anterior some rápido; o próximo espera mais apagado
      const alpha = d < 0 ? Math.max(0, 1 + d * 1.4) : Math.max(0, 1 - d * 0.5);
      gsap.set(frames[i], {
        xPercent: -50,
        yPercent: -50,
        x: d * step.x,
        y: d * step.y,
        z: -a * 260,
        scale: 1 - a * 0.08,
        rotationY: -tilt * 5,
        rotationZ: -tilt * 0.8,
        transformPerspective: 1800,
        autoAlpha: alpha,
        zIndex: 100 - Math.round(a * 10),
      });
      // o texto acompanha o painel de perto e se apaga longe do centro
      const td = Math.abs(d);
      gsap.set(bodies[i], { x: d * Math.min(140, step.x * 0.12), opacity: Math.max(0, 1 - td * 2.6) });
    }
    for (const m of dust) {
      const x = wrap(m.bx * vw * 1.2 - current * step.x * m.k * 0.6, vw * 1.2) - vw * 0.1;
      const y = wrap(m.by * vh * 1.2 - current * step.y * m.k * 1.6, vh * 1.2) - vh * 0.1;
      m.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
    travel.t = current;
    if (bar) bar.parentElement.style.setProperty("--p", (current / last).toFixed(4));
    const next = clamp(Math.round(current), 0, last);
    if (next !== active) setActive(next, force);
  }

  function setActive(i, quiet) {
    active = i;
    items.forEach((p, k) => p.classList.toggle("is-active", k === i));
    dots.forEach((b, k) => (k === i ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")));
    if (num) num.textContent = pad(i + 1);
    if (prevBtn) prevBtn.disabled = i === 0;
    if (nextBtn) nextBtn.disabled = i === last;
    if (!quiet && live) live.textContent = `Projeto ${i + 1} de ${items.length}: ${names[i]}`;
  }

  /* Rolagem: a posição persegue a rolagem com amortecimento */
  gsap.ticker.add(() => {
    if (manual) return;
    const diff = target - current;
    if (Math.abs(diff) < 0.0005) {
      if (current !== target || Math.abs(vel) > 0.0001) { current = target; render(); }
      return;
    }
    current += diff * 0.09;
    render();
  });

  // 1 px para dentro nas pontas: na borda exata o ScrollTrigger considera a galeria solta
  const posOf = (i) => clamp(st.start + (st.end - st.start) * (i / last), st.start + 1, st.end - 1);
  const inGallery = () => { const y = window.scrollY; return y >= st.start - 2 && y <= st.end + 2; };
  // leva a rolagem para o projeto i sem animar (o palco está preso, nada pula)
  function syncScroll(i) {
    const y = posOf(i);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
    target = i;
  }

  /* Vai até o projeto i com uma animação contínua (setas, números, teclado, fim do arraste) */
  function navigate(i, { duration, from } = {}) {
    i = clamp(i, 0, last);
    tween?.kill();
    // fora do trecho preso, rola até a galeria em vez de pular
    if (!inGallery() && !manual) {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(posOf(i), { duration: 1.2 });
      else window.scrollTo({ top: posOf(i), behavior: "smooth" });
      return;
    }
    manual = true;
    const dist = Math.abs(i - current);
    const dur = duration ?? (reduceMotion ? 0.35 : Math.min(1.6, 0.75 + dist * 0.12));
    const o = { v: from ?? current };
    tween = gsap.to(o, {
      v: i,
      duration: dur,
      ease: "power3.out",
      onUpdate: () => { current = o.v; render(); },
      onComplete: () => {
        current = i;
        syncScroll(i);
        manual = false;
        render();
      },
    });
  }

  prevBtn?.addEventListener("click", () => navigate(active - 1));
  nextBtn?.addEventListener("click", () => navigate(active + 1));
  dots.forEach((b) => b.addEventListener("click", () => navigate(Number(b.dataset.go))));

  // teclado: setas, Home e End com o foco na galeria
  stage.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select")) return;
    const map = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: last };
    if (!(e.key in map)) return;
    e.preventDefault();
    navigate(map[e.key]);
  });

  // ao parar de rolar, encaixa no projeto mais próximo
  ScrollTrigger.addEventListener("scrollEnd", () => {
    if (!inGallery() || manual || dragging) return;
    const p = st.progress * last;
    const i = Math.round(p);
    if (Math.abs(p - i) > 0.02) navigate(i, { duration: reduceMotion ? 0.3 : 0.7 });
  });

  /* ---------- Arraste lateral (mouse e toque) ---------- */
  let pending = null; // gesto começou, eixo ainda indefinido
  let moved = false;
  let startX = 0;
  let startY = 0;
  let startPos = 0;
  let samples = [];

  const rubber = (v) => {
    // nas pontas, resiste em vez de passar do primeiro/último
    if (v < 0) return -(1 - 1 / (1 - v * 0.9)) / 0.9 * 0.35;
    if (v > last) return last + (1 - 1 / (1 + (v - last) * 0.9)) / 0.9 * 0.35;
    return v;
  };

  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("button, .project__body a, .works__hud")) return;
    pending = { id: e.pointerId };
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
  });

  // o gesto é acompanhado na janela toda: o dedo pode sair do palco sem perder o arraste
  window.addEventListener("pointermove", (e) => {
    if (pending && pending.id === e.pointerId && !dragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      // gesto mais vertical: deixa a página rolar
      if (Math.abs(dy) > Math.abs(dx)) { pending = null; return; }
      dragging = true;
      moved = true;
      manual = true;
      tween?.kill();
      startPos = current;
      samples = [{ t: performance.now(), v: current }];
      stage.classList.add("is-dragging");
    }
    if (!dragging || e.pointerId !== pending?.id) return;
    const dx = e.clientX - startX;
    current = rubber(startPos - dx / step.x);
    const now = performance.now();
    samples.push({ t: now, v: current });
    while (samples.length > 2 && now - samples[0].t > 100) samples.shift();
    render();
  });

  function endDrag(e) {
    if (pending && e.pointerId !== pending.id) return;
    pending = null;
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("is-dragging");
    // velocidade nos últimos ~100 ms, em projetos por segundo
    const a = samples[0];
    const b = samples[samples.length - 1];
    const speed = a && b ? (b.v - a.v) / (Math.max(16, b.t - a.t) / 1000) : 0;
    const base = Math.round(startPos);
    const delta = current - base;
    let next = base;
    // passou de ~18% da largura ou foi um gesto rápido (> ~380 px/s): completa a troca
    const flick = Math.abs(speed * step.x) > 380 && Math.abs(delta) > 0.03;
    if (delta > 0.18 || (flick && speed > 0)) next = base + 1;
    else if (delta < -0.18 || (flick && speed < 0)) next = base - 1;
    next = clamp(next, 0, last);
    const dist = Math.abs(next - current);
    // a duração considera a velocidade do gesto: continua o movimento sem tranco
    const dur = reduceMotion ? 0.3 : clamp(0.45 + dist * 0.55 - Math.min(Math.abs(speed), 4) * 0.05, 0.4, 0.95);
    manual = true;
    navigateFromDrag(next, dur);
  }

  function navigateFromDrag(i, dur) {
    tween?.kill();
    const o = { v: current };
    tween = gsap.to(o, {
      v: i,
      duration: dur,
      ease: "power3.out",
      onUpdate: () => { current = o.v; render(); },
      onComplete: () => {
        current = i;
        if (inGallery()) syncScroll(i);
        else {
          // galeria ainda não presa: leva a página até ela, já no projeto escolhido
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(posOf(i), { duration: 1 });
          else window.scrollTo({ top: posOf(i), behavior: "smooth" });
        }
        manual = false;
        render();
      },
    });
  }

  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  // depois de arrastar, o clique que vem junto não abre o link
  stage.addEventListener("click", (e) => {
    if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; return; }
    const f = e.target.closest(".project__frame");
    const i = frames.indexOf(f);
    if (i >= 0 && i !== active) { e.preventDefault(); navigate(i); }
  }, true);
  stage.addEventListener("dragstart", (e) => e.preventDefault());

  // teclado: ao focar um link de outro projeto, a galeria vai até ele
  items.forEach((p, i) => p.addEventListener("focusin", () => { if (i !== active) navigate(i); }));

  new ResizeObserver(() => { measure(); render(true); }).observe(stage);
  measure();
  render(true);
}
