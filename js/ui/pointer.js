/*
 * Microinterações de ponteiro (só com mouse/trackpad):
 * cursor próprio, inclinação dos cartões e botões magnéticos.
 */
export function setupPointer({ reduceMotion }) {
  const root = document.documentElement;
  const cursor = document.querySelector(".cursor");
  const label = document.querySelector("[data-cursor-label]");

  /* ---------- Cursor ---------- */
  if (cursor) {
    root.classList.add("has-cursor");
    const target = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let raf = 0;
    const loop = () => {
      ring.x += (target.x - ring.x) * 0.2;
      ring.y += (target.y - ring.y) * 0.2;
      cursor.style.setProperty("--x", `${ring.x.toFixed(1)}px`);
      cursor.style.setProperty("--y", `${ring.y.toFixed(1)}px`);
      raf = Math.abs(target.x - ring.x) + Math.abs(target.y - ring.y) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      cursor.style.setProperty("--dx", `${e.clientX}px`);
      cursor.style.setProperty("--dy", `${e.clientY}px`);
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    document.addEventListener("pointerover", (e) => {
      const view = e.target.closest("[data-cursor]");
      cursor.classList.toggle("is-view", !!view);
      if (view && label) label.textContent = view.dataset.cursor;
      cursor.classList.toggle("is-hover", !view && !!e.target.closest("a, button, input, [role='button']"));
    });

    document.documentElement.addEventListener("pointerleave", () => {
      target.x = target.y = -100;
      cursor.style.setProperty("--dx", "-100px");
      cursor.style.setProperty("--dy", "-100px");
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }

  if (reduceMotion) return;

  /* ---------- Inclinação dos cartões ---------- */
  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const card = e.target.closest("[data-tilt]");
    if (!card) return;
    const r = card.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width;
    const my = (e.clientY - r.top) / r.height;
    card.style.setProperty("--mx", mx.toFixed(3));
    card.style.setProperty("--my", my.toFixed(3));
    card.style.setProperty("--ry", `${((mx - 0.5) * 7).toFixed(2)}deg`);
    card.style.setProperty("--rx", `${((0.5 - my) * 5).toFixed(2)}deg`);
  }, { passive: true });

  document.addEventListener("pointerout", (e) => {
    const card = e.target.closest?.("[data-tilt]");
    if (!card || card.contains(e.relatedTarget)) return;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--mx", "0.5");
    card.style.setProperty("--my", "0.5");
  });

  /* ---------- Botões magnéticos ---------- */
  document.querySelectorAll("[data-magnetic]").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = b.getBoundingClientRect();
      b.style.setProperty("--bx", `${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px`);
      b.style.setProperty("--by", `${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px`);
    });
    b.addEventListener("pointerleave", () => {
      b.style.setProperty("--bx", "0px");
      b.style.setProperty("--by", "0px");
    });
  });
}
