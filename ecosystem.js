(function () {
  "use strict";

  var project = document.body.dataset.project;
  document.querySelectorAll(
    ".ecosystem-rail__links [data-project], .ecosystem-grid [data-project]"
  ).forEach(function (link) {
    if (link.dataset.project === project) link.setAttribute("aria-current", "page");
  });

  var rail = document.querySelector(".ecosystem-rail");
  var projectToggle = rail && rail.querySelector(".ecosystem-rail__brand");
  var projectMenu = rail && rail.querySelector(".ecosystem-rail__links");
  function setProjectMenu(open) {
    if (!rail || !projectToggle || !projectMenu) return;
    rail.classList.toggle("is-open", open);
    projectToggle.setAttribute("aria-expanded", String(open));
    projectToggle.setAttribute("aria-label", (open ? "Close" : "Open") + " workshop projects");
    projectMenu.setAttribute("aria-hidden", String(!open));
    if (open) projectMenu.removeAttribute("inert");
    else projectMenu.setAttribute("inert", "");
  }
  if (projectToggle && projectMenu) {
    projectToggle.addEventListener("click", function () {
      setProjectMenu(projectToggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && projectToggle.getAttribute("aria-expanded") === "true") {
        setProjectMenu(false);
        projectToggle.focus();
      }
    });
    document.addEventListener("click", function (event) {
      if (projectToggle.getAttribute("aria-expanded") === "true" && !rail.contains(event.target)) {
        setProjectMenu(false);
      }
    });
  }

  var progress = document.querySelector(".ecosystem-progress span");
  var ticking = false;
  function updateProgress() {
    if (progress) {
      var available = document.documentElement.scrollHeight - innerHeight;
      var amount = available > 0 ? Math.min(1, scrollY / available) : 0;
      progress.style.transform = "scaleX(" + amount + ")";
    }
    ticking = false;
  }
  addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
  updateProgress();

  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("ecosystem-ready");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll("[data-eco-reveal]").forEach(function (el) {
      observer.observe(el);
    });
  }

  document.querySelectorAll(".ecosystem-card").forEach(function (card) {
    card.addEventListener("pointermove", function (event) {
      var box = card.getBoundingClientRect();
      card.style.setProperty("--mx", (event.clientX - box.left) + "px");
      card.style.setProperty("--my", (event.clientY - box.top) + "px");
    });
  });

  /* One slow ease through every project's accent and then white.
     The geometry does not spin and the colour does not cut: each stop holds,
     then smoothsteps into the next. Both marks read the same custom property.
     Reduced motion stays on the plain white line. */
  if (!document.querySelector(".ecosystem-mark")) return;

  var flowerStops = [
    [182, 154, 255], /* gateway */
    [255, 188, 82],  /* voice */
    [113, 229, 210], /* protoke */
    [154, 230, 110], /* preflight */
    [122, 167, 255], /* siphon */
    [231, 155, 216], /* auto-sort */
    [79, 208, 240],  /* interpreter */
    [255, 138, 184], /* companion */
    [255, 118, 95],  /* tools */
    [255, 216, 79],  /* polyglot */
    [232, 168, 120], /* voice-core */
    [110, 217, 160], /* speech-core */
    [185, 195, 208], /* site-core */
    [255, 255, 255]
  ];
  var flowerDwell = 5200;
  var flowerFrame = 0;
  var flowerStarted = performance.now();
  var flowerReduced = matchMedia("(prefers-reduced-motion: reduce)");

  function flowerEase(value) {
    return value * value * (3 - 2 * value);
  }
  function paintFlower(now) {
    var count = flowerStops.length;
    var cycle = flowerDwell * count;
    /* The first frame's timestamp can be earlier than the clock we sampled
       when the script ran, and a negative remainder walks off the palette. */
    var elapsed = (typeof now === "number" ? now : flowerStarted) - flowerStarted;
    if (!(elapsed >= 0)) elapsed = 0;
    elapsed = elapsed % cycle;
    var index = Math.min(count - 1, Math.max(0, Math.floor(elapsed / flowerDwell)));
    var next = (index + 1) % count;
    var along = (elapsed % flowerDwell) / flowerDwell;
    var t = along < 0.42 ? 0 : flowerEase((along - 0.42) / 0.58);
    var from = flowerStops[index];
    var to = flowerStops[next];
    var channels = [0, 1, 2].map(function (i) {
      return Math.round(from[i] + (to[i] - from[i]) * t);
    });
    document.documentElement.style.setProperty(
      "--eco-flower",
      "rgb(" + channels[0] + "," + channels[1] + "," + channels[2] + ")"
    );
  }
  function tickFlower(now) {
    if (document.hidden || flowerReduced.matches) {
      flowerFrame = 0;
      return;
    }
    paintFlower(now);
    flowerFrame = requestAnimationFrame(tickFlower);
  }
  function startFlower() {
    if (flowerReduced.matches) {
      document.documentElement.style.setProperty("--eco-flower", "#f5f5f7");
      if (flowerFrame) cancelAnimationFrame(flowerFrame);
      flowerFrame = 0;
      return;
    }
    if (!flowerFrame) flowerFrame = requestAnimationFrame(tickFlower);
  }
  addEventListener("visibilitychange", function () {
    if (!document.hidden) startFlower();
  });
  if (flowerReduced.addEventListener) flowerReduced.addEventListener("change", startFlower);
  else flowerReduced.addListener(startFlower);
  startFlower();
})();
