(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------------
   Page Loader
   --------------------------------------------------------------- */
var pageLoader = document.getElementById("page-loader");

if (pageLoader) {
  window.addEventListener("load", function () {
    setTimeout(function () {
      pageLoader.classList.add("is-hidden");
    }, 300);
  });
}

  /* ---------------------------------------------------------------
     Header: scroll state + mobile nav toggle
     --------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  var body = document.body;

  function setHeaderState() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add("is-solid");
    } else if (!header.classList.contains("is-open")) {
      header.classList.remove("is-solid");
    }
  }
  if (header) {
    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });
  }

  function closeNav() {
    if (!header) return;
    header.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    body.classList.remove("no-scroll");
    setHeaderState();
  }
  function openNav() {
    header.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    body.classList.add("no-scroll");
  }
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      if (header.classList.contains("is-open")) {
        closeNav();
      } else {
        openNav();
      }
    });
  }
  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* ---------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* balance-line animate-in */
  var lines = document.querySelectorAll(".balance-line[data-animate]");
  if (lines.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      lines.forEach(function (l) { l.classList.add("animate"); });
    } else {
      var lio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
            lio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      lines.forEach(function (l) { lio.observe(l); });
    }
  }

  /* ---------------------------------------------------------------
     Animated stat counters
     --------------------------------------------------------------- */
  var counters = document.querySelectorAll("[data-counter]");
  function animateCounter(el) {
    var target = el.getAttribute("data-counter");
    var match = target.match(/^(\d+)(\+?)$/);
    if (!match) { el.textContent = target; return; }
    var end = parseInt(match[1], 10);
    var suffix = match[2] || "";
    if (reduceMotion) { el.textContent = end + suffix; return; }
    var start = 0;
    var duration = 1100;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (end - start) * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cio.observe(c); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ---------------------------------------------------------------
     True masonry packing (shortest-column-first), replacing the
     buggy CSS `columns` approach which could strand tall images
     and leave large gaps in a column.
     --------------------------------------------------------------- */
  var galleryEl = document.getElementById("event-gallery");
  if (galleryEl) {
    var masonryItems = Array.prototype.slice.call(galleryEl.querySelectorAll(".masonry-item"));

    function columnCountFor(width) {
      if (width >= 1024) return 4;
      if (width >= 640) return 3;
      return 2;
    }

    function buildMasonry() {
      var count = columnCountFor(window.innerWidth);
      if (galleryEl.getAttribute("data-cols") === String(count)) return;
      galleryEl.setAttribute("data-cols", String(count));

      var cols = [];
      var heights = [];
      galleryEl.innerHTML = "";
      for (var c = 0; c < count; c++) {
        var col = document.createElement("div");
        col.className = "masonry-col";
        galleryEl.appendChild(col);
        cols.push(col);
        heights.push(0);
      }
      masonryItems.forEach(function (item) {
        var w = parseFloat(item.getAttribute("data-w")) || 1;
        var h = parseFloat(item.getAttribute("data-h")) || 1;
        var shortest = 0;
        for (var i = 1; i < heights.length; i++) {
          if (heights[i] < heights[shortest]) shortest = i;
        }
        cols[shortest].appendChild(item);
        heights[shortest] += h / w;
      });
    }

    buildMasonry();
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildMasonry, 150);
    });
  }

  /* ---------------------------------------------------------------
     Gallery lightbox
     --------------------------------------------------------------- */
  var galleryData = window.__GALLERY__ || [];
  var lightbox = document.getElementById("lightbox");
  if (lightbox && galleryData.length) {
    var lbImg = document.getElementById("lb-img");
    var lbSource = document.getElementById("lb-source");
    var lbCount = document.getElementById("lb-count");
    var lbClose = lightbox.querySelector(".lb-close");
    var lbPrev = lightbox.querySelector(".lb-prev");
    var lbNext = lightbox.querySelector(".lb-next");
    var lbIndex = 0;
    var lastFocused = null;

    function showLb(i) {
      lbIndex = (i + galleryData.length) % galleryData.length;
      var item = galleryData[lbIndex];
      lbSource.setAttribute("srcset", item.fullWebp);
      lbImg.setAttribute("src", item.full);
      lbImg.setAttribute("alt", item.alt);
      lbCount.textContent = (lbIndex + 1) + " / " + galleryData.length;
    }
    function openLb(i) {
      lastFocused = document.activeElement;
      showLb(i);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      body.classList.add("no-scroll");
      lbClose.focus();
    }
    function closeLb() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      body.classList.remove("no-scroll");
      if (lastFocused) lastFocused.focus();
    }

    // Event delegation: survives the masonry container being rebuilt on resize.
    if (galleryEl) {
      galleryEl.addEventListener("click", function (e) {
        var btn = e.target.closest ? e.target.closest(".masonry-item") : null;
        if (btn) openLb(parseInt(btn.getAttribute("data-index"), 10));
      });
    }
    lbClose.addEventListener("click", closeLb);
    lbPrev.addEventListener("click", function () { showLb(lbIndex - 1); });
    lbNext.addEventListener("click", function () { showLb(lbIndex + 1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLb();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") showLb(lbIndex - 1);
      if (e.key === "ArrowRight") showLb(lbIndex + 1);
    });
  }

  /* ---------------------------------------------------------------
     Hero image carousel
     --------------------------------------------------------------- */
  var carousel = document.getElementById("hero-carousel");
  if (carousel) {
    var heroControls = carousel.parentElement.querySelector(".hero-controls") || carousel;
    var heroCopy = document.getElementById("hero-copy");
    var slides = carousel.querySelectorAll(".hc-slide");
    var dots = heroControls.querySelectorAll(".hc-dot");
    var current = 0;
    var timer = null;
    var AUTOPLAY_MS = 5500;
    var COPY_SWAP_MS = 260;

    function updateCopy(slide) {
      if (!heroCopy) return;
      var eyebrow = heroCopy.querySelector("[data-hero-eyebrow]");
      var heading = heroCopy.querySelector("[data-hero-heading]");
      var desc = heroCopy.querySelector("[data-hero-desc]");
      var cta = heroCopy.querySelector("[data-hero-cta]");
      var apply = function () {
        if (eyebrow) eyebrow.textContent = slide.getAttribute("data-eyebrow") || "";
        if (heading) heading.innerHTML = slide.getAttribute("data-heading") || "";
        if (desc) desc.textContent = slide.getAttribute("data-desc") || "";
        if (cta) {
          cta.textContent = slide.getAttribute("data-cta-text") || "";
          cta.setAttribute("href", slide.getAttribute("data-cta-href") || "#");
        }
      };
      if (reduceMotion) { apply(); return; }
      heroCopy.classList.add("is-fading");
      window.setTimeout(function () {
        apply();
        heroCopy.classList.remove("is-fading");
      }, COPY_SWAP_MS);
    }

    function goTo(index) {
      index = (index + slides.length) % slides.length;
      slides[current].classList.remove("is-active");
      dots[current] && dots[current].classList.remove("is-active");
      dots[current] && dots[current].setAttribute("aria-selected", "false");
      current = index;
      slides[current].classList.add("is-active");
      dots[current] && dots[current].classList.add("is-active");
      dots[current] && dots[current].setAttribute("aria-selected", "true");
      updateCopy(slides[current]);
    }
    function next() { goTo(current + 1); }
    function startAutoplay() {
      if (reduceMotion) return;
      stopAutoplay();
      timer = setInterval(next, AUTOPLAY_MS);
    }
    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { goTo(i); startAutoplay(); });
    });
    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", startAutoplay);
    heroControls.addEventListener("mouseenter", stopAutoplay);
    heroControls.addEventListener("mouseleave", startAutoplay);
    heroControls.addEventListener("focusin", stopAutoplay);
    heroControls.addEventListener("focusout", startAutoplay);

    startAutoplay();
  }

  /* ---------------------------------------------------------------
     Active nav link
     --------------------------------------------------------------- */
  var here = (location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".nav-desktop a, .mobile-nav a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === here || (here === "" && href === "index.html")) {
      a.classList.add("is-active");
    }
  });

  /* ---------------------------------------------------------------
     Mobile accordion (practice areas / other lists with data-accordion)
     --------------------------------------------------------------- */
  document.querySelectorAll("[data-accordion-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      if (panel) panel.style.maxHeight = open ? null : panel.scrollHeight + "px";
    });
  });

  /* ---------------------------------------------------------------
     Consultation form: client-side validation + mailto handoff
     --------------------------------------------------------------- */
var form = document.getElementById("consultation-form");

if (form) {
  var statusBox = document.getElementById("form-status");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var valid = true;
    var fields = form.querySelectorAll("[data-required]");

    fields.forEach(function (field) {
      var wrap = field.closest(".field");
      var value = field.value.trim();
      var ok = value.length > 0;

      if (field.type === "email" && ok) {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }

      wrap.classList.toggle("has-error", !ok);

      if (!ok) {
        valid = false;
      }
    });

    if (!valid) {
      if (statusBox) {
        statusBox.textContent =
          "Please check the highlighted fields and try again.";

        statusBox.classList.add("is-visible");
      }

      return;
    }

    var formData = new FormData(form);

    fetch("https://formsubmit.co/ajax/ajmal1479@gmail.com", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Submission failed");
        }

        return response.json();
      })
      .then(function () {
        if (statusBox) {
          var name = formData.get("name") || "there";

          statusBox.textContent =
            "Thank you, " +
            name.split(" ")[0] +
            ". Your message has been sent successfully. We will get back to you soon.";

          statusBox.classList.add("is-visible");
        }

        form.reset();
      })
      .catch(function () {
        if (statusBox) {
          statusBox.textContent =
            "Something went wrong. Please try again or email ajmal1479@gmail.com directly.";

          statusBox.classList.add("is-visible");
        }
      });
  });

  form.querySelectorAll("[data-required]").forEach(function (field) {
    field.addEventListener("input", function () {
      field.closest(".field").classList.remove("has-error");
    });
  });
}})();