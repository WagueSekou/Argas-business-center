/* =========================================================
   ARGAS BUSINESS CENTER SARL : script.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Année du pied de page ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- En-tête : ombre au défilement ---------- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");

  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  };

  toggle.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => setMenu(false))
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---------- Lien actif selon la section visible ---------- */
  const links = [...nav.querySelectorAll("a:not(.nav-cta)")];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((a) =>
              a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id)
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* ---------- Slider de la page d'accueil ---------- */
  const slider = document.getElementById("slider");
  if (slider) {
    const viewport = slider.querySelector(".slider-viewport");
    const track = slider.querySelector(".slider-track");
    const slides = [...track.children];
    const dotsWrap = slider.querySelector(".slider-dots");
    const btnPrev = slider.querySelector(".slider-btn.prev");
    const btnNext = slider.querySelector(".slider-btn.next");
    const btnToggle = slider.querySelector(".slider-toggle");

    const DELAY = 5000; // temps entre deux images, en millisecondes
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let index = 0;
    let wantsPlay = !reduceMotion; // choix de la personne (bouton pause)
    let hovering = false;
    let focused = false;
    let timer = null;

    const dots = slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot";
      dot.setAttribute("aria-label", `Aller à l'image ${i + 1}`);
      dot.addEventListener("click", () => { goTo(i); start(); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((slide, k) => {
        slide.inert = k !== index; // les images cachées ne reçoivent pas le focus clavier
        slide.setAttribute("aria-hidden", String(k !== index));
      });
      dots.forEach((dot, k) => dot.setAttribute("aria-current", String(k === index)));
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }

    function start() {
      stop();
      if (wantsPlay && !hovering && !focused && !document.hidden && slides.length > 1) {
        timer = setInterval(() => goTo(index + 1), DELAY);
      }
    }

    function updateToggle() {
      btnToggle.dataset.state = wantsPlay ? "playing" : "paused";
      btnToggle.setAttribute(
        "aria-label",
        wantsPlay ? "Mettre le défilement en pause" : "Reprendre le défilement"
      );
      track.setAttribute("aria-live", wantsPlay ? "off" : "polite");
    }

    btnPrev.addEventListener("click", () => { goTo(index - 1); start(); });
    btnNext.addEventListener("click", () => { goTo(index + 1); start(); });
    btnToggle.addEventListener("click", () => {
      wantsPlay = !wantsPlay;
      updateToggle();
      start();
    });

    // Pause quand la souris ou le clavier est sur le slider, ou quand l'onglet est caché
    slider.addEventListener("mouseenter", () => { hovering = true; stop(); });
    slider.addEventListener("mouseleave", () => { hovering = false; start(); });
    slider.addEventListener("focusin", () => { focused = true; stop(); });
    slider.addEventListener("focusout", () => { focused = false; start(); });
    document.addEventListener("visibilitychange", start);

    // Flèches du clavier
    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { goTo(index - 1); start(); }
      if (e.key === "ArrowRight") { goTo(index + 1); start(); }
    });

    // Balayage au doigt (téléphone et tablette)
    let startX = null;
    let startY = null;
    viewport.addEventListener("pointerdown", (e) => {
      startX = e.clientX;
      startY = e.clientY;
    });
    viewport.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        goTo(index + (dx < 0 ? 1 : -1));
        start();
      }
    });
    viewport.addEventListener("pointercancel", () => { startX = null; });

    goTo(0);
    updateToggle();
    start();
  }

  /* ---------- Formulaire de contact ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  const rules = {
    nom: {
      test: (v) => v.trim().length >= 2,
      msg: "Indiquez votre nom (2 caractères minimum).",
    },
    email: {
      test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      msg: "Indiquez une adresse e-mail valide, par exemple nom@exemple.com.",
    },
    message: {
      test: (v) => v.trim().length >= 10,
      msg: "Votre message doit contenir au moins 10 caractères.",
    },
  };

  const validateField = (name) => {
    const input = form.elements[name];
    const ok = rules[name].test(input.value);
    input.closest(".field").classList.toggle("invalid", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    document.getElementById("err-" + name).textContent = ok ? "" : rules[name].msg;
    return ok;
  };

  Object.keys(rules).forEach((name) => {
    form.elements[name].addEventListener("blur", () => validateField(name));
    form.elements[name].addEventListener("input", () => {
      if (form.elements[name].closest(".field").classList.contains("invalid")) {
        validateField(name);
      }
    });
  });

  /* ---------- Envoi de la demande par e-mail ----------
     Le service gratuit FormSubmit reçoit les données du formulaire
     et les transmet par e-mail à l'adresse ci-dessous. */
  const TO_EMAIL = "noeltouani@yahoo.fr";
  const ENDPOINT = "https://formsubmit.co/ajax/" + TO_EMAIL;
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitLabel = submitBtn.textContent;

  const mailtoLink = () => {
    const subject = `Demande de devis : ${form.elements.service.value}`;
    const body =
      `Nom : ${form.elements.nom.value}\n` +
      `E-mail : ${form.elements.email.value}\n\n` +
      form.elements.message.value;
    return `mailto:${TO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form-status";
    status.textContent = "";

    // 1) Vérification des champs
    const allValid = Object.keys(rules).map(validateField).every(Boolean);
    if (!allValid) {
      status.classList.add("fail");
      status.textContent = "Merci de corriger les champs indiqués.";
      return;
    }

    // 2) Piège anti-robots : un humain ne remplit jamais ce champ caché
    if (form.elements._honey && form.elements._honey.value) return;

    // 3) Envoi
    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours…";
    status.textContent = "Envoi de votre demande…";

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form), // nom, email, service, message + champs cachés
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && String(result.success) === "true") {
        status.classList.add("success");
        status.textContent =
          "Merci ! Votre demande a bien été envoyée. Nous vous répondons rapidement.";
        form.reset();
        form.querySelectorAll(".field").forEach((f) => f.classList.remove("invalid"));
      } else {
        throw new Error(result.message || "Envoi refusé");
      }
    } catch (err) {
      // En cas de problème (pas de connexion, service indisponible...), on propose une solution de secours
      status.classList.add("fail");
      status.innerHTML =
        "L'envoi a échoué. Réessayez dans un instant, ou " +
        `<a href="${mailtoLink()}">envoyez-nous votre demande depuis votre messagerie</a>` +
        " ou par WhatsApp.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  });
});