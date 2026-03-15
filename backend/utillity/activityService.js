import Log from "../models/log.js";
import Parent from "../models/parent.js";

/**
 * Centralized activity logger.
 * Persists events to MongoDB Log collection — the dashboard reads from here.
 */
export const logActivity = async ({ child, parentEmail, type, domain, message }) => {
  try {
    if (child) {
      await Log.create({ child, type, domain, message });
    }
  } catch (err) {
    console.error("Activity log error:", err);
  }
};
