
const SALT = "ILITS_IKAMADIRI_2026_SECRET";

function hashNRP(nrp) {
  const str = `${SALT}:${nrp}`;
  let h1 = 0x811c9dc5, h2 = 0x1b873593, h3 = 0x85ebca6b, h4 = 0xc2b2ae35;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193);
    h2 = Math.imul(h2 ^ (ch + i), 0x85ebca6b);
    h3 = Math.imul(h3 ^ (ch * 31), 0xc2b2ae35);
    h4 = Math.imul(h4 ^ (ch ^ 0x5a), 0x27d4eb2f);
  }
  return [h1, h2, h3, h4]
    .map((h) => (h >>> 0).toString(16).padStart(8, "0"))
    .join("");
}
  const hash = sha256.h.slice(0);
  const k = sha256.k;

  ascii += "\x80";
  while ((ascii.length % 64) - 56) ascii += "\x00";
  for (let i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash.unshift((temp1 + temp2) | 0);
      hash.pop();
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? 0 : "") + b.toString(16);
    }
  }
  return result;
}

function hashNRP(nrp) {
  return sha256(`${SALT}:${nrp}`);
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
  if (typeof EVENT_CONFIG === "undefined") return;
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

  if (typeof ENCRYPTED_LOLOS === "undefined" || typeof ENCRYPTED_TIDAK_LOLOS === "undefined") {
    showError("File data-lolos.js atau data-tidak-lolos.js belum terbaca. Cek kembali nama file atau isi kodenya.");
    return;
  }

  setLoading(true);
  await new Promise((r) => setTimeout(r, 400));

  try {
    const hashed = hashNRP(rawNrp);

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
    showError("Terjadi kesalahan: " + err.message);
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