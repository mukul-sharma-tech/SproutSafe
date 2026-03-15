import Child from "../models/child.js";
import Parent from "../models/parent.js";
import { logActivity } from "../utillity/activityService.js";

// Check every 1 minute
const CHECK_INTERVAL = 60 * 1000;
// Consider offline if no heartbeat for 2 minutes
const HEARTBEAT_TIMEOUT = 2 * 60 * 1000;

export const startHeartbeatMonitor = () => {
    console.log("Starting Heartbeat Monitor...");

    setInterval(async () => {
        try {
            const now = new Date();
            const timeoutThreshold = new Date(now.getTime() - HEARTBEAT_TIMEOUT);

            // Find children who are marked online but haven't sent a heartbeat recently
            const offlineChildren = await Child.find({
                status: 'online',
                lastHeartbeat: { $lt: timeoutThreshold }
            });

            for (const child of offlineChildren) {
                console.log(`Child ${child.email} went offline. Last heartbeat: ${child.lastHeartbeat}`);

                // Mark as offline
                child.status = 'offline';
                await child.save();

                // Notify Parent
                const parent = await Parent.findOne({ children: child._id });
                if (parent) {
                    const msg = `❌ Extension offline: ${child.name}'s extension stopped responding (no heartbeat)`;
                    await logActivity({
                      child: child._id,
                      parentEmail: parent.email,
                      type: "EXTENSION_DISCONNECTED",
                      domain: null,
                      message: msg,
                    });
                }
            }

        } catch (err) {
            console.error("Heartbeat Monitor Error:", err);
        }
    }, CHECK_INTERVAL);
};
