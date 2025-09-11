/* ===== Tiny utils ===== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ===== Footer year ===== */
const y = $("#year");
if (y) y.textContent = new Date().getFullYear();

/* ===== Carousel ===== */
(function initCarousel(){
  const root = $(".carousel");
  if (!root) return;

  const viewport = $(".viewport", root);
  const slides = $$(".slide", viewport);
  const prevBtn = $(".cbtn.prev", root);
  const nextBtn = $(".cbtn.next", root);
  const dotsWrap = $(".dots", root.closest("section")) || $(".dots");

  let index = 0;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Go to slide ${i+1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = $$(".dot", dotsWrap);

  function goTo(i){
    index = (i + slides.length) % slides.length;

    // Pause other videos and switch visibility
    slides.forEach((s, si) => {
      const v = $("video", s);
      if (v){
        v.pause();
        if (si !== index) { try { v.currentTime = 0; } catch(_){} }
      }
      s.classList.toggle("is-active", si === index);
      s.setAttribute("aria-hidden", si === index ? "false" : "true");
    });

    dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
  }

  function next(){ goTo(index + 1); }
  function prev(){ goTo(index - 1); }

  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  // Keyboard
  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  // Touch swipe
  let startX = 0, dx = 0, touching = false;
  viewport.addEventListener("touchstart", (e) => {
    touching = true;
    startX = e.touches[0].clientX;
    dx = 0;
  }, {passive:true});
  viewport.addEventListener("touchmove", (e) => {
    if (!touching) return;
    dx = e.touches[0].clientX - startX;
  }, {passive:true});
  viewport.addEventListener("touchend", () => {
    if (!touching) return;
    if (dx < -40) next();
    if (dx > 40) prev();
    touching = false; dx = 0;
  });

  // Init
  goTo(0);
})();

/* Pause other videos when one starts */
document.addEventListener("play", function(e){
  if (e.target.tagName !== "VIDEO") return;
  $$("video").forEach(v => { if (v !== e.target) v.pause(); });
}, true);
/* ========= Tabs ========= */
(function initTabs(){
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));
  if (!tabs.length) return;

  function activate(id){
    tabs.forEach(t => {
      const on = t.id === `tab-${id}`;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach(p => {
      const on = p.id === `panel-${id}`;
      p.classList.toggle("is-active", on);
      if (on) p.removeAttribute("hidden"); else p.setAttribute("hidden","");
    });
    // When switching panels, ensure its first slide is active
    const firstCarousel = document.querySelector(`#panel-${id} .carousel`);
    if (firstCarousel) initializeCarousel(firstCarousel, true);
  }

  tabs.forEach(t => {
    t.addEventListener("click", () => activate(t.id.replace("tab-","")));
    t.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(t.id.replace("tab-","")); }
    });
  });

  // initial
  const active = document.querySelector(".tab.is-active");
  if (active) activate(active.id.replace("tab-",""));
})();

/* ========= Multi-carousel support ========= */
/* Reuse logic for each .carousel on the page */
function initializeCarousel(root, forceReset = false){
  if (!root) return;
  // Avoid re-init unless forced
  if (root.__inited && !forceReset) return;
  root.__inited = true;

  const viewport = root.querySelector(".viewport");
  const slides = Array.from(viewport.querySelectorAll(".slide"));
  const prevBtn = root.querySelector(".cbtn.prev");
  const nextBtn = root.querySelector(".cbtn.next");
  const dotsWrap = root.parentElement.querySelector(".dots");

  let index = 0;

  // Build dots (clear first to handle re-init)
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Go to slide ${i+1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.querySelectorAll(".dot"));

  function goTo(i){
    index = (i + slides.length) % slides.length;
    slides.forEach((s, si) => {
      const v = s.querySelector("video");
      if (v){ v.pause(); if (si !== index) try { v.currentTime = 0; } catch(_){} }
      s.classList.toggle("is-active", si === index);
      s.setAttribute("aria-hidden", si === index ? "false" : "true");
    });
    dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
  }
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  // touch swipe
  let startX = 0, dx = 0, touching = false;
  viewport.addEventListener("touchstart", (e) => { touching = true; startX = e.touches[0].clientX; dx = 0; }, {passive:true});
  viewport.addEventListener("touchmove", (e) => { if (touching) dx = e.touches[0].clientX - startX; }, {passive:true});
  viewport.addEventListener("touchend", () => {
    if (!touching) return;
    if (dx < -40) next();
    if (dx > 40) prev();
    touching = false; dx = 0;
  });

  goTo(0);
}

/* Initialize all carousels on load */
document.querySelectorAll(".carousel").forEach(c => initializeCarousel(c));

/* Pause other videos when one starts playing */
document.addEventListener("play", function(e){
  if (e.target.tagName !== "VIDEO") return;
  document.querySelectorAll("video").forEach(v => { if (v !== e.target) v.pause(); });
}, true);
document.addEventListener('DOMContentLoaded', () => {
  const hoverCapable = matchMedia('(hover: hover)').matches && matchMedia('(pointer: fine)').matches;

  const setupHoverVideo = (video) => {
    // Pause by default on desktop; play when hovered, pause on leave
    try { video.pause(); } catch {}
    video.addEventListener('mouseenter', () => { video.play().catch(() => {}); });
    video.addEventListener('mouseleave', () => {
      try { video.pause(); } catch {}
      // optional: reset to first frame so it looks “clean” again
      video.currentTime = 0;
    });
  };

  const setupMobileAutoplay = (video) => {
    // Autoplay silently on mobile when ~50% visible; pause when not
    const tryPlay = () => video.play().catch(() => {});
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tryPlay();
          } else {
            try { video.pause(); } catch {}
          }
        });
      }, { threshold: 0.5 });
      io.observe(video);
    } else {
      // Fallback: just try to play
      tryPlay();
    }
  };

  document.querySelectorAll('video.autoplay-video').forEach((video) => {
    // Ensure attributes that make autoplay possible on mobile
    video.muted = true;
    video.setAttribute('playsinline', '');
    // Route behavior per device
    if (hoverCapable) {
      setupHoverVideo(video);
    } else if (video.dataset.autoplayMobile === 'true') {
      setupMobileAutoplay(video);
    }
  });
});
