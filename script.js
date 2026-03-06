const WHATSAPP_NUMBER = "919922227588";
const QUICK_QUOTE_TEXT = "Hi DG Production, I want a custom quote for my event.";
const CONTACT_PHONE = "+919922227588";
const SECURITY_MESSAGE = "Access blocked. Krupaya developer la contact kara.";
const GALLERY_SECURITY_MESSAGE = "Photo download blocked. Krupaya developer la contact kara: ksatyavan81@gmail.com";

const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".site-nav");
if (menuBtn && nav) menuBtn.addEventListener("click", () => nav.classList.toggle("open"));

function showSecurityNotice(message) {
  const existing = document.querySelector(".security-notice");
  if (existing) existing.remove();

  const box = document.createElement("div");
  box.className = "security-notice";
  box.textContent = message;
  document.body.appendChild(box);

  setTimeout(() => {
    box.classList.add("show");
  }, 20);

  setTimeout(() => {
    box.classList.remove("show");
    setTimeout(() => box.remove(), 220);
  }, 2600);
}

function initGlobalProtection() {
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showSecurityNotice(SECURITY_MESSAGE);
  });

  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    const blocked =
      e.key === "F12" ||
      key === "printscreen" ||
      (e.ctrlKey && e.shiftKey && (key === "i" || key === "j" || key === "c")) ||
      (e.ctrlKey && key === "u") ||
      (e.ctrlKey && key === "s");

    if (blocked) {
      e.preventDefault();
      e.stopPropagation();
      showSecurityNotice(SECURITY_MESSAGE);
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "PrintScreen") {
      navigator.clipboard?.writeText("").catch(() => null);
      showSecurityNotice(SECURITY_MESSAGE);
    }
  });

  setInterval(() => {
    const widthGap = window.outerWidth - window.innerWidth;
    const heightGap = window.outerHeight - window.innerHeight;
    const devtoolsLikelyOpen = widthGap > 160 || heightGap > 160;
    if (devtoolsLikelyOpen) {
      showSecurityNotice(SECURITY_MESSAGE);
    }
  }, 1800);
}

function initPageLoader() {
  if (document.querySelector(".page-loader")) return;
  document.body.classList.add("page-loading");

  const loader = document.createElement("div");
  loader.className = "page-loader";
  loader.innerHTML = `
    <div class="loader-center">
      <div class="loader-ring"></div>
      <p>DG Production loading...</p>
    </div>
  `;
  document.body.appendChild(loader);

  const hideLoader = () => {
    loader.classList.add("hide");
    document.body.classList.remove("page-loading");
    setTimeout(() => loader.remove(), 350);
  };

  window.addEventListener("load", hideLoader, { once: true });
  setTimeout(hideLoader, 1400);
}

document.querySelectorAll(".reveal").forEach((el) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("show");
      });
    },
    { threshold: 0.15 }
  );
  observer.observe(el);
});

document.querySelectorAll("[data-count]").forEach((item) => {
  const end = Number(item.dataset.count || 0);
  let n = 0;
  const step = Math.max(1, Math.floor(end / 70));
  const timer = setInterval(() => {
    n += step;
    if (n >= end) {
      n = end;
      clearInterval(timer);
    }
    item.textContent = String(n);
  }, 20);
});

function makeWhatsAppUrl(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function initFloatingWhatsApp() {
  if (document.querySelector(".floating-whatsapp")) return;

  const waBtn = document.createElement("a");
  waBtn.className = "floating-whatsapp";
  waBtn.href = makeWhatsAppUrl(QUICK_QUOTE_TEXT);
  waBtn.target = "_blank";
  waBtn.rel = "noopener";
  waBtn.setAttribute("aria-label", "Chat on WhatsApp");
  waBtn.textContent = "WhatsApp";

  document.body.appendChild(waBtn);
}

function initQuickLeadForm() {
  const form = document.getElementById("quickLeadForm");
  const status = document.getElementById("quickLeadStatus");
  if (!form) return;

  if (form.dataset.bound === "1") return;
  form.dataset.bound = "1";

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (form.dataset.submitting === "1") return;
    form.dataset.submitting = "1";

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const formData = new FormData(form);
    const name = (formData.get("name") || "").toString().trim();
    const eventDate = (formData.get("eventDate") || "").toString().trim();
    const city = (formData.get("city") || "").toString().trim();
    const budget = (formData.get("budget") || "").toString().trim();
    const services = formData
      .getAll("services")
      .map((item) => item.toString().trim())
      .filter(Boolean);

    if (!name || !eventDate || !city || !budget || !services.length) {
      if (status) status.textContent = "Please fill all fields and select at least one service.";
      form.dataset.submitting = "0";
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const parsedDate = new Date(`${eventDate}T00:00:00`);
    const formattedDate = Number.isNaN(parsedDate.getTime())
      ? eventDate
      : parsedDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });

    const message = [
      "Hi DG Production, I want package details.",
      `Name: ${name}`,
      `Event Date: ${formattedDate}`,
      `City: ${city}`,
      `Budget: ${budget}`,
      `Services: ${services.join(", ")}`
    ].join("\n");

    window.open(makeWhatsAppUrl(message), "_blank", "noopener");
    if (status) status.textContent = "Opening WhatsApp...";
    form.reset();

    setTimeout(() => {
      form.dataset.submitting = "0";
      if (submitBtn) submitBtn.disabled = false;
    }, 700);
  });
}

function initQuickQuoteLinks() {
  document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
    if (!link.href.includes("text=")) {
      link.href = makeWhatsAppUrl(QUICK_QUOTE_TEXT);
    }
  });
}

function initTestimonialSlider() {
  const slider = document.getElementById("testimonialSlider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".testimonial-slide"));
  if (!slides.length) return;
  let idx = 0;

  function show(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
  }

  document.getElementById("testimonialPrev")?.addEventListener("click", () => {
    idx = (idx - 1 + slides.length) % slides.length;
    show(idx);
  });

  document.getElementById("testimonialNext")?.addEventListener("click", () => {
    idx = (idx + 1) % slides.length;
    show(idx);
  });

  setInterval(() => {
    idx = (idx + 1) % slides.length;
    show(idx);
  }, 4500);
}

function getAdminCreds() {
  try {
    return JSON.parse(sessionStorage.getItem("dg-admin-creds") || "{}");
  } catch {
    return {};
  }
}

function setAdminCreds(username, password) {
  sessionStorage.setItem("dg-admin-creds", JSON.stringify({ username, password }));
}

function clearAdminCreds() {
  sessionStorage.removeItem("dg-admin-creds");
}

async function apiRequest(path, options = {}, useAuth = false) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (useAuth) {
    const creds = getAdminCreds();
    headers["x-admin-user"] = creds.username || "";
    headers["x-admin-pass"] = creds.password || "";
  }

  const res = await fetch(path, { ...options, headers });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.error) || "Request failed";
    throw new Error(message);
  }

  return data;
}

function toWebpUrl(url) {
  if (!url) return "";
  if (url.includes("fm=webp")) return url;
  return url.includes("?") ? `${url}&fm=webp` : `${url}?fm=webp`;
}

let galleryCache = [];
const DEFAULT_GALLERY_ITEMS = [
  {
    id: "fallback-1",
    title: "Haldi",
    category: "wedding",
    url: "Haldi.jpg"
  },
  {
    id: "fallback-2",
    title: "Haldi Celebration",
    category: "wedding",
    url: "Haldi2.jpg"
  },
  {
    id: "fallback-3",
    title: "Bridal Portrait",
    category: "wedding",
    url: "wert.jpg"
  },
  {
    id: "fallback-4",
    title: "Studio Portrait",
    category: "studio",
    url: "wee.jpg"
  },
  {
    id: "fallback-5",
    title: "Baby Session",
    category: "studio",
    url: "photo2.jpg"
  },
  {
    id: "fallback-6",
    title: "Fashion Portfolio",
    category: "studio",
    url: "sunset.jpg"
  },

];

async function fetchGalleryItems(filter = "all") {
  const q = filter && filter !== "all" ? `?category=${encodeURIComponent(filter)}` : "";
  return apiRequest(`/api/gallery${q}`, { method: "GET" });
}

async function updateGalleryCounts() {
  if (!document.querySelector("[data-count-for]")) return;
  if (!galleryCache.length) {
    try {
      galleryCache = await fetchGalleryItems("all");
      if (!galleryCache.length) galleryCache = [...DEFAULT_GALLERY_ITEMS];
    } catch {
      galleryCache = [...DEFAULT_GALLERY_ITEMS];
    }
  }

  const counts = { all: galleryCache.length, wedding: 0, studio: 0, maternity: 0 };
  galleryCache.forEach((item) => {
    if (counts[item.category] !== undefined) counts[item.category] += 1;
  });

  document.querySelectorAll("[data-count-for]").forEach((chip) => {
    const type = chip.dataset.countFor;
    chip.textContent = counts[type] ?? 0;
  });
}

async function renderGallery(filter = "all") {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  try {
    if (!galleryCache.length) galleryCache = await fetchGalleryItems("all");
    if (!galleryCache.length) galleryCache = [...DEFAULT_GALLERY_ITEMS];
  } catch {
    galleryCache = [...DEFAULT_GALLERY_ITEMS];
  }

  const items = filter === "all" ? galleryCache : galleryCache.filter((item) => item.category === filter);
  grid.innerHTML = items
    .map(
      (item) => `
      <article class="tile" data-url="${item.url}">
        <img src="${toWebpUrl(item.url)}" alt="${item.title}" loading="lazy" decoding="async" fetchpriority="low" draggable="false" />
        <p>${item.title} | ${item.category}</p>
      </article>
    `
    )
    .join("");

  grid.querySelectorAll(".tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const box = document.getElementById("lightbox");
      const img = document.getElementById("lightboxImage");
      if (!box || !img) return;
      img.src = tile.dataset.url;
      box.classList.add("open");
    });
  });
}

function initGalleryProtection() {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  const isProtectedImageTarget = (target) => {
    if (!(target instanceof Element)) return false;
    return target.matches("#lightboxImage") || Boolean(target.closest("#galleryGrid img"));
  };

  const blockAttempt = (e) => {
    e.preventDefault();
    e.stopPropagation();
    showSecurityNotice(GALLERY_SECURITY_MESSAGE);
  };

  document.addEventListener(
    "contextmenu",
    (e) => {
      if (isProtectedImageTarget(e.target)) blockAttempt(e);
    },
    true
  );

  document.addEventListener(
    "dragstart",
    (e) => {
      if (isProtectedImageTarget(e.target)) blockAttempt(e);
    },
    true
  );

  document.addEventListener(
    "keydown",
    (e) => {
      const key = e.key.toLowerCase();
      const riskySave = (e.ctrlKey || e.metaKey) && (key === "s" || key === "u");
      if (riskySave && document.getElementById("lightbox")?.classList.contains("open")) {
        blockAttempt(e);
      }
    },
    true
  );
}
const filters = document.querySelectorAll(".filter[data-filter]");
if (filters.length) {
  renderGallery("all").then(updateGalleryCounts).catch(() => null);
  filters.forEach((btn) =>
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderGallery(btn.dataset.filter || "all");
    })
  );
}

const lightbox = document.getElementById("lightbox");
const closeLightbox = document.getElementById("lightboxClose");
if (lightbox && closeLightbox) {
  closeLightbox.addEventListener("click", () => lightbox.classList.remove("open"));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.classList.remove("open");
  });
}

const inquiryForm = document.getElementById("inquiryForm");
const contactStatus = document.getElementById("contactStatus");
if (inquiryForm) {
  inquiryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(inquiryForm);
    const payload = {
      name: (formData.get("name") || "").toString().trim(),
      email: (formData.get("email") || "").toString().trim(),
      phone: (formData.get("phone") || "").toString().trim(),
      message: (formData.get("message") || "").toString().trim()
    };

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
    const phoneOk = /^[0-9+\-\s()]{10,15}$/.test(payload.phone);
    if (!emailOk || !phoneOk) {
      if (contactStatus) contactStatus.textContent = "Please enter a valid email and phone number.";
      return;
    }

    try {
      await apiRequest("/api/inquiries", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      inquiryForm.reset();
      if (contactStatus) contactStatus.textContent = "Thank you. We will contact you soon.";
    } catch (error) {
      if (contactStatus) contactStatus.textContent = error.message;
    }
  });
}

const adminLoginForm = document.getElementById("adminLoginForm");
const adminForm = document.getElementById("adminForm");
const adminPanel = document.getElementById("adminPanel");
const adminStatus = document.getElementById("adminStatus");
const inquiryList = document.getElementById("inquiryList");
const adminLogout = document.getElementById("adminLogout");

function updateAdminVisibility() {
  const creds = getAdminCreds();
  const loggedIn = Boolean(creds.username && creds.password);
  if (adminPanel) adminPanel.style.display = loggedIn ? "block" : "none";
  if (adminForm) adminForm.style.display = loggedIn ? "grid" : "none";
  if (adminLoginForm) adminLoginForm.style.display = loggedIn ? "none" : "grid";
}

async function renderAdminList() {
  const list = document.getElementById("adminList");
  if (!list) return;

  try {
    const items = await fetchGalleryItems("all");
    list.innerHTML = items
      .map(
        (item) => `
      <article class="card">
        <h3>${item.title}</h3>
        <p>${item.category}</p>
        <button class="filter" data-delete="${item.id}">Delete</button>
      </article>
    `
      )
      .join("");

    list.querySelectorAll("[data-delete]").forEach((btn) =>
      btn.addEventListener("click", async () => {
        try {
          await apiRequest(`/api/gallery/${btn.dataset.delete}`, { method: "DELETE" }, true);
          galleryCache = [];
          renderAdminList();
        } catch (error) {
          if (adminStatus) adminStatus.textContent = error.message;
        }
      })
    );
  } catch (error) {
    list.innerHTML = `<p class="muted">${error.message}</p>`;
  }
}

async function renderInquiries() {
  if (!inquiryList) return;

  try {
    const rows = await apiRequest("/api/inquiries", { method: "GET" }, true);
    if (!rows.length) {
      inquiryList.innerHTML = `<p class="muted">No inquiries yet.</p>`;
      return;
    }

    inquiryList.innerHTML = rows
      .map(
        (item) => `
      <article class="card">
        <h3>${item.name}</h3>
        <p>${item.email} | ${item.phone}</p>
        <p>${item.message}</p>
        <button class="filter" data-delete-inquiry="${item.id}">Delete</button>
      </article>
    `
      )
      .join("");

    inquiryList.querySelectorAll("[data-delete-inquiry]").forEach((btn) =>
      btn.addEventListener("click", async () => {
        try {
          await apiRequest(`/api/inquiries/${btn.dataset.deleteInquiry}`, { method: "DELETE" }, true);
          renderInquiries();
        } catch (error) {
          if (adminStatus) adminStatus.textContent = error.message;
        }
      })
    );
  } catch (error) {
    inquiryList.innerHTML = `<p class="muted">${error.message}</p>`;
  }
}

if (adminLoginForm) {
  updateAdminVisibility();
  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("adminUser").value.trim();
    const password = document.getElementById("adminPass").value.trim();

    try {
      await apiRequest("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      setAdminCreds(username, password);
      if (adminStatus) adminStatus.textContent = "Login successful.";
      updateAdminVisibility();
      renderAdminList();
      renderInquiries();
    } catch (error) {
      if (adminStatus) adminStatus.textContent = error.message;
      clearAdminCreds();
      updateAdminVisibility();
    }
  });
}

if (adminLogout) {
  adminLogout.addEventListener("click", () => {
    clearAdminCreds();
    if (adminStatus) adminStatus.textContent = "Logged out.";
    updateAdminVisibility();
  });
}

if (adminForm) {
  updateAdminVisibility();
  const creds = getAdminCreds();
  if (creds.username && creds.password) {
    renderAdminList();
    renderInquiries();
  }

  adminForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const imageUrl = document.getElementById("imageUrl").value.trim();
    const category = document.getElementById("category").value;
    if (!title || !imageUrl || !category) return;

    try {
      await apiRequest(
        "/api/gallery",
        {
          method: "POST",
          body: JSON.stringify({ title, category, url: imageUrl })
        },
        true
      );
      adminForm.reset();
      galleryCache = [];
      if (adminStatus) adminStatus.textContent = "Gallery item added.";
      renderAdminList();
    } catch (error) {
      if (adminStatus) adminStatus.textContent = error.message;
    }
  });
}

initTestimonialSlider();
initQuickLeadForm();
initQuickQuoteLinks();
initFloatingWhatsApp();
initPageLoader();
initGalleryProtection();
initGlobalProtection();





