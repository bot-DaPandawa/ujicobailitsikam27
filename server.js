"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { salt, passed, rejected, testRecords = {} } = require("./private/selection-data");

const port = Number(process.env.PORT) || 3000;
const publicFiles = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/style.css", "style.css"],
  ["/app.js", "app.js"],
  ["/config.js", "config.js"]
]);
const contentTypes = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(data));
}

function decrypt(encoded, nrp) {
  const key = Buffer.from(`${salt}:${nrp}`, "utf8");
  const encrypted = Buffer.from(encoded, "base64");
  const decoded = Buffer.alloc(encrypted.length);
  for (let index = 0; index < encrypted.length; index += 1) decoded[index] = encrypted[index] ^ key[index % key.length];
  return JSON.parse(decoded.toString("utf8"));
}

function handleResult(request, response) {
  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
    if (body.length > 1024) request.destroy();
  });
  request.on("end", () => {
    try {
      const { nrp } = JSON.parse(body);
      if (typeof nrp !== "string" || !/^\d{1,14}$/.test(nrp)) return sendJson(response, 400, { message: "NRP harus berupa angka, maksimal 14 digit." });
      const testRecord = testRecords[nrp];
      if (testRecord) {
        return sendJson(response, 200, {
          status: testRecord.status,
          name: testRecord.nama,
          ...(testRecord.status === "passed" ? { keyword: testRecord.kataKunci } : {})
        });
      }
      const hash = crypto.createHash("sha256").update(`${salt}:${nrp}`).digest("hex");
      const encrypted = passed[hash] || rejected[hash];
      if (!encrypted) return sendJson(response, 200, { status: "not-found" });
      const participant = decrypt(encrypted, nrp);
      return sendJson(response, 200, {
        status: passed[hash] ? "passed" : "rejected",
        name: participant.nama,
        ...(passed[hash] ? { keyword: participant.kataKunci } : {})
      });
    } catch {
      return sendJson(response, 400, { message: "Permintaan tidak dapat diproses." });
    }
  });
}

http.createServer((request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  if (request.method === "POST" && request.url === "/api/results") return handleResult(request, response);
  if (request.method !== "GET" || !publicFiles.has(request.url)) return sendJson(response, 404, { message: "Tidak ditemukan." });
  const filename = publicFiles.get(request.url);
  const filePath = path.join(__dirname, filename);
  response.writeHead(200, { "Content-Type": contentTypes[path.extname(filename)] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(response);
}).listen(port, () => console.log(`Portal berjalan di http://localhost:${port}`));
