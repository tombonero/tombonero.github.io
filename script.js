/* =========================================================
   NAVEGACIÓN MÓVIL
   ========================================================= */
(() => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  const label = toggle.querySelector(".menu-toggle__label");

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    label.textContent = open ? "Cerrar" : "Menú";
    document.body.style.overflow = open ? "hidden" : "";
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  // si se agranda la ventana, restablecer el estado
  window.matchMedia("(min-width: 721px)").addEventListener("change", (mq) => {
    if (mq.matches) setOpen(false);
  });
})();

/* =========================================================
   HERO — GUÍAS DE DISEÑO
   Reglas fijas y guías que siguen al cursor mostrando sus
   coordenadas, como en una herramienta de diseño. Solo con
   puntero fino y sin "reduced motion".
   ========================================================= */
(() => {
  const hero = document.querySelector(".hero");
  const guides = document.querySelector(".hero__guides");
  const label = document.querySelector(".guide-label");
  if (!hero || !guides || !label) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (reduceMotion || !finePointer) return;

  let frame = 0;
  let px = 0;
  let py = 0;

  const render = () => {
    frame = 0;
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    // la etiqueta se voltea cerca de los bordes para no salirse
    const lx = px > w - 140 ? px - 128 : px + 12;
    const ly = py > h - 40 ? py - 32 : py + 12;
    guides.style.setProperty("--gx", `${px}px`);
    guides.style.setProperty("--gy", `${py}px`);
    guides.style.setProperty("--lx", `${lx}px`);
    guides.style.setProperty("--ly", `${ly}px`);
    label.textContent = `X ${Math.round(px)} · Y ${Math.round(py)}`;
  };

  hero.addEventListener("pointermove", (e) => {
    const rect = hero.getBoundingClientRect();
    px = e.clientX - rect.left;
    py = e.clientY - rect.top;
    hero.classList.add("is-tracking");
    if (!frame) frame = requestAnimationFrame(render);
  });

  hero.addEventListener("pointerleave", () => {
    hero.classList.remove("is-tracking");
  });
})();

/* =========================================================
   HEADER — LÍNEA INFERIOR AL HACER SCROLL
   ========================================================= */
(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  update();
  window.addEventListener("scroll", update, { passive: true });
})();

/* =========================================================
   APARICIÓN AL HACER SCROLL
   Los elementos con [data-reveal] entran suavemente una vez.
   ========================================================= */
(() => {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  items.forEach((el) => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -5% 0px" });

  items.forEach((el) => io.observe(el));
})();

/* =========================================================
   PROYECTOS — MOVIMIENTO SUTIL DE LA IMAGEN
   El contenido del placeholder sigue levemente al cursor.
   ========================================================= */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (reduceMotion || !finePointer) return;

  const MAX = 8; // px

  document.querySelectorAll(".project").forEach((project) => {
    const media = project.querySelector(".project__media-inner");
    if (!media) return;

    project.addEventListener("pointermove", (e) => {
      const rect = project.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      media.style.setProperty("--mx", `${(nx * MAX * 2).toFixed(1)}px`);
      media.style.setProperty("--my", `${(ny * MAX * 2).toFixed(1)}px`);
    });

    project.addEventListener("pointerleave", () => {
      media.style.setProperty("--mx", "0px");
      media.style.setProperty("--my", "0px");
    });
  });
})();

/* =========================================================
   CONTACTO — COPIAR CORREO
   ========================================================= */
(() => {
  const btn = document.querySelector(".contact__copy");
  if (!btn) return;

  const label = btn.querySelector(".contact__copy-label");
  const original = label.textContent;
  let timer;

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // Alternativa para abrir el archivo localmente (file://)
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  };

  btn.addEventListener("click", async () => {
    try {
      await copyText(btn.dataset.copy);
      label.textContent = "Copiado ✓";
      btn.classList.add("is-copied");
    } catch {
      label.textContent = "No se pudo copiar";
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = original;
      btn.classList.remove("is-copied");
    }, 2000);
  });
})();

/* =========================================================
   PROYECTOS — PANEL LATERAL "VER PROCESO"
   El contenido sale de cada .project (bloque .project__detail),
   así que los textos se editan directamente en el HTML.
   ========================================================= */
(() => {
  const drawer = document.getElementById("drawer");
  const projects = [...document.querySelectorAll(".project")];
  if (!drawer || !projects.length) return;

  const root = document.documentElement;
  const main = document.querySelector("main");
  const header = document.querySelector(".site-header");
  const panel = drawer.querySelector(".drawer__panel");
  const scroller = drawer.querySelector(".drawer__scroll");
  const q = (sel) => drawer.querySelector(sel);

  const ui = {
    index: q("[data-d='index']"),
    total: q("[data-d='total']"),
    img: q(".drawer__media img"),
    mediaBox: q(".drawer__media"),
    title: q(".drawer__title"),
    tech: q(".drawer__tech"),
    tablist: q(".drawer__tabs"),
    tabs: [...drawer.querySelectorAll("[role='tab']")],
    body: q(".drawer__tabpanel"),
    close: q(".drawer__close"),
    prev: q("[data-nav='prev']"),
    next: q("[data-nav='next']"),
  };
  const nameOf = (btn) => btn.querySelector(".drawer__step-name");
  const pad = (n) => String(n).padStart(2, "0");
  const replay = (node, cls) => {
    node.classList.remove(cls);
    void node.offsetWidth; // reinicia la animación
    node.classList.add(cls);
  };

  const data = projects.map((p) => {
    const img = p.querySelector(".project__media img");
    return {
      id: p.id,
      name: p.querySelector(".project__name").textContent.trim(),
      tech: p.querySelector(".project__tech").innerHTML,
      src: img ? img.getAttribute("src") : "",
      alt: img ? img.getAttribute("alt") || "" : "",
      pos: img ? img.style.getPropertyValue("--pos") : "",
      steps: [...p.querySelectorAll(".project__detail section")].map((s) => s.innerHTML),
    };
  });

  let current = 0;
  let step = 0;
  let isOpen = false;
  let lastFocus = null;

  function setStep(n, animate = true) {
    step = n;
    ui.tablist.style.setProperty("--step", n);
    ui.tabs.forEach((tab, k) => {
      tab.setAttribute("aria-selected", String(k === n));
      tab.tabIndex = k === n ? 0 : -1;
    });
    ui.body.setAttribute("aria-labelledby", ui.tabs[n].id);
    ui.body.innerHTML = data[current].steps[n] || "";
    if (animate) replay(ui.body, "is-in");
  }

  function fill(i) {
    const d = data[i];
    const n = data.length;
    current = i;

    ui.index.textContent = pad(i + 1);
    ui.total.textContent = pad(n);
    ui.title.textContent = d.name;
    ui.tech.innerHTML = d.tech;

    ui.mediaBox.hidden = !d.src;
    if (d.src) {
      ui.img.src = d.src;
      ui.img.alt = d.alt;
      ui.img.style.setProperty("--pos", d.pos || "center");
    }

    nameOf(ui.prev).textContent = data[(i - 1 + n) % n].name;
    nameOf(ui.next).textContent = data[(i + 1) % n].name;

    setStep(0);
    scroller.scrollTop = 0;
    replay(scroller, "is-entering");

    try { history.replaceState(null, "", "#" + d.id); } catch (_) { /* file:// puede bloquearlo */ }
  }

  function open(i, trigger) {
    lastFocus = trigger || projects[i].querySelector(".project__more");
    fill(i);
    isOpen = true;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    drawer.inert = false;
    main.inert = true;
    header.inert = true;
    root.classList.add("drawer-lock");
    requestAnimationFrame(() => ui.close.focus({ preventScroll: true }));
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    drawer.inert = true;
    main.inert = false;
    header.inert = false;
    root.classList.remove("drawer-lock");
    try { history.replaceState(null, "", "#proyectos"); } catch (_) { /* ignorar */ }
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  // abrir: botón "Ver proceso" o clic en la imagen
  document.querySelector(".projects__list").addEventListener("click", (e) => {
    const hit = e.target.closest(".project__more, .project__media");
    if (!hit) return;
    const project = hit.closest(".project");
    const i = projects.indexOf(project);
    open(i, project.querySelector(".project__more"));
  });

  // cerrar
  drawer.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) close();
  });

  // anterior / siguiente proyecto
  const go = (dir) => fill((current + dir + data.length) % data.length);
  ui.prev.addEventListener("click", () => go(-1));
  ui.next.addEventListener("click", () => go(1));

  // pestañas
  ui.tabs.forEach((tab, k) => tab.addEventListener("click", () => setStep(k)));
  ui.tablist.addEventListener("keydown", (e) => {
    let n = step;
    if (e.key === "ArrowRight") n = (step + 1) % ui.tabs.length;
    else if (e.key === "ArrowLeft") n = (step - 1 + ui.tabs.length) % ui.tabs.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = ui.tabs.length - 1;
    else return;
    e.preventDefault();
    setStep(n);
    ui.tabs[n].focus();
  });

  // Esc cierra; Tab se queda dentro del panel
  document.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab") return;
    const focusables = [...panel.querySelectorAll("button, [href], [tabindex]")].filter(
      (el) => el.tabIndex >= 0 && !el.disabled && !el.hidden
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // enlace directo a un proyecto (ej. tusitio.com/#p-cassie)
  const fromHash = projects.findIndex((p) => p.id && "#" + p.id === location.hash);
  if (fromHash > -1) {
    projects[fromHash].scrollIntoView({ block: "center", behavior: "instant" });
    open(fromHash);
  }
})();

