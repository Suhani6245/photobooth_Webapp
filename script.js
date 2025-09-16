// =================================================================
// SECTION 1: GLOBAL SETUP
// =================================================================
console.log("🔥 script.js loaded");

// Save username locally + redirect
function saveName() {
  console.log("saveName() called!");
  const userName = document.getElementById("username").value;
  if (userName) {
    localStorage.setItem("username", userName);
    window.location.href = "manual.html";
  } else {
    alert("Please enter your name.");
  }
}

// Example: track Start button click (Google Analytics hook if added)
const startBtnTrack = document.getElementById("startBtn");
if (startBtnTrack) {
  startBtnTrack.addEventListener("click", () => {
    if (typeof gtag !== "undefined") {
      gtag("event", "start_photobooth", {
        event_category: "Photobooth",
        event_label: "User clicked start"
      });
    }
  });
}

// =================================================================
// SECTION 2: PAGE LOGIC
// =================================================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🌍 DOM ready");

  // ===== Landing Page Animation =====
  const container = document.querySelector(".container");
  if (container) {
    setTimeout(() => container.classList.add("show"), 300);
  }

  // ===== Frame Selection Page =====
  if (document.body.classList.contains("frame")) {
    console.log("✅ Frame page detected");

    const frames = document.querySelectorAll(".frame-option");
    console.log("📸 Found frame options:", frames.length);

    frames.forEach(option => {
      option.addEventListener("click", () => {
        const photos = option.getAttribute("data-photos");
        const frameId = option.getAttribute("data-frame"); // e.g. frame1
        const frameSrc = option.querySelector("img").getAttribute("src"); // actual image

        localStorage.setItem("photoCount", photos);
        localStorage.setItem("selectedFrame", frameSrc);
        localStorage.setItem("selectedFrameId", frameId);

        console.log("➡️ Frame selected:", frameId, frameSrc, "photos:", photos);

        window.location.href = "camera.html";
      });
    });
  }

  /// ===== Camera Page =====
  if (document.body.classList.contains("camera")) {
    console.log("📷 Camera page detected");

    // ✅ Clear old photos at the start of a new camera session
    localStorage.removeItem("capturedPhotos");

    const popup = document.getElementById("startPopup");
    const startBtn = document.getElementById("startBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const cameraBox = document.getElementById("cameraBox");
    const video = document.getElementById("camera-stream");
    const canvas = document.getElementById("photo-canvas");
    const context = canvas.getContext("2d");
    const countdownEl = document.getElementById("countdown");
    const photoContainer = document.querySelector(".photos");
    const successPopup = document.getElementById("successPopup");
    const previewBtn = document.getElementById("previewBtn");

    const totalPhotos = parseInt(localStorage.getItem("photoCount")) || 4;
    let photosTaken = 0;
    let countdownIntervalId = null;

    console.log("startBtn:", startBtn, "cancelBtn:", cancelBtn); // debug

    if (startBtn && cancelBtn) {
      startBtn.addEventListener("click", () => {
        console.log("▶️ Start clicked");
        popup.classList.add("hidden");
        cameraBox.classList.remove("hidden");
        startCamera();
      });

      cancelBtn.addEventListener("click", () => {
        console.log("❌ Cancel clicked");
        window.location.href = "frame.html";
      });
    }

    function startCamera() {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          video.srcObject = stream;
          video.play();
          console.log("✅ Camera started");
          startCountdown();
        })
        .catch(err => {
          alert("Camera access denied!");
          console.error(err);
        });
    }

    function startCountdown() {
      let counter = 3;
      countdownEl.textContent = counter;

      if (countdownIntervalId) clearInterval(countdownIntervalId);

      countdownIntervalId = setInterval(() => {
        countdownEl.textContent = counter;
        counter--;

        if (counter < 0) {
          clearInterval(countdownIntervalId);
          countdownEl.textContent = "";
          takePhoto();
        }
      }, 1000);
    }

    function takePhoto() {
      if (photosTaken === 0) localStorage.removeItem("capturedPhotos");

      const targetWidth = 400;
      const scale = targetWidth / video.videoWidth;
      const targetHeight = video.videoHeight * scale;

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      context.drawImage(video, 0, 0, targetWidth, targetHeight);

      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/jpeg", 0.7);
      img.classList.add("thumb");
      photoContainer.appendChild(img);

      let savedPhotos = JSON.parse(localStorage.getItem("capturedPhotos")) || [];
      if (savedPhotos.length < totalPhotos) {
        savedPhotos.push(img.src);
        localStorage.setItem("capturedPhotos", JSON.stringify(savedPhotos));
      }

      photosTaken++;
      console.log(`📸 Photo ${photosTaken}/${totalPhotos} taken`);

      if (photosTaken < totalPhotos) {
        setTimeout(startCountdown, 1000);
      } else {
        const stream = video.srcObject;
        if (stream) stream.getTracks().forEach(track => track.stop());

        setTimeout(() => {
          successPopup.classList.remove("hidden");
        }, 500);
      }
    }

    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        window.location.href = "preview.html";
      });
    }
  } // <-- Camera block closed properly

  // ===== Preview Page =====
  if (document.body.classList.contains("preview")) {
    console.log("🖼️ Preview page detected");

    const previewPhotos = document.getElementById("previewPhotos");
    const retakeBtn = document.getElementById("retakeBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    const savedPhotos = JSON.parse(localStorage.getItem("capturedPhotos")) || [];
    const selectedFrame = localStorage.getItem("selectedFrame");
    const selectedFrameId = localStorage.getItem("selectedFrameId");

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    previewPhotos.appendChild(canvas);

    const frameSlots = {
      frame1: [
        { x: 70, y: 131, w: 459, h: 452 },
        { x: 70, y: 640, w: 459, h: 452 },
        { x: 70, y: 1145, w: 459, h: 452 }
      ],
      frame2: [
        { x: 56, y: 56, w: 484, h: 533 },
        { x: 56, y: 635, w: 484, h: 533 },
        { x: 56, y: 1209, w: 484, h: 533 }
      ],
      frame3: [
        { x: 61, y: 81, w: 477, h: 390 },
        { x: 61, y: 575, w: 477, h: 390 },
        { x: 61, y: 1067, w: 477, h: 390 }
      ],
      frame4: [
        { x: 58, y: 136, w: 482, h: 410 },
        { x: 58, y: 696, w: 482, h: 410 },
        { x: 58, y: 1247, w: 482, h: 410 }
      ],
      frame5: [
        { x: 35, y: 36, w: 531, h: 329 },
        { x: 35, y: 410, w: 531, h: 329 },
        { x: 35, y: 778, w: 531, h: 329 },
        { x: 35, y: 1150, w: 531, h: 329 }
      ],
      frame6: [
        { x: 28, y: 44, w: 231, h: 162 },
        { x: 28, y: 250, w: 231, h: 162 },
        { x: 28, y: 454, w: 231, h: 162 },
        { x: 28, y: 660, w: 231, h: 162 }
      ],
      frame7: [
        { x: 59, y: 59, w: 482, h: 336 },
        { x: 59, y: 450, w: 482, h: 336 },
        { x: 59, y: 843, w: 482, h: 336 },
        { x: 59, y: 1233, w: 482, h: 336 }
      ],
      frame8: [
        { x: 35, y: 37, w: 531, h: 397 },
        { x: 35, y: 476, w: 531, h: 397 },
        { x: 35, y: 920, w: 531, h: 397 },
        { x: 35, y: 1359, w: 531, h: 397 }
      ]
    };

    const slots = frameSlots[selectedFrameId] || [];

    const frameImg = new Image();
    frameImg.src = selectedFrame;
    frameImg.onload = () => {
      canvas.width = frameImg.width;
      canvas.height = frameImg.height;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let loadedCount = 0;
      const photosToDraw = Math.min(savedPhotos.length, slots.length);

      savedPhotos.forEach((src, i) => {
        if (!slots[i]) return;
        const { x, y, w, h } = slots[i];
        const img = new Image();
        img.src = src;
        img.onload = () => {
          const scale = Math.max(w / img.width, h / img.height);
          const sw = w / scale;
          const sh = h / scale;
          const sx = (img.width - sw) / 2;
          const sy = (img.height - sh) / 2;
          ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);

          loadedCount++;
          if (loadedCount === photosToDraw) {
            ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
          }
        };
      });
    };

    retakeBtn.addEventListener("click", () => {
      localStorage.removeItem("capturedPhotos");
      window.location.href = "frame.html";
    });

    downloadBtn.addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "photostrip.png";
      a.click();
    });
  } // <-- Preview block closed properly
}); // <-- DOMContentLoaded closed properly

// =================================================================
