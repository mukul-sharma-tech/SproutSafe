const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const SALT_ROUNDS = 10;
const PASSWORD_FILE = "cipher-agent-secure.json";

function getStorePath(app) {
  const userData = app ? app.getPath("userData") : require("electron").app.getPath("userData");
  const dataDir = path.join(userData, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, PASSWORD_FILE);
}

function readStore(app) {
  try {
    const data = fs.readFileSync(getStorePath(app), "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function writeStore(app, data) {
  fs.writeFileSync(getStorePath(app), JSON.stringify(data), "utf8");
}

function hasPassword(app) {
  const data = readStore(app);
  const hash = data.parentPasswordHash;
  return !!hash && typeof hash === "string";
}

async function setPassword(app, plainPassword) {
  if (!plainPassword || plainPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  const data = readStore(app);
  data.parentPasswordHash = hash;
  writeStore(app, data);
  return true;
}

async function verifyPassword(app, plainPassword) {
  const data = readStore(app);
  const hash = data.parentPasswordHash;
  if (!hash) return false;
  return bcrypt.compare(plainPassword, hash);
}

module.exports = {
  hasPassword,
  setPassword,
  verifyPassword,
};
