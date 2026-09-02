/* ==========================================================================
   מרכז נתונים שניתן לעריכה קלה (Wedding Configuration)
   כל פרטי האירוע מרוכזים כאן לנוחות מקסימלית!
   ========================================================================== */
const weddingData = {
  // שמות החתן והכלה
  brideName: "Bar",
  groomName: "Ethan",
  namesEnglish: "BAR & ETHAN", 

  // תאריכים
  // שנה, חודש (0-11, כלומר 8 זה ספטמבר), יום, שעה, דקות
  weddingDateTarget: new Date(2026, 9, 10, 19, 0, 0),
  hebrewDateText: "יום שני | ט' בחשוון תשפ״ו",
  gregorianDateText: "19.10.2026",

  // שעות האירועים (The Wedding Day)
  receptionTime: "19:30",
  ceremonyTime: "20:30",
  dancingTime: "22:00",

  // פרטי האולם ו-Waze
  venueName: "אולמי טאו",
  venueAddress: "ירוק 64, צומת כנות",
  // קישור Waze (אפשר להחליף בכתובת המדויקת או בקואורדינטות)
  wazeLink: "https://www.waze.com/kn/live-map/directions/%D7%98%D7%90%D7%95-%D7%90%D7%99%D7%A8%D7%95%D7%A2%D7%99%D7%9D-%D7%99%D7%A8%D7%95%D7%A7-2-%D7%9B%D7%A0%D7%95%D7%AA?to=place.w.22806846.227806316.7024",

  // טקסט תודה בסיום
  thankYouText: "תודה שאתם חלק בלתי נפרד מחיינו ושבאתם לשמוח איתנו ביום המאושר שלנו!"
};

/* ==========================================================================
   אתחול הנתונים בדף (DOM Injection)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // הזרקת שמות
  const namesEl = document.getElementById("couple-names-display");
  if (namesEl) namesEl.textContent = weddingData.namesEnglish;

  // הזרקת תאריכים
  const hebrewDateEl = document.getElementById("hebrew-date-display");
  if (hebrewDateEl) hebrewDateEl.textContent = weddingData.hebrewDateText;

  const gregDateEl = document.getElementById("gregorian-date-display");
  if (gregDateEl) gregDateEl.textContent = weddingData.gregorianDateText;

  // הזרקת שעות
  const timeRecEl = document.getElementById("time-reception");
  if (timeRecEl) timeRecEl.textContent = weddingData.receptionTime;

  const timeCerEl = document.getElementById("time-ceremony");
  if (timeCerEl) timeCerEl.textContent = weddingData.ceremonyTime;

  const timeDanEl = document.getElementById("time-dancing");
  if (timeDanEl) timeDanEl.textContent = weddingData.dancingTime;

  // הזרקת אולם ו-Waze
  const venueNameEl = document.getElementById("venue-name-display");
  if (venueNameEl) venueNameEl.textContent = weddingData.venueName;

  const venueAddressEl = document.getElementById("venue-address-display");
  if (venueAddressEl) venueAddressEl.textContent = weddingData.venueAddress;

  const wazeBtn = document.getElementById("waze-btn");
  if (wazeBtn) wazeBtn.href = weddingData.wazeLink;

  // הזרקת תודה
  const thankYouEl = document.getElementById("thankyou-text-display");
  if (thankYouEl) thankYouEl.textContent = weddingData.thankYouText;

  // הפעלת כל המודולים
  initEnvelopeAndAudio();
  initDateSlider();
  initCountdown();
  initScrollAnimations();
});

/* ==========================================================================
   שלב 0: אנימציית מעטפה + ניגון אוטומטי ללא שגיאות דפדפן
   ========================================================================== */
function initEnvelopeAndAudio() {

  const overlay = document.getElementById("envelope-overlay");
  const audio = document.getElementById("wedding-audio");
  const musicToggleBtn = document.getElementById("music-toggle-btn");
  const musicIcon = document.getElementById("music-icon");

  let isPlaying = false;

  const updateMusicIcon = () => {
    if (audio.paused) {
      musicIcon.textContent = "🔇";
      musicToggleBtn.classList.remove("playing");
    } else {
      musicIcon.textContent = "🔊";
      musicToggleBtn.classList.add("playing");
    }
  };

  // ניגון המוזיקה החל משנייה 41
  const playMusic = () => {

    const startAudio = () => {

      // מוודאים שהשיר מתחיל בדיוק משנייה 41
      audio.currentTime = 41;

      audio.play()
        .then(() => {
          isPlaying = true;
          updateMusicIcon();
        })
        .catch(err => {
          console.log("Audio autoplay was restricted:", err);
          updateMusicIcon();
        });
    };

    // אם ה-metadata כבר נטען
    if (audio.readyState >= 1) {
      startAudio();
    } 
    
    // אם עדיין לא נטען – מחכים
    else {
      audio.addEventListener("loadedmetadata", startAudio, { once: true });
    }
  };

  // לחיצה על המעטפה: פתיחה אלגנטית והתחלת המוזיקה
  if (overlay) {

    overlay.addEventListener("click", () => {

      overlay.classList.add("opening");

      playMusic();

      setTimeout(() => {
        overlay.classList.add("opened");
      }, 700);

    }, { once: true });
  }

  // כפתור השתק / נגן שצף בפינה התחתונה
  if (musicToggleBtn) {

    musicToggleBtn.addEventListener("click", (e) => {

      e.stopPropagation();

      if (audio.paused) {

        audio.play()
          .then(updateMusicIcon)
          .catch(console.error);

      } else {

        audio.pause();
        updateMusicIcon();

      }
    });
  }
}


/* ==========================================================================
   מסך 1: Slider לחשיפת התאריך (Pointer Events תואם Touch + Mouse)
   ========================================================================== */
function initDateSlider() {
  const track = document.getElementById("slider-track");
  const handle = document.getElementById("slider-handle");
  const wrapper = document.getElementById("slider-wrapper");
  const dateBox = document.getElementById("revealed-date-box");
  const sliderText = document.getElementById("slider-text");

  if (!track || !handle) return;

  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let maxDragDistance = 0;
  let isRevealed = false;

  const updateMaxDistance = () => {
    // מרחק גרירה ימינה שמאלה (ברצועת RTL הגרירה היא שמאלה לכיוון ציר ה-X השלילי)
    maxDragDistance = track.clientWidth - handle.clientWidth - 8;
  };

  updateMaxDistance();
  window.addEventListener("resize", updateMaxDistance);

  const onPointerDown = (e) => {
    if (isRevealed) return;
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX);
    handle.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging || isRevealed) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const deltaX = startX - clientX; // גרירה שמאלה מגדילה את deltaX

    if (deltaX > 0) {
      currentTranslate = Math.min(deltaX, maxDragDistance);
      // הזזת הידית שמאלה (RTL)
      handle.style.transform = `translateX(-${currentTranslate}px)`;
      
      const progress = currentTranslate / maxDragDistance;
      sliderText.style.opacity = (1 - progress * 1.5).toString();

      // אם הגענו לסוף (מעל 88% ממרחק המסלול)
      if (currentTranslate >= maxDragDistance * 0.88) {
        triggerReveal();
      }
    }
  };

  const onPointerUp = () => {
    if (!isDragging || isRevealed) return;
    isDragging = false;
    // החזרה אחורה אם לא הושלמה ההחלקה
    handle.style.transition = "transform 0.3s ease";
    handle.style.transform = "translateX(0px)";
    sliderText.style.opacity = "1";
    setTimeout(() => {
      handle.style.transition = "";
    }, 300);
  };

  const triggerReveal = () => {
    isRevealed = true;
    isDragging = false;
    
    // מעבר אלגנטי: העלמת הסליידר וחשיפת התאריך
    wrapper.style.opacity = "0";
    setTimeout(() => {
      wrapper.classList.add("hidden");
      dateBox.classList.add("active");
      launchConfetti(); // הפעלת קונפטי
    }, 300);
  };

  // שימוש ב-Pointer Events מבטיח תמיכה נקייה בכל סוגי המכשירים (iOS / Android / Desktop)
  handle.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
}

/* ==========================================================================
   אנימציית קונפטי עדינה משני צידי המסך
   ========================================================================== */
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const colors = ["#A7C7E7", "#4682B4", "#D8E6F3", "#B0C4DE", "#E6C280"];
  const particles = [];
  const count = 70; // כמות מעודנת ואלגנטית

  // יצירת חלקיקים שיוצאים משמאל ומימין
  for (let i = 0; i < count; i++) {
    const fromLeft = i % 2 === 0;
    particles.push({
      x: fromLeft ? 0 : width,
      y: height * 0.45 + (Math.random() * 80 - 40),
      vx: (fromLeft ? 1 : -1) * (Math.random() * 7 + 4),
      vy: -(Math.random() * 8 + 3),
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  let animationFrame;
  let startTime = Date.now();

  function render() {
    ctx.clearRect(0, 0, width, height);
    const elapsed = Date.now() - startTime;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // כוח כבידה עדין
      p.rotation += p.vRotation;
      if (elapsed > 1800) {
        p.opacity -= 0.02;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      ctx.restore();
    });

    if (elapsed < 3200) {
      animationFrame = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, width, height);
      cancelAnimationFrame(animationFrame);
    }
  }

  render();
}

/* ==========================================================================
   מסך 2: ספירה לאחור (Countdown)
   ========================================================================== */
function initCountdown() {
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  function update() {
    const now = new Date().getTime();
    const distance = weddingData.weddingDateTarget.getTime() - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = "00";
      if (hoursEl) hoursEl.textContent = "00";
      if (minutesEl) minutesEl.textContent = "00";
      if (secondsEl) secondsEl.textContent = "00";
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(d).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(h).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(m).padStart(2, "0");
    if (secondsEl) secondsEl.textContent = String(s).padStart(2, "0");
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   הופעה הדרגתית של סקציות בזמן גלילה (Intersection Observer)
   ========================================================================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll(".fade-in-on-scroll");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));
}