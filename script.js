/* ════════════════════════════════════════════════════════════════════
   WEDDING INVITATION · script.js (Kareem & Aya)
   with COUNTDOWN TIMER + COUPLE PHOTO + floating language button
   ════════════════════════════════════════════════════════════════════ */

"use strict";

/* ========================= CONFIGURATION ========================= */
const CONFIG = {
  // أسماء العروسين
  groomName: "Kareem",
  brideName: "Aya",
  groomNameAr: "كريم",
  brideNameAr: "آيه",

  // تاريخ ووقت ومكان الزفاف (تأكد من صحة التاريخ للسنة 2026)
  weddingDate: "June 26, 2026",
  weddingDateAr: "٢٦ يونيو ٢٠٢٦",
  weddingTime: "4:30 PM",
  weddingLocation: "Masjed Mogawra 49",
  weddingLocationAr: "مسجد مجاورة ٤٩",
  weddingMapLink:
    "https://www.google.com/maps/place/30%C2%B018'00.9%22N+31%C2%B043'14.2%22E/@30.3000977,31.7203434,19.5z/data=!4m4!3m3!8m2!3d30.3002548!4d31.7206116?hl=en&entry=ttu&g_ep=EgoyMDI2MDUwNi4wIKXMDSoASAFQAw%3D%3D",

  // مسارات الملفات
  crestImage:
    "assets/images/Gemini_Generated_Image_aai6peaai6peaai6-removebg-preview.webp",
  doorStaticBg: "assets/images/demo3.webp",
  doorGif: "assets/images/image1.mp4",
  detailsBg: "assets/images/image2.webp",
  musicUrl: "assets/music/music1.mp3",
  couplePhoto: "assets/images/couple.webp", // أضف صورتك هنا

  // أرقام واتساب
  groomWhatsappNumber: "201157257870",
  brideWhatsappNumber: "201026251445",

  assetsToPreload: [],
};

CONFIG.assetsToPreload = [
  CONFIG.crestImage,
  CONFIG.doorStaticBg,
  CONFIG.doorGif,
  CONFIG.detailsBg,
  CONFIG.musicUrl,
  CONFIG.couplePhoto,
].filter(Boolean);

/* ================================================================= */

let currentLang = "en";
let loadProgress = 0;
let doorPlayed = false;
let currentWhatsAppMessage = "";
let bgMusic = null;
let countdownInterval = null;

// DOM elements
const pageLoading = document.getElementById("page-loading");
const pageDoor = document.getElementById("page-door");
const pageDetails = document.getElementById("page-details");
const loadingBar = document.getElementById("loading-bar");
const doorGif = document.getElementById("door-gif");
const doorOverlay = document.getElementById("door-overlay");
const doorGlowRing = document.getElementById("door-glow-ring");
const knockBtn = document.getElementById("knock-btn");
const langBtnDoor = document.getElementById("lang-btn-door");
const langBtnDet = document.getElementById("lang-btn-details");
const rsvpForm = document.getElementById("rsvp-form");
const rsvpSuccess = document.getElementById("rsvp-success");
const particles = document.getElementById("particles");
const petalsWrap = document.getElementById("petals");

// تهيئة الصوت
function initAudio() {
  bgMusic = document.getElementById("bg-music");
  if (CONFIG.musicUrl && bgMusic) {
    bgMusic.src = CONFIG.musicUrl;
    bgMusic.load();
    bgMusic.loop = true;
    bgMusic.volume = 0;
  }
}

// تلاشي الصوت دخولاً
function fadeInMusic(el, vol = 0.65, ms = 1500) {
  if (!el) return;
  el.volume = 0;
  el.play().catch((e) => console.log("Audio play error:", e));
  const step = vol / (ms / 50);
  const id = setInterval(() => {
    if (el.volume + step < vol) el.volume += step;
    else {
      el.volume = vol;
      clearInterval(id);
    }
  }, 50);
}

// COUNTDOWN TIMER FUNCTION
function startCountdown() {
  const targetDate = new Date(CONFIG.weddingDate + " " + CONFIG.weddingTime);
  if (isNaN(targetDate.getTime())) {
    console.warn("Invalid wedding date for countdown");
    return;
  }
  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;
    if (distance < 0) {
      document.getElementById("countdown-days").innerText = "00";
      document.getElementById("countdown-hours").innerText = "00";
      document.getElementById("countdown-minutes").innerText = "00";
      document.getElementById("countdown-seconds").innerText = "00";
      if (countdownInterval) clearInterval(countdownInterval);
      return;
    }
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    document.getElementById("countdown-days").innerText = days
      .toString()
      .padStart(2, "0");
    document.getElementById("countdown-hours").innerText = hours
      .toString()
      .padStart(2, "0");
    document.getElementById("countdown-minutes").innerText = minutes
      .toString()
      .padStart(2, "0");
    document.getElementById("countdown-seconds").innerText = seconds
      .toString()
      .padStart(2, "0");
  }
  updateTimer();
  countdownInterval = setInterval(updateTimer, 1000);
}

// دالة تشغيل الباب
function playDoor() {
  if (doorPlayed) return;
  doorPlayed = true;

  doorGif.src = CONFIG.doorGif;
  doorGif.load();
  doorGif.currentTime = 0;
  doorGif.muted = true;
  doorGif.play().catch((e) => console.warn("Video play error:", e));

  if (bgMusic && CONFIG.musicUrl) {
    bgMusic.currentTime = 0;
    fadeInMusic(bgMusic, 0.65, 1500);
  }

  document.querySelector(".door-bg-wrap").classList.add("revealed");
  doorOverlay.style.opacity = "0";
  doorGlowRing.classList.add("active");

  knockBtn.style.opacity = "0";
  knockBtn.style.pointerEvents = "none";
  knockBtn.style.transform = "scale(0.8)";

  let transitionDone = false;
  const goToDetails = () => {
    if (transitionDone) return;
    transitionDone = true;
    transitionToPage(pageDoor, pageDetails, () => {
      spawnPetals();
      animateDetailCards();
      startCountdown(); // تشغيل التايمر عند وصول صفحة التفاصيل
    });
  };

  doorGif.addEventListener("ended", goToDetails, { once: true });
  setTimeout(goToDetails, 15000);
}

// حقن المحتوى الديناميكي من CONFIG
function injectContent() {
  document
    .querySelectorAll(".groom-name-en")
    .forEach((el) => (el.textContent = CONFIG.groomName));
  document
    .querySelectorAll(".bride-name-en")
    .forEach((el) => (el.textContent = CONFIG.brideName));
  document
    .querySelectorAll(".groom-name-ar")
    .forEach((el) => (el.textContent = CONFIG.groomNameAr));
  document
    .querySelectorAll(".bride-name-ar")
    .forEach((el) => (el.textContent = CONFIG.brideNameAr));

  document
    .querySelectorAll(".wedding-date-en")
    .forEach((el) => (el.textContent = CONFIG.weddingDate));
  document
    .querySelectorAll(".wedding-date-ar")
    .forEach((el) => (el.textContent = CONFIG.weddingDateAr));
  document
    .querySelectorAll(".wedding-time")
    .forEach((el) => (el.textContent = CONFIG.weddingTime));
  document
    .querySelectorAll(".wedding-location-en")
    .forEach((el) => (el.textContent = CONFIG.weddingLocation));
  document
    .querySelectorAll(".wedding-location-ar")
    .forEach((el) => (el.textContent = CONFIG.weddingLocationAr));
  const weddingMapBtn = document.querySelectorAll(".wedding-map-btn");
  weddingMapBtn.forEach((btn) => (btn.href = CONFIG.weddingMapLink));

  const year = CONFIG.weddingDate.match(/\d{4}/)?.[0] || "2026";
  document
    .querySelectorAll(".wedding-year")
    .forEach((el) => (el.textContent = year));
  document
    .querySelectorAll(".wedding-year-ar")
    .forEach((el) => (el.textContent = year));

  if (document.querySelector(".door-static-bg"))
    document.querySelector(".door-static-bg").style.backgroundImage =
      `url('${CONFIG.doorStaticBg}')`;
  if (document.querySelector(".details-bg"))
    document.querySelector(".details-bg").style.backgroundImage =
      `url('${CONFIG.detailsBg}')`;
  const crestImages = document.querySelectorAll(".crest-img, #hero-crest-img");
  crestImages.forEach((img) => (img.src = CONFIG.crestImage));

  // إضافة صورة الكابلز
  const couplePhotoImg = document.getElementById("couple-photo-img");
  if (couplePhotoImg && CONFIG.couplePhoto) {
    couplePhotoImg.src = CONFIG.couplePhoto;
    couplePhotoImg.alt = `${CONFIG.groomName} & ${CONFIG.brideName}`;
  }
}

// الجسيمات والبتلات
function spawnParticles() {
  for (let i = 0; i < 22; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 6 + 2;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;animation-duration:${Math.random() * 12 + 8}s;animation-delay:${Math.random() * 10}s;`;
    particles.appendChild(p);
  }
}

function spawnPetals() {
  if (!petalsWrap) return;
  petalsWrap.innerHTML = "";
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("div");
    p.className = "petal";
    const size = Math.random() * 8 + 4;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;animation-duration:${Math.random() * 18 + 12}s;animation-delay:${Math.random() * 14}s;`;
    petalsWrap.appendChild(p);
  }
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function setBar(target) {
  const from = loadProgress;
  const start = performance.now();
  const duration = 400;
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    loadProgress = from + (target - from) * easeInOut(t);
    loadingBar.style.width = loadProgress + "%";
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function preloadAllAssets() {
  const total = CONFIG.assetsToPreload.length;
  if (total === 0) return Promise.resolve();
  let loaded = 0;
  const BAR_START = 10,
    BAR_END = 90;
  function onAssetDone() {
    loaded++;
    const pct = BAR_START + (loaded / total) * (BAR_END - BAR_START);
    setBar(pct);
  }
  const promises = CONFIG.assetsToPreload.map((src) => {
    return new Promise((resolve) => {
      const isVideo = src.match(/\.(mp4|webm|mov)$/i);
      const isAudio = src.match(/\.(mp3|wav|ogg)$/i);
      if (isVideo) {
        const video = document.createElement("video");
        video.preload = "auto";
        video.src = src;
        video.load();
        const timeout = setTimeout(() => resolve(), 12000);
        video.addEventListener(
          "canplaythrough",
          () => {
            clearTimeout(timeout);
            onAssetDone();
            resolve();
          },
          { once: true },
        );
        video.addEventListener(
          "error",
          () => {
            clearTimeout(timeout);
            onAssetDone();
            resolve();
          },
          { once: true },
        );
      } else if (isAudio) {
        const audio = new Audio();
        audio.preload = "auto";
        audio.src = src;
        const timeout = setTimeout(() => resolve(), 12000);
        audio.addEventListener(
          "canplaythrough",
          () => {
            clearTimeout(timeout);
            onAssetDone();
            resolve();
          },
          { once: true },
        );
        audio.addEventListener(
          "error",
          () => {
            clearTimeout(timeout);
            onAssetDone();
            resolve();
          },
          { once: true },
        );
        audio.load();
      } else {
        const img = new Image();
        const timeout = setTimeout(() => resolve(), 12000);
        img.onload = img.onerror = () => {
          clearTimeout(timeout);
          onAssetDone();
          resolve();
        };
        img.src = src;
      }
    });
  });
  return Promise.all(promises);
}

async function runLoadingScreen() {
  setBar(10);
  spawnParticles();
  await Promise.all([
    preloadAllAssets(),
    new Promise((r) => setTimeout(r, 2000)),
  ]);
  setBar(100);
  await new Promise((r) => setTimeout(r, 600));
  transitionToPage(pageLoading, pageDoor);
}

function transitionToPage(fromPage, toPage, cb) {
  fromPage.classList.add("fade-out");
  setTimeout(() => {
    fromPage.classList.remove("active", "fade-out");
    toPage.classList.add("active");
    if (cb) cb();
  }, 900);
}

function animateDetailCards() {
  pageDetails.querySelectorAll(".detail-card").forEach((c, i) => {
    c.style.animation = "cardEntrance 0.8s ease both";
    c.style.animationDelay = i * 0.15 + "s";
  });
}

function toggleLanguage() {
  currentLang = currentLang === "en" ? "ar" : "en";
  const html = document.documentElement;
  html.setAttribute("lang", currentLang);
  html.setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");
  const nameEl = document.getElementById("rsvp-name");
  const msgEl = document.getElementById("rsvp-msg");
  if (nameEl)
    nameEl.placeholder = currentLang === "ar" ? "اسمك..." : "Your name...";
  if (msgEl)
    msgEl.placeholder =
      currentLang === "ar" ? "أمنياتك الطيبة..." : "Your warm wishes...";
}

function handleRSVP(event) {
  event.preventDefault();
  event.stopPropagation();

  const name = document.getElementById("rsvp-name").value.trim();
  const attendInput = document.querySelector('input[name="attend"]:checked');
  const message = document.getElementById("rsvp-msg").value.trim();

  if (!name) {
    alert(
      currentLang === "ar"
        ? "الرجاء إدخال اسمك الكامل."
        : "Please enter your full name.",
    );
    return false;
  }
  if (!attendInput) {
    alert(
      currentLang === "ar"
        ? "الرجاء اختيار حالة الحضور."
        : "Please confirm attendance.",
    );
    return false;
  }

  const attendText =
    attendInput.value === "yes"
      ? currentLang === "ar"
        ? "نعم، سأحضر 🥂"
        : "Yes, I will attend 🥂"
      : currentLang === "ar"
        ? "آسف، لن أتمكن من الحضور"
        : "Regretfully unable to attend";

  let fullMessage = `Guest: ${name}\nAttendance: ${attendText}`;
  if (message) fullMessage += `\nMessage: ${message}`;
  currentWhatsAppMessage = fullMessage;

  rsvpForm.classList.add("hidden");
  rsvpSuccess.classList.remove("hidden");
  bindWhatsAppButtons();

  return false;
}

function bindWhatsAppButtons() {
  const groomBtn = document.getElementById("send-to-groom");
  const brideBtn = document.getElementById("send-to-bride");
  const copyBtn = document.getElementById("copy-message");

  if (groomBtn) {
    const newGroom = groomBtn.cloneNode(true);
    groomBtn.parentNode.replaceChild(newGroom, groomBtn);
    newGroom.onclick = (e) => {
      e.preventDefault();
      if (!CONFIG.groomWhatsappNumber) {
        alert(
          currentLang === "ar"
            ? "لم يتم تعيين رقم العريس"
            : "Groom number not set",
        );
        return;
      }
      const url = `https://wa.me/${CONFIG.groomWhatsappNumber}?text=${encodeURIComponent(currentWhatsAppMessage)}`;
      window.open(url, "_blank");
    };
  }

  if (brideBtn) {
    const newBride = brideBtn.cloneNode(true);
    brideBtn.parentNode.replaceChild(newBride, brideBtn);
    newBride.onclick = (e) => {
      e.preventDefault();
      if (!CONFIG.brideWhatsappNumber) {
        alert(
          currentLang === "ar"
            ? "لم يتم تعيين رقم العروسة"
            : "Bride number not set",
        );
        return;
      }
      const url = `https://wa.me/${CONFIG.brideWhatsappNumber}?text=${encodeURIComponent(currentWhatsAppMessage)}`;
      window.open(url, "_blank");
    };
  }

  if (copyBtn) {
    const newCopy = copyBtn.cloneNode(true);
    copyBtn.parentNode.replaceChild(newCopy, copyBtn);
    newCopy.onclick = (e) => {
      e.preventDefault();
      navigator.clipboard
        .writeText(currentWhatsAppMessage)
        .then(() => {
          alert(currentLang === "ar" ? "تم نسخ الرسالة!" : "Message copied!");
        })
        .catch(() => {
          alert(
            currentLang === "ar"
              ? "فشل النسخ، يمكنك نسخها يدوياً."
              : "Copy failed, please copy manually.",
          );
        });
    };
  }
}

function enableAudioOnUserInteraction() {
  let activated = false;
  const enable = () => {
    if (activated) return;
    activated = true;
    if (bgMusic && bgMusic.paused && CONFIG.musicUrl) {
      bgMusic
        .play()
        .then(() => {
          bgMusic.pause();
          bgMusic.currentTime = 0;
        })
        .catch(() => {});
    }
    document.removeEventListener("click", enable);
    document.removeEventListener("touchstart", enable);
  };
  document.addEventListener("click", enable);
  document.addEventListener("touchstart", enable);
}

knockBtn.addEventListener("click", playDoor);
langBtnDoor.addEventListener("click", toggleLanguage);
langBtnDet.addEventListener("click", toggleLanguage);
if (rsvpForm) {
  rsvpForm.addEventListener("submit", handleRSVP);
  rsvpForm.addEventListener("submit", (e) => e.preventDefault());
}
enableAudioOnUserInteraction();

document.addEventListener("DOMContentLoaded", async () => {
  initAudio();
  injectContent();
  bindWhatsAppButtons();
  pageLoading.classList.add("active");
  doorGif.removeAttribute("src");
  await runLoadingScreen();
});
