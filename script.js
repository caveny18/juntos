// === Personaliza tu número de WhatsApp y el mensaje ===
const WA_NUMBER = "51900000000"; // <-- Cambia por tu número con código país, sin + (ej: Perú 51)
const WA_TEXT_DEFAULT = encodeURIComponent("¡Hola, Juntos! Quiero más info 🙂");

// Mensaje específico para fogata
const WA_TEXT_FOGATA = encodeURIComponent(
  "¡Hola, Juntos! Quiero comprar la Fogata en casa (S/ 127). ¿Me ayudas con el pedido?"
);

// Construye links
const waBase = `https://wa.me/${WA_NUMBER}?text=`;
const waDefaultLink = `${waBase}${WA_TEXT_DEFAULT}`;
const waFogataLink = `${waBase}${WA_TEXT_FOGATA}`;

// Asignar CTA globales
const waCtas = document.querySelectorAll("#wa-cta, #wa-cta-dinamica");
waCtas.forEach(a => a && (a.href = waDefaultLink));

// Modal Fogata
const modal = document.querySelector("#modal-fogata");
const openBtns = document.querySelectorAll("[data-open-modal='fogata']");
const closeBtn = modal?.querySelector("[data-close-modal]");
const buyBtn = document.querySelector("#wa-buy");

openBtns.forEach(btn => btn.addEventListener("click", () => {
  if (!modal) return;
  modal.showModal();
  if (buyBtn) buyBtn.href = waFogataLink;
}));

closeBtn?.addEventListener("click", () => modal.close());

// Cerrar modal con ESC
modal?.addEventListener("cancel", (e) => {
  e.preventDefault();
  modal.close();
});

// Año footer
document.querySelectorAll("#year").forEach(s => s.textContent = new Date().getFullYear());

// Nav toggle
const toggle = document.querySelector(".nav__toggle");
const nav = document.querySelector(".nav");
toggle?.addEventListener("click", () => nav.classList.toggle("open"));

// Reveal on scroll
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, {threshold: 0.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
/* =======================
   Fondo “Aurora” en Canvas
   ======================= */
(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const c = document.getElementById("bg");
  if (!c || prefersReduced) return;

  const ctx = c.getContext("2d", { alpha: true });
  let w, h, dpr, t = 0;
  let pointer = { x: 0.5, y: 0.5 };
  const BLOBS = 7;                 // # de luces orgánicas
  const blobs = [];

  const colors = [
    [255, 77, 109],   // rosa brand
    [255, 143, 163],  // rosa claro
    [255, 208, 218],  // pastel
    [140, 160, 255],  // azulado tenue
    [255, 220, 160],  // dorado suave
  ];

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = c.clientWidth = window.innerWidth;
    h = c.clientHeight = window.innerHeight;
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Inicia blobs en posiciones aleatorias
  for (let i=0; i<BLOBS; i++){
    blobs.push({
      x: Math.random(), y: Math.random(),
      r: 140 + Math.random()*220,
      spx: 0.0006 + Math.random()*0.0012,
      spy: 0.0006 + Math.random()*0.0012,
      col: colors[i % colors.length],
      phase: Math.random()*Math.PI*2
    });
  }

  // Movimiento guiado por ruido simple y el puntero
  function loop(ts){
    t += 0.016; // tiempo simulado
    ctx.clearRect(0,0,w,h);

    // fondo muy sutil para dar profundidad
    const bgGrad = ctx.createRadialGradient(w*0.2, h*0.2, 50, w*0.5, h*0.5, Math.max(w,h));
    bgGrad.addColorStop(0, "rgba(10,10,12,0.25)");
    bgGrad.addColorStop(1, "rgba(10,10,12,0.0)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0,0,w,h);

    // Mezcla aditiva de “luces”
    ctx.globalCompositeOperation = "lighter";

    for (const b of blobs){
      // Oscilación orgánica
      b.x += Math.sin(t*b.spx + b.phase) * 0.0006 + (pointer.x - 0.5) * 0.0007;
      b.y += Math.cos(t*b.spy + b.phase) * 0.0006 + (pointer.y - 0.5) * 0.0007;

      // Encierra en 0..1 pero con wrap suave
      if (b.x < -0.2) b.x = 1.2; if (b.x > 1.2) b.x = -0.2;
      if (b.y < -0.2) b.y = 1.2; if (b.y > 1.2) b.y = -0.2;

      const cx = b.x * w;
      const cy = b.y * h;
      const rad = b.r + Math.sin(t*0.6 + b.phase)*20;

      // Degradado radial suave
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      const c0 = `rgba(${b.col[0]}, ${b.col[1]}, ${b.col[2]}, 0.16)`;
      const c1 = `rgba(${b.col[0]}, ${b.col[1]}, ${b.col[2]}, 0.0)`;
      g.addColorStop(0, c0);
      g.addColorStop(1, c1);

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI*2);
      ctx.fill();
    }

    // leve viñeta para foco
    ctx.globalCompositeOperation = "source-over";
    const v = ctx.createLinearGradient(0, 0, 0, h);
    v.addColorStop(0, "rgba(0,0,0,0.15)");
    v.addColorStop(0.5, "rgba(0,0,0,0.05)");
    v.addColorStop(1, "rgba(0,0,0,0.25)");
    ctx.fillStyle = v;
    ctx.fillRect(0,0,w,h);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Parallax suave con mouse/touch
  function setPointer(e){
    const rect = c.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      pointer.x = (e.touches[0].clientX - rect.left) / rect.width;
      pointer.y = (e.touches[0].clientY - rect.top) / rect.height;
    } else {
      pointer.x = (e.clientX - rect.left) / rect.width;
      pointer.y = (e.clientY - rect.top) / rect.height;
    }
  }
  window.addEventListener("pointermove", setPointer, { passive: true });
  window.addEventListener("touchmove", setPointer, { passive: true });

  // Pausar si pestaña inactiva (ahorro batería)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) ctx.clearRect(0,0,w,h);
  });
})();
