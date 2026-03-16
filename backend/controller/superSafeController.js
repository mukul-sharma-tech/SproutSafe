import path from "path";
import fs from "fs";
import SuperSafeSettings from "../models/superSafeSettings.js";
import AllowedSite from "../models/allowedSite.js";
import Parent from "../models/parent.js";
import Child from "../models/child.js";
const ensureSettings = async (parentId) => {
  let settings = await SuperSafeSettings.findOne({ parent: parentId });
  if (!settings) {
    settings = await SuperSafeSettings.create({ parent: parentId });
  }
  return settings;
};

export const getSettings = async (req, res) => {
  try {
    let parent = await Parent.findOne({ email: req.user.email });

    if (!parent) {
      const child = await Child.findOne({ email: req.user.email });
      if (child) {
        parent = await Parent.findOne({ children: child._id });
      }
    }

    if (!parent) return res.status(404).json({ message: "Parent not found" });
    const settings = await ensureSettings(parent._id);
    res.json({
      enabled: settings.enabled,
      blockExtensionsPage: settings.blockExtensionsPage,
      customBlockedWords: settings.customBlockedWords || [],
      voiceMessageUrl: settings.voiceMessageUrl,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleSuperSafe = async (req, res) => {
  try {
    const { enabled } = req.body;
    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    const settings = await ensureSettings(parent._id);
    settings.enabled = !!enabled;
    await settings.save();

    res.json({ enabled: settings.enabled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleBlockExtensionsPage = async (req, res) => {
  try {
    const { enabled } = req.body;
    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    const settings = await ensureSettings(parent._id);
    settings.blockExtensionsPage = !!enabled;
    await settings.save();

    res.json({ blockExtensionsPage: settings.blockExtensionsPage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllowedSites = async (req, res) => {
  try {
    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    const sites = await AllowedSite.find({ parent: parent._id }).sort({ createdAt: -1 });
    res.json(sites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addAllowedSite = async (req, res) => {
  try {
    const { domain } = req.body;
    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    const normalized = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    const site = await AllowedSite.create({ parent: parent._id, domain: normalized });

    res.status(201).json(site);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAllowedSite = async (req, res) => {
  try {
    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    const site = await AllowedSite.findOne({ _id: req.params.id, parent: parent._id });
    if (!site) return res.status(404).json({ message: "Allowed site not found" });

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addCustomBlockedWord = async (req, res) => {
  try {
    const { word } = req.body;
    if (!word || !word.trim()) return res.status(400).json({ message: "Word is required" });
    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    const settings = await ensureSettings(parent._id);
    const normalized = word.trim().toLowerCase();
    if (settings.customBlockedWords.includes(normalized)) {
      return res.status(409).json({ message: "Word already exists" });
    }
    settings.customBlockedWords.push(normalized);
    await settings.save();

    res.json({ customBlockedWords: settings.customBlockedWords });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeCustomBlockedWord = async (req, res) => {
  try {
    const { word } = req.body;
    if (!word) return res.status(400).json({ message: "Word is required" });
    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    const settings = await ensureSettings(parent._id);
    const normalized = word.trim().toLowerCase();
    settings.customBlockedWords = settings.customBlockedWords.filter((w) => w !== normalized);
    await settings.save();

    res.json({ customBlockedWords: settings.customBlockedWords });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// voice message upload: store locally under /uploads/supersafe
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "supersafe");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const uploadVoiceMessage = async (req, res) => {
  try {
    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    const settings = await ensureSettings(parent._id);

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const fileName = `${parent._id}-${Date.now()}.webm`;
    const dest = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(dest, req.file.buffer);

    settings.voiceMessageUrl = `/uploads/supersafe/${fileName}`;
    await settings.save();

    res.json({ voiceMessageUrl: settings.voiceMessageUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVoiceMessage = async (req, res) => {
  try {
    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    const settings = await ensureSettings(parent._id);
    res.json({ voiceMessageUrl: settings.voiceMessageUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

