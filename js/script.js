(function () {
  "use strict";

  /* ---------- Reveal elements left at opacity:0 (dead Framer Motion entrance state) ---------- */
  function initRevealAnimations() {
    var excluded = new Set();
    var waBtn = document.querySelector('a[aria-label="Falar no WhatsApp"]');
    if (waBtn) excluded.add(waBtn);
    document.querySelectorAll("[data-faq-panel]").forEach(function (p) { excluded.add(p); });

    var targets = Array.prototype.filter.call(document.querySelectorAll("[style]"), function (el) {
      return el.style.opacity === "0" && !excluded.has(el);
    });

    function reveal(el) {
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease, filter 0.6s ease";
      el.style.opacity = "1";
      el.style.transform = "none";
      if (el.style.filter && el.style.filter.indexOf("blur") !== -1) {
        el.style.filter = "none";
      }
    }

    if (!("IntersectionObserver" in window)) {
      targets.forEach(reveal);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Header scroll state + top progress bar ---------- */
  function initHeader() {
    var header = document.querySelector("[data-header]");
    var bar = document.querySelector("[data-scroll-progress]");
    var floatingWa = document.querySelector('a[aria-label="Falar no WhatsApp"]');
    if (!header && !bar && !floatingWa) return;

    function onScroll() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var progress = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;

      if (header) {
        if (scrollTop > 40) {
          header.classList.remove("bg-transparent");
          header.classList.add("border-b", "border-white/[0.07]", "bg-black/60", "backdrop-blur-xl");
        } else {
          header.classList.add("bg-transparent");
          header.classList.remove("border-b", "border-white/[0.07]", "bg-black/60", "backdrop-blur-xl");
        }
      }
      if (bar) {
        bar.style.transform = "scaleX(" + progress + ")";
      }
      if (floatingWa) {
        if (scrollTop > 600) {
          floatingWa.style.opacity = "1";
          floatingWa.style.transform = "translateY(0)";
        } else {
          floatingWa.style.opacity = "0";
          floatingWa.style.transform = "translateY(120px)";
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Spotlight cursor-follow glow on cards (--mx/--my) ---------- */
  function initSpotlight() {
    var els = Array.prototype.filter.call(
      document.querySelectorAll("[style*='--mx']"),
      function (el) { return true; }
    );
    els.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty("--mx", x + "%");
        el.style.setProperty("--my", y + "%");
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    var items = document.querySelectorAll("[data-faq-item]");
    items.forEach(function (item) {
      var btn = item.querySelector("[data-faq-btn]");
      var panel = item.querySelector("[data-faq-panel]");
      var icon = btn ? btn.querySelector("svg") : null;
      if (!btn || !panel) return;

      // Normalize already-open panel to its real height.
      if (btn.getAttribute("aria-expanded") === "true") {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }

      btn.addEventListener("click", function () {
        var isOpen = btn.getAttribute("aria-expanded") === "true";
        var next = !isOpen;
        btn.setAttribute("aria-expanded", String(next));
        item.setAttribute("data-active", String(next));

        if (next) {
          item.classList.remove("border-white/10", "bg-white/[0.03]", "hover:border-white/20");
          item.classList.add("border-[#043581]/50", "bg-white/[0.06]");
          panel.style.maxHeight = panel.scrollHeight + "px";
          panel.style.opacity = "1";
        } else {
          item.classList.remove("border-[#043581]/50", "bg-white/[0.06]");
          item.classList.add("border-white/10", "bg-white/[0.03]", "hover:border-white/20");
          panel.style.maxHeight = "0px";
          panel.style.opacity = "0";
        }
        if (icon) {
          icon.style.transition = "transform 0.3s ease";
          icon.style.transform = next ? "rotate(45deg)" : "rotate(0deg)";
        }
      });
    });
  }

  /* ---------- Platform selector ---------- */
  function initPlatforms() {
    var buttons = document.querySelectorAll("[data-platform-btn]");
    var ctaText = document.querySelector("[data-platform-cta-text]");
    var ctaLink = document.querySelector("[data-platform-cta-link]");
    var ctaLabel = document.querySelector("[data-platform-cta-label]");
    if (!buttons.length) return;

    var ACTIVE = ["border-[#043581]", "bg-[#043581]/20", "text-white", "shadow-[0_0_30px_rgba(4,53,129,0.35)]"];
    var INACTIVE = ["border-white/10", "bg-white/[0.04]", "text-white/75", "hover:border-white/30"];

    function select(name, btn) {
      buttons.forEach(function (b) {
        var active = b === btn;
        b.setAttribute("aria-pressed", String(active));
        var svg = b.querySelector("svg");
        if (active) {
          INACTIVE.forEach(function (c) { b.classList.remove(c); });
          ACTIVE.forEach(function (c) { b.classList.add(c); });
          if (svg) svg.style.color = "#d6e4f7";
        } else {
          ACTIVE.forEach(function (c) { b.classList.remove(c); });
          INACTIVE.forEach(function (c) { b.classList.add(c); });
          if (svg) svg.style.color = "#4a7fc4";
        }
      });

      if (ctaText) ctaText.textContent = "Recuperamos contas do " + name + " todos os dias.";
      if (ctaLabel) ctaLabel.textContent = "Recuperar conta do " + name;
      if (ctaLink) {
        var message = "Olá! Perdi o acesso à minha conta do " + name + " e preciso de ajuda.";
        ctaLink.setAttribute("href", "https://wa.me/5551980559350?text=" + encodeURIComponent(message));
      }
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        select(btn.dataset.platformName, btn);
      });
    });
  }

  /* ---------- "Como funciona" scroll-driven steps ---------- */
  var RECOVERY_STEPS = [
    { n: "01", title: "Contato inicial", desc: "Fale conosco pelo WhatsApp. Entendemos sua situação e tiramos suas dúvidas.", status: "Conta comprometida", tone: "danger" },
    { n: "02", title: "Diagnóstico gratuito", desc: "Analisamos seu caso sem compromisso e explicamos as chances reais de sucesso.", status: "Caso em análise", tone: "warn", badge: "Grátis" },
    { n: "03", title: "Plano de ação", desc: "Definimos a estratégia ideal para o seu caso, com prazo e investimento claros.", status: "Estratégia definida", tone: "info" },
    { n: "04", title: "Execução", desc: "Nossa equipe trabalha na recuperação da sua conta com atualizações em tempo real.", status: "Recuperação em andamento", tone: "info" },
    { n: "05", title: "Blindagem + acompanhamento", desc: "Conta recuperada, aplicamos blindagem de segurança e oferecemos suporte contínuo.", status: "Acesso restaurado e blindado", tone: "ok" }
  ];

  var TONE = {
    danger: { color: "#f87171", bg: "rgba(248,113,113,0.14)" },
    warn: { color: "#fbbf24", bg: "rgba(251,191,36,0.14)" },
    info: { color: "#a78bfa", bg: "rgba(10,61,145,0.18)" },
    ok: { color: "#34d399", bg: "rgba(52,211,153,0.14)" }
  };

  // Approximate lucide icon paths per step (index-based; step 3 uses a spin override).
  var STEP_ICON_SVG = [
    '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>',
    '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path>',
    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path>',
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>'
  ];

  function initRecoverySteps() {
    var container = document.querySelector("[data-recovery-container]");
    if (!container) return;

    var glitchLines = document.querySelector("[data-recovery-glitchlines]");
    var iconWrap = document.querySelector("[data-recovery-icon-wrap]");
    var icon = document.querySelector("[data-recovery-icon]");
    var status = document.querySelector("[data-recovery-status]");
    var percentLabel = document.querySelector("[data-recovery-percent-label]");
    var percentBar = document.querySelector("[data-recovery-percent-bar]");
    var chatBubble = document.querySelector("[data-recovery-chatbubble]");
    var numberEl = document.querySelector("[data-recovery-number]");
    var topProgress = document.querySelector("[data-recovery-top-progress]");
    var titleEl = document.querySelector("[data-recovery-title]");
    var descEl = document.querySelector("[data-recovery-desc]");
    var dots = document.querySelectorAll("[data-recovery-stepdots] > li");

    var lastIndex = -1;

    function render(index, overallProgress) {
      var step = RECOVERY_STEPS[index];
      var tone = TONE[step.tone];
      var percent = Math.round(((index + 1) / RECOVERY_STEPS.length) * 100);

      if (topProgress) topProgress.style.transform = "scaleX(" + overallProgress + ")";
      if (percentBar) percentBar.style.width = percent + "%";
      if (percentLabel) percentLabel.textContent = percent + "%";
      if (numberEl) numberEl.textContent = step.n;

      if (index !== lastIndex) {
        lastIndex = index;
        if (status) {
          status.textContent = step.status;
          status.style.color = tone.color;
          status.style.background = tone.bg;
        }
        if (iconWrap) {
          iconWrap.style.background = tone.color;
          iconWrap.style.boxShadow = "0 0 24px " + tone.color + "88";
        }
        if (icon) {
          icon.innerHTML = STEP_ICON_SVG[index];
          icon.classList.toggle("animate-spin", step.n === "04");
        }
        if (glitchLines) glitchLines.style.display = step.tone === "danger" ? "" : "none";
        if (chatBubble) chatBubble.style.display = index === 0 ? "" : "none";
        if (titleEl) {
          titleEl.textContent = step.title;
          if (step.badge) {
            var badge = document.createElement("span");
            badge.className = "rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-bold tracking-wide text-emerald-300";
            badge.textContent = step.badge;
            titleEl.appendChild(document.createTextNode(" "));
            titleEl.appendChild(badge);
          }
        }
        if (descEl) descEl.textContent = step.desc;
        dots.forEach(function (li, i) {
          var dot = li.children[0];
          var label = li.children[1];
          if (dot) {
            dot.style.background = i <= index ? "#043581" : "rgba(255,255,255,0.12)";
            dot.style.width = (i === index ? 36 : 24) + "px";
          }
          if (label) {
            label.className = "transition-colors duration-500 " + (i === index ? "text-white" : i < index ? "text-white/55" : "text-white/30");
          }
        });
      }
    }

    function update() {
      var rect = container.getBoundingClientRect();
      var total = container.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      var scrolled = -rect.top;
      var progress = Math.min(1, Math.max(0, scrolled / total));
      var index = Math.min(RECOVERY_STEPS.length - 1, Math.max(0, Math.floor(progress * RECOVERY_STEPS.length)));
      render(index, progress);
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initRevealAnimations();
    initHeader();
    initSpotlight();
    initFaq();
    initPlatforms();
    initRecoverySteps();
  });
})();
