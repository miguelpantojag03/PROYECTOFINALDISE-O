const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "src", "main", "resources", "static");
const dist = path.join(root, "dist");
const apiBaseUrl = process.env.MOTOFIX_API_BASE_URL || "";

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.cpSync(source, dist, { recursive: true });
fs.writeFileSync(
  path.join(dist, "config.js"),
  `window.MOTOFIX_API_BASE_URL = ${JSON.stringify(apiBaseUrl)};\n`,
  "utf8"
);

console.log(`MotoFix frontend ready in dist. API base: ${apiBaseUrl || "relative/local"}`);
