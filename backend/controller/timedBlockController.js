import TimedBlock from "../models/timedBlock.js";
import Parent from "../models/parent.js";
import Child from "../models/child.js";
async function findParent(email) {
  let parent = await Parent.findOne({ email });
  if (!parent) {
    const child = await Child.findOne({ email });
    if (child) parent = await Parent.findOne({ children: child._id });
  }
  return parent;
}

export const getTimedBlocks = async (req, res) => {
  try {
    const parent = await findParent(req.user.email);
    if (!parent) return res.status(404).json({ message: "Parent not found" });

    const blocks = await TimedBlock.find({ parent: parent._id, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addTimedBlock = async (req, res) => {
  try {
    const { domain, minutes } = req.body;
    if (!domain || !minutes || minutes < 1) {
      return res.status(400).json({ message: "Domain and minutes (>=1) are required" });
    }

    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) return res.status(404).json({ message: "Parent not found" });

    const normalized = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

    const block = await TimedBlock.findOneAndUpdate(
      { parent: parent._id, domain: normalized },
      { expiresAt, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(block);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeTimedBlock = async (req, res) => {
  try {
    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) return res.status(404).json({ message: "Parent not found" });

    const block = await TimedBlock.findOneAndDelete({ _id: req.params.id, parent: parent._id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const checkTimedBlock = async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.json({ blocked: false });

    const parent = await findParent(req.user.email);
    if (!parent) return res.json({ blocked: false });

    const normalized = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();

    const block = await TimedBlock.findOne({
      parent: parent._id,
      expiresAt: { $gt: new Date() },
      $or: [
        { domain: normalized },
        { domain: { $regex: new RegExp(`(^|\\.)${normalized.replace(/\./g, "\\.")}$`) } },
      ],
    });

    if (block) {
      return res.json({ blocked: true, domain: block.domain, expiresAt: block.expiresAt });
    }

    const parts = normalized.split(".");
    if (parts.length > 2) {
      const rootDomain = parts.slice(-2).join(".");
      const rootBlock = await TimedBlock.findOne({
        parent: parent._id,
        domain: rootDomain,
        expiresAt: { $gt: new Date() },
      });
      if (rootBlock) {
        return res.json({ blocked: true, domain: rootBlock.domain, expiresAt: rootBlock.expiresAt });
      }
    }

    res.json({ blocked: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const penalizeTimedBlock = async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.json({ ok: false });

    const parent = await findParent(req.user.email);
    if (!parent) return res.json({ ok: false });

    const normalized = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();
    const block = await TimedBlock.findOne({ parent: parent._id, domain: normalized, expiresAt: { $gt: new Date() } });

    if (block) {
      block.expiresAt = new Date(0);
      await block.save();
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
