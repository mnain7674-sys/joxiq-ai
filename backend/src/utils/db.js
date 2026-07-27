const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function filePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}
function read(collection) {
  const p = filePath(collection);
  if (!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { return []; }
}
function write(collection, data) {
  fs.writeFileSync(filePath(collection), JSON.stringify(data, null, 2));
}
module.exports = { read, write };
