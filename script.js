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
