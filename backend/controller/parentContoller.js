import Parent from '../models/parent.js';
import Child from '../models/child.js';
import Log from '../models/log.js';
import { logActivity } from '../utillity/activityService.js';
import { generateToken } from '../utillity/jwt.js';

/** Verify that the child belongs to the parent. Returns { parent, child } or sends 403/404 and returns null. */
const ensureChildBelongsToParent = async (req, res, childId) => {
  const parent = await Parent.findOne({ email: req.user.email });
  if (!parent) {
    res.status(404).json({ message: "Parent not found" });
    return null;
  }
  const child = await Child.findById(childId);
  if (!child) {
    res.status(404).json({ message: "Child not found" });
    return null;
  }
  const belongsToParent = parent.children.some(id => id.toString() === child._id.toString());
  if (!belongsToParent) {
    res.status(403).json({ message: "Access denied: child does not belong to this parent" });
    return null;
  }
  return { parent, child };
};

/** For blockUrl/unblockUrl: verify child by email belongs to parent. */
const ensureChildByEmailBelongsToParent = async (req, res, childEmail) => {
  const parent = await Parent.findOne({ email: req.user.email });
  if (!parent) {
    res.status(404).json({ message: "Parent not found" });
    return null;
  }
  const child = await Child.findOne({ email: childEmail });
  if (!child) {
    res.status(404).json({ message: "Child not found" });
    return null;
  }
  const belongsToParent = parent.children.some(id => id.toString() === child._id.toString());
  if (!belongsToParent) {
    res.status(403).json({ message: "Access denied: child does not belong to this parent" });
    return null;
  }
  return { parent, child };
};

// Get all children of a parent
// controller
export const getAllChildren = async (req, res) => {
  try {
    const parent = await Parent.findOne({ email: req.user.email })
      .populate({
        path: 'children',
        model: 'Child',
        select: 'name email status extensionToken blockedUrls monitoredUrls incognitoAlerts lastHeartbeat location'
      });

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Attach a fresh JWT token for each child so the parent dashboard can show the correct extension token.
    const childrenWithTokens = parent.children.map((child) => {
      const obj = child.toObject ? child.toObject() : child;
      return {
        ...obj,
        token: generateToken(child.email),
      };
    });

    res.json(childrenWithTokens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get details of a specific child
export const getChildDetails = async (req, res) => {
  try {
    const result = await ensureChildBelongsToParent(req, res, req.params.id);
    if (!result) return;
    res.json(result.child);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get monitored URLs for a specific child
export const getChildUrls = async (req, res) => {
  try {
    const result = await ensureChildBelongsToParent(req, res, req.params.id);
    if (!result) return;
    res.json(result.child.monitoredUrls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get incognito alerts for a specific child
export const getChildAlerts = async (req, res) => {
  try {
    const result = await ensureChildBelongsToParent(req, res, req.params.id);
    if (!result) return;
    res.json(result.child.incognitoAlerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Block a URL for a specific child
export const blockUrl = async (req, res) => {
  const { url, email } = req.body;
  if (!email || !url) {
    return res.status(400).json({ message: "URL and child email are required" });
  }
  try {
    const result = await ensureChildByEmailBelongsToParent(req, res, email);
    if (!result) return;
    const { child } = result;

    // Check if URL is already blocked
    if (!child.blockedUrls.includes(url)) {
      child.blockedUrls.push(url);
      await child.save();

      const msg = `🔒 Site blocked: ${url} is now blocked for ${child.name}`;
      await logActivity({
        child: child._id,
        parentEmail: req.user.email,
        type: "URL_BLOCKED",
        domain: url,
        message: msg,
      });
    }

    res.status(200).json({ message: "URL blocked successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unblock a URL for a specific child
export const unblockUrl = async (req, res) => {
  const { url, email } = req.body;
  if (!email || !url) {
    return res.status(400).json({ message: "URL and child email are required" });
  }
  try {
    const result = await ensureChildByEmailBelongsToParent(req, res, email);
    if (!result) return;
    const { child } = result;

    // Remove the blocked URL from the list
    child.blockedUrls = child.blockedUrls.filter(blockedUrl => blockedUrl !== url);
    await child.save();

    const msg = `🔓 Site unblocked: ${url} is now accessible for ${child.name}`;
    await logActivity({
      child: child._id,
      parentEmail: req.user.email,
      type: "URL_UNBLOCKED",
      domain: url,
      message: msg,
    });

    res.status(200).json({ message: "URL unblocked successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset time spent on monitored URLs for a specific child
export const resetTimeSpent = async (req, res) => {
  try {
    const result = await ensureChildBelongsToParent(req, res, req.params.id);
    if (!result) return;
    const { child } = result;

    // Reset dailyTimeSpent (Map) for each monitored URL
    child.monitoredUrls.forEach((urlObj) => {
      urlObj.dailyTimeSpent = new Map();
    });

    await child.save();
    res.status(200).json({ message: "Time spent reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get notifications for all children of a parent
export const getNotifications = async (req, res) => {
  try {
    const parentDoc = await Parent.findOne({ email: req.user.email });
    if (!parentDoc) return res.status(404).json({ message: "Parent not found" });

    // Fetch logs for all children
    const logs = await Log.find({ child: { $in: parentDoc.children } })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('child', 'name');

    // Format logs for the frontend (send ISO timestamp so frontend can show in user's timezone)
    const notifications = logs.map(log => ({
      id: log._id,
      text: `[${log.child?.name || 'Unknown'}] ${log.message}`,
      timestamp: (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp)).toISOString(),
      read: false,
      type: log.type
    }));

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate a new JWT token for a specific child (for use in the browser extension)
export const generateChildToken = async (req, res) => {
  try {
    const result = await ensureChildBelongsToParent(req, res, req.params.id);
    if (!result) return;
    const token = generateToken(result.child.email);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
