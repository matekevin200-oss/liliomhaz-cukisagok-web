const header = document.querySelector("#siteHeader");
const progress = document.querySelector("#scrollProgress");
const menuToggle = document.querySelector("#menuToggle");
const mobileMenu = document.querySelector("#mobileMenu");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxClose = document.querySelector("#lightboxClose");

function updateScrollUi() {
  const top = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header?.classList.toggle("scrolled", top > 12);
  if (progress) progress.style.width = `${max > 0 ? (top / max) * 100 : 0}%`;
}

window.addEventListener("scroll", updateScrollUi, { passive: true });
updateScrollUi();

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Menü megnyitása" : "Menü bezárása");
  mobileMenu?.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("open");
    document.body.classList.remove("menu-open");
  });
});

const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }),
  { threshold: 0.1, rootMargin: "0px 0px -35px" },
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

document.querySelectorAll(".gallery-item, .social-card").forEach((button) => {
  button.addEventListener("click", () => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = button.dataset.full || "";
    lightboxImage.alt = button.querySelector("img")?.alt || "Nagyított süteményfotó";
    lightbox.showModal();
  });
});

lightboxClose?.addEventListener("click", () => lightbox?.close());
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

document.querySelector("#currentYear").textContent = String(new Date().getFullYear());

const openStatus = document.querySelector("#openStatus");
if (openStatus) {
  const budapestTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Budapest",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const values = Object.fromEntries(budapestTime.map(({ type, value }) => [type, value]));
  const weekday = values.weekday;
  const minutes = Number(values.hour) * 60 + Number(values.minute);
  const isOpenDay = ["Tue", "Wed", "Thu", "Fri"].includes(weekday);
  const isOpenNow = isOpenDay && minutes >= 600 && minutes < 1020;
  openStatus.textContent = isOpenNow ? "Most nyitva · ma 17:00-ig" : "Nyitvatartás: kedd–péntek, 10:00–17:00";
}
