const SALT = "ILITS_IKAMADIRI_2026_SECRET";

async function hashNRP(nrp) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${SALT}:${nrp}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function decryptData(encodedBase64, nrp) {
  const key = `${SALT}:${nrp}`;
  const binary = atob(encodedBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i) ^ key.charCodeAt(i % key.length);
  }
  const decodedStr = new TextDecoder().decode(bytes);
  return JSON.parse(decodedStr);
}

const viewSearch = document.getElementById("view-search");
const viewPassed = document.getElementById("view-passed");
const viewRejected = document.getElementById("view-rejected");
const searchForm = document.getElementById("search-form");
const nrpInput = document.getElementById("nrp-input");
const errorMsg = document.getElementById("error-msg");
const submitBtn = document.getElementById("submit-btn");
const btnText = submitBtn.querySelector(".btn-text");
const spinner = submitBtn.querySelector(".spinner");

function initConfig() {
  const waBtn = document.getElementById("wa-group-link");
  waBtn.href = EVENT_CONFIG.whatsappGroupUrl;

  const cpList = document.getElementById("cp-list");
  cpList.innerHTML = EVENT_CONFIG.contactPersons
    .map((cp) => {
      const waNumber = cp.phone.replace(/^0/, "62");
      return `<a href="https://wa.me/${waNumber}" target="_blank" rel="noopener noreferrer">${cp.phone} (${cp.name})</a>`;
    })
    .join("");
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.hidden = false;
}

function clearError() {
  errorMsg.hidden = true;
  errorMsg.textContent = "";
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  btnText.textContent = isLoading ? "Memeriksa..." : "Lihat Hasil Seleksi";
  spinner.hidden = !isLoading;
}

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const rawNrp = nrpInput.value.trim();
  if (!rawNrp) {
    showError("Silakan masukkan NRP terlebih dahulu.");
    nrpInput.focus();
    return;
  }

  if (!/^\d+$/.test(rawNrp)) {
    showError("NRP harus berupa angka.");
    nrpInput.focus();
    return;
  }

  setLoading(true);
  await new Promise((r) => setTimeout(r, 450));

  try {
    const hashed = await hashNRP(rawNrp);

    // Cek di daftar LOLOS dulu, jika tidak ada cek di daftar TIDAK LOLOS
    if (ENCRYPTED_LOLOS[hashed]) {
      const participant = decryptData(ENCRYPTED_LOLOS[hashed], rawNrp);
      viewSearch.hidden = true;
      document.getElementById("passed-nrp").textContent = rawNrp;
      document.getElementById("passed-name").textContent = participant.nama;
      document.getElementById("passed-keyword").textContent = participant.kataKunci;
      viewPassed.hidden = false;
      launchConfetti();
    } else if (ENCRYPTED_TIDAK_LOLOS[hashed]) {
      const participant = decryptData(ENCRYPTED_TIDAK_LOLOS[hashed], rawNrp);
      viewSearch.hidden = true;
      document.getElementById("rejected-nrp").textContent = rawNrp;
      document.getElementById("rejected-name").textContent = participant.nama;
      viewRejected.hidden = false;
    } else {
      showError("NRP tidak ditemukan. Periksa kembali angka yang kamu masukkan.");
    }
  } catch (err) {
    showError("Terjadi kesalahan saat memproses data.");
  } finally {
    setLoading(false);
  }
});

document.getElementById("copy-keyword-btn").addEventListener("click", async () => {
  const keyword = document.getElementById("passed-keyword").textContent;
  const copyLabel = document.getElementById("copy-label");
  await navigator.clipboard.writeText(keyword);
  copyLabel.textContent = "Tersalin!";
  setTimeout(() => {
    copyLabel.textContent = "Salin";
  }, 2000);
});

document.querySelectorAll("[data-reset]").forEach((btn) => {
  btn.addEventListener("click", () => {
    viewPassed.hidden = true;
    viewRejected.hidden = true;
    viewSearch.hidden = false;
    nrpInput.value = "";
    clearError();
    nrpInput.focus();
  });
});

function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#0284c7", "#38bdf8", "#10b981", "#f59e0b", "#6366f1"];
  const pieces = Array.from({ length: 85 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: Math.random() * 8 + 5,
    h: Math.random() * 5 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: Math.random() * 3 + 2,
    speedX: Math.random() * 2 - 1,
    angle: Math.random() * 360
  }));

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.angle += 4;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < 160) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

initConfig();