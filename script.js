/* =========================
   Lightbox System (global)
========================= */

function openLightbox(src) {
  const img = document.getElementById("lightbox-img");
  const box = document.getElementById("lightbox");

  if (!img || !box) return;

  img.src = src;
  box.classList.add("show");
}

function closeLightbox() {
  const box = document.getElementById("lightbox");
  if (!box) return;

  box.classList.remove("show");
}

/* Close on ESC key */
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeLightbox();
  }
});