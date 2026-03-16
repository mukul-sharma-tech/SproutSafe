import Child from "../models/child.js";
import { v4 as uuidv4 } from "uuid";
import Parent from '../models/parent.js';
import { generateToken } from "../utillity/jwt.js";

/** Verify that the child belongs to the parent making the request. Returns { parent, child } or sends 403/404 and returns null. */
const ensureChildBelongsToParent = async (req, res, childEmail) => {
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
  const childId = child._id.toString();
  const belongsToParent = parent.children.some(id => id.toString() === childId);
  if (!belongsToParent) {
    res.status(403).json({ message: "Access denied: child does not belong to this parent" });
    return null;
  }
  return { parent, child };
};

// Create a new child for the parent
export const createChild = async (req, res) => {
  const { name, email } = req.body;
  try {
    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Create a new child instance
    const newChild = new Child({
      name,
      email,
      parent: parent._id, // link the child to the parent
      extensionToken: uuidv4()
    });

    // Save the new child to the database
    await newChild.save();

    // Add this new child to the parent's children list
    parent.children.push(newChild._id);
    await parent.save();
    const token = generateToken(newChild.email)

    res.status(201).json({
      message: "Child created successfully",
      token: token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all children for logged-in parent
export const getChildren = async (req, res) => {
  try {
    const parent = await Parent.findOne({ email: req.user.email });
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    const children = await Child.find({ _id: { $in: parent.children } });
    res.status(200).json(children);
  } catch (err) {
    res.status(500).json({ message: "Error fetching children", error: err.message });
  }
};

export const getWebUsageStats = async (req, res) => {
  try {
    const { email } = req.params;
    const result = await ensureChildBelongsToParent(req, res, email);
    if (!result) return;
    const { child } = result;

    const today = new Date().toISOString().split("T")[0];
    let totalSeconds = 0;

    child.monitoredUrls.forEach((url) => {
      const time = url.dailyTimeSpent.get(today) || 0;
      totalSeconds += time;
    });

    const hours = Math.floor(totalSeconds / (60 * 60));
    const minutes = Math.floor(totalSeconds / (60)) % 60;
    const totalTime = `${hours}h ${minutes}m`;

    res.json({ totalTime });
  } catch (err) {
    console.error("Web usage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getAlerts = async (req, res) => {
  try {
    const { email } = req.params;
    const result = await ensureChildBelongsToParent(req, res, email);
    if (!result) return;
    const { child } = result;

    res.json({ alerts: child.incognitoAlerts });
  } catch (err) {
    console.error("Alerts fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getBlockedStats = async (req, res) => {
  try {
    const { email } = req.params;
    const result = await ensureChildBelongsToParent(req, res, email);
    if (!result) return;
    const { child } = result;

    res.json({ count: child.blockedUrls.length });
  } catch (err) {
    console.error("Blocked content fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getWebUsageStatsFull = async (req, res) => {
  try {
    const { email } = req.params;
    const result = await ensureChildBelongsToParent(req, res, email);
    if (!result) return;
    const { child } = result;

    const today = new Date().toISOString().split("T")[0];
    const webUsage = [];
    let totalSeconds = 0;

    child.monitoredUrls.forEach((urlObj) => {
      const time = urlObj.dailyTimeSpent.get(today) || 0;
      totalSeconds += time;

      webUsage.push({
        domain: urlObj.domain,
        minutes: time,
        category: urlObj.category,
        lastUpdated: urlObj.lastUpdated,
        dailyTimeSpent: Object.fromEntries(urlObj.dailyTimeSpent || new Map()),
        searchQueries: urlObj.searchQueries || [],
      });
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    res.json({
      totalTime: `${hours}h ${minutes}m`,
      usageDetails: webUsage
    });
  } catch (err) {
    console.error("Web usage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// Get detailed incognito alerts
export const getAlertsFull = async (req, res) => {
  try {
    const { email } = req.params;
    const result = await ensureChildBelongsToParent(req, res, email);
    if (!result) return;
    const { child } = result;

    const alerts = child.incognitoAlerts
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(alert => ({
        message: `Incognito detected: ${alert.url}`,
        url: alert.url,
        timestamp: alert.timestamp
      }));

    res.json({ alerts });
  } catch (err) {
    console.error("Alerts fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const clearAlerts = async (req, res) => {
  try {
    const { email } = req.params;
    const result = await ensureChildBelongsToParent(req, res, email);
    if (!result) return;
    const { child } = result;

    child.incognitoAlerts = []; // clear alerts
    await child.save();

    res.json({ message: "Alerts cleared" });
  } catch (err) {
    console.error("Clear alerts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get detailed blocked URLs
export const getBlockedStatsFull = async (req, res) => {
  try {
    const { email } = req.params;
    const result = await ensureChildBelongsToParent(req, res, email);
    if (!result) return;
    const { child } = result;

    const blocked = child.blockedUrls.map(url => ({
      domain: url,
    }));

    res.json({ totalBlocked: blocked.length, blockedList: blocked });
  } catch (err) {
    console.error("Blocked content fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getSearchActivities = async (req, res) => {
  try {
    const { timeFrame, childEmail } = req.body;
    if (!childEmail) return res.status(400).json({ message: "Child email is required" });

    const result = await ensureChildBelongsToParent(req, res, childEmail);
    if (!result) return;
    const { child } = result;

    const dateLimit = (() => {
      const now = new Date();
      switch (timeFrame) {
        case "today": now.setHours(0, 0, 0, 0); return now;
        case "yesterday": now.setDate(now.getDate() - 1); now.setHours(0, 0, 0, 0); return now;
        case "week": now.setDate(now.getDate() - 7); return now;
        case "month": now.setDate(now.getDate() - 30); return now;
        default: return new Date(0);
      }
    })();
    const searches = [];
    (child.monitoredUrls || []).forEach(urlObj => {
      if (new Date(urlObj.lastUpdated) >= dateLimit) {
        if (urlObj.searchQueries && urlObj.searchQueries.length > 0) {
          urlObj.searchQueries.forEach(query => {
            searches.push({
              type: "search",
              content: query,
              timestamp: urlObj.lastUpdated,
            });
          });
        } else {
          searches.push({
            type: "website",
            content: urlObj.domain,
            timestamp: urlObj.lastUpdated,
          });
        }
      }
    });

    searches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ activities: searches });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
