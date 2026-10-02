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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.className = "form-status";
    status.textContent = "";

    const allValid = Object.keys(rules).map(validateField).every(Boolean);
    if (!allValid) {
      status.classList.add("fail");
      status.textContent = "Merci de corriger les champs indiqués.";
      return;
    }

    /* Sans serveur, on ouvre le logiciel de messagerie du visiteur avec le message prérempli.
       Pour un envoi automatique, remplacez ce bloc par un appel à un service
       comme Formspree, EmailJS ou votre propre back-end. */
    const to = "argas.center@gmail.com";
    const subject = `Demande de devis : ${form.elements.service.value}`;
    const body =
      `Nom : ${form.elements.nom.value}\n` +
      `E-mail : ${form.elements.email.value}\n\n` +
      form.elements.message.value;

    window.location.href =
      `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    status.classList.add("success");
    status.textContent = "Merci ! Votre message est prêt à être envoyé depuis votre messagerie.";
    form.reset();
  });
});