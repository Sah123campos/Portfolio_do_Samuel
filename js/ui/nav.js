/*
 * Navegação: seção atual no menu, barra de progresso, indicador de capítulo,
 * cabeçalho que se recolhe ao rolar e menu móvel acessível.
 */

/* Seção → link do menu (Engenharia faz parte de Tecnologias no menu) */
const NAV_OF = { inicio: "inicio", projetos: "projetos", tecnologias: "tecnologias", engenharia: "tecnologias", trajetoria: "trajetoria", processo: "processo", contato: "contato" };

export function setupNav({ scrollTo } = {}) {
  const root = document.documentElement;
  const header = document.querySelector("[data-header]");
  const sections = [...document.querySelectorAll("main > section[id]")];
  const navLinks = [...document.querySelectorAll("[data-nav-link]")];
  const pill = document.querySelector("[data-nav-pill]");
  const progress = document.querySelector("[data-progress]");
  const meterNum = document.querySelector("[data-meter-num]");
  const meterName = document.querySelector("[data-meter-name]");
  const meterBar = document.querySelector("[data-meter-bar]");
  const menu = document.querySelector("[data-menu]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const toggleLabel = document.querySelector("[data-menu-label]");
  const menuLinks = menu ? [...menu.querySelectorAll("a")] : [];

  /* ---------- Seção atual ---------- */
  let current = "";
  function setCurrent(id) {
    if (id === current) return;
    current = id;
    const navId = NAV_OF[id] || id;
    navLinks.forEach((a) => (a.dataset.navLink === navId ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
    menuLinks.forEach((a) => (a.getAttribute("href") === `#${navId}` ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
    movePill();
    const idx = sections.findIndex((s) => s.id === id);
    if (meterNum) meterNum.textContent = String(idx + 1).padStart(2, "0");
    if (meterName) meterName.textContent = sections[idx]?.dataset.chapter || "";
  }

  function movePill() {
    if (!pill) return;
    const a = navLinks.find((l) => l.hasAttribute("aria-current"));
    if (!a) { pill.style.setProperty("--o", "0"); return; }
    pill.style.setProperty("--x", `${a.offsetLeft}px`);
    pill.style.setProperty("--w", `${a.offsetWidth}px`);
    pill.style.setProperty("--o", "1");
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setCurrent(e.target.id); });
  }, { rootMargin: "-45% 0px -54% 0px" });
  sections.forEach((s) => io.observe(s));

  /* ---------- Progresso e cabeçalho ---------- */
  let lastY = window.scrollY;
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      progress?.style.setProperty("--p", p.toFixed(4));
      meterBar?.style.setProperty("--p", p.toFixed(4));
      header?.classList.toggle("is-scrolled", y > 40);
      // Recolhe ao descer, volta ao subir — nunca com o foco dentro do cabeçalho
      const down = y > lastY + 4;
      const up = y < lastY - 4;
      if (down && y > window.innerHeight * 0.8 && !header.contains(document.activeElement) && !root.classList.contains("menu-open")) header.classList.add("is-hidden");
      else if (up || y < 80) header.classList.remove("is-hidden");
      lastY = y;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  header?.addEventListener("focusin", () => header.classList.remove("is-hidden"));
  window.addEventListener("resize", movePill);
  document.fonts?.ready.then(movePill);
  onScroll();

  /* ---------- Links internos ---------- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const id = a.getAttribute("href").slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (root.classList.contains("menu-open")) closeMenu(false);
    if (scrollTo) scrollTo(target);
    else target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    // Move o foco para a seção, para quem navega pelo teclado ou leitor de tela
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    history.replaceState(null, "", `#${id}`);
  });

  /* ---------- Menu móvel ---------- */
  const outside = [document.querySelector("main"), document.querySelector(".site-footer"), document.querySelector(".brand")].filter(Boolean);

  function openMenu() {
    menu.hidden = false;
    void menu.offsetWidth; // aplica o estado inicial antes da transição
    menu.classList.add("is-open");
    root.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
    toggleLabel.textContent = "Fechar menu";
    outside.forEach((n) => n.setAttribute("inert", ""));
    setTimeout(() => menuLinks[0]?.focus(), 80);
  }

  function closeMenu(returnFocus = true) {
    menu.classList.remove("is-open");
    root.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggleLabel.textContent = "Abrir menu";
    outside.forEach((n) => n.removeAttribute("inert"));
    const done = () => { if (!menu.classList.contains("is-open")) menu.hidden = true; };
    setTimeout(done, 750);
    if (returnFocus) toggle.focus();
  }

  toggle?.addEventListener("click", () => (menu.classList.contains("is-open") ? closeMenu() : openMenu()));

  document.addEventListener("keydown", (e) => {
    if (!menu?.classList.contains("is-open")) return;
    if (e.key === "Escape") { e.preventDefault(); closeMenu(); return; }
    if (e.key !== "Tab") return;
    // Mantém o foco entre o botão de fechar e os links do menu
    const items = [toggle, ...menu.querySelectorAll("a")];
    const i = items.indexOf(document.activeElement);
    if (e.shiftKey && (i <= 0)) { e.preventDefault(); items[items.length - 1].focus(); }
    else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
  });

  window.matchMedia("(min-width: 64em)").addEventListener("change", (m) => { if (m.matches && menu?.classList.contains("is-open")) closeMenu(false); });

  return { setCurrent };
}
