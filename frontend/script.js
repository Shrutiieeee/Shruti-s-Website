

function openModal(src) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");

  if (modal && modalImg) {
    modalImg.src = src;
    modal.classList.remove("hidden");
    modal.style.display = "flex"; // for non-Tailwind modal fallback
  }
}

function closeModal() {
  const modal = document.getElementById("imageModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Optional: Close modal if clicking outside the image
  const modal = document.getElementById("imageModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.id === "imageModal" || e.target.classList.contains("close")) {
        closeModal();
      }
    });
  }
});
