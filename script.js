// Helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* Mobile nav */
const navToggle = $("#navToggle");
const nav = $("#nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // Close on link click
  $$("#nav a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    const within = nav.contains(e.target) || navToggle.contains(e.target);
    if (!within) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* Year */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Animated counters (once) */
function animateCount(el, target, duration = 1100) {
  const start = 0;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.floor(start + (target - start) * progress);
    el.textContent = value.toLocaleString("el-GR");
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const counters = $$("#counters .stat__num");
let countersDone = false;

if (counters.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((e) => e.isIntersecting);
      if (visible && !countersDone) {
        countersDone = true;
        counters.forEach((el) => {
          const target = Number(el.dataset.count || "0");
          animateCount(el, target);
        });
        observer.disconnect();
      }
    },
    { threshold: 0.35 },
  );

  observer.observe($("#counters"));
}

/* Projects filter */
const filterBtns = $$(".filter");
const projects = $$(".project");

function applyFilter(key) {
  projects.forEach((p) => {
    const cat = p.dataset.category;
    const show = key === "all" || cat === key;
    p.style.display = show ? "" : "none";
  });
}

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    applyFilter(btn.dataset.filter);
  });
});

/* Project modal */
const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalSubtitle = $("#modalSubtitle");
const modalText = $("#modalText");
const modalMedia = $("#modalMedia");

function openModalFromProject(projectEl) {
  if (!modal) return;

  modalTitle.textContent = projectEl.dataset.title || "Έργο";
  modalSubtitle.textContent = projectEl.dataset.subtitle || "";
  modalText.textContent = projectEl.dataset.text || "";

  // Use the same thumbnail as modal image
  const thumb = $(".project__thumb", projectEl);
  if (thumb && modalMedia) {
    const bg = getComputedStyle(thumb).backgroundImage;
    modalMedia.style.backgroundImage = bg.includes("url") ? bg : "";
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

projects.forEach((p) =>
  p.addEventListener("click", () => openModalFromProject(p)),
);
$$("[data-close]", modal).forEach((el) =>
  el.addEventListener("click", closeModal),
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
});

/* Contact form validation + mailto */
const form = $("#contactForm");
const note = $("#formNote");
const mailtoBtn = $("#mailtoBtn");

function setNote(msg, ok = false) {
  if (!note) return;
  note.textContent = msg;
  note.style.color = ok ? "rgba(255,211,107,.95)" : "rgba(233,238,246,.85)";
}

function buildMailto(data) {
  const to = "kbkyriakou@hotmail.gr";
  const subject = `Νέο αίτημα από ${data.name || "Ιστοσελίδα"}`;
  const body = `Ονοματεπώνυμο: ${data.name || "-"}
Email: ${data.email || "-"}
Τηλέφωνο: ${data.phone || "-"}
Τύπος έργου: ${data.type || "-"} 

Μήνυμα:
${data.message || "-"}
`;
  const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return url;
}

function getFormData() {
  const fd = new FormData(form);
  return {
    name: (fd.get("name") || "").toString().trim(),
    email: (fd.get("email") || "").toString().trim(),
    phone: (fd.get("phone") || "").toString().trim(),
    type: (fd.get("type") || "").toString().trim(),
    message: (fd.get("message") || "").toString().trim(),
  };
}

if (mailtoBtn) {
  mailtoBtn.addEventListener("click", () => {
    if (!form) return;
    const data = getFormData();
    window.location.href = buildMailto(data);
  });
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // HTML5 validation
    if (!form.checkValidity()) {
      form.reportValidity();
      setNote("Παρακαλώ συμπληρώστε σωστά τα υποχρεωτικά πεδία.");
      return;
    }

    const data = getFormData();
    setNote("Ευχαριστούμε! Θα ανοίξει το email σας για αποστολή.", true);

    // No backend: fallback to mailto
    window.location.href = buildMailto(data);

    // Optional: reset
    setTimeout(() => form.reset(), 400);
  });
}
