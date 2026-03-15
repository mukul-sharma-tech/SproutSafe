import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  child: { type: mongoose.Schema.Types.ObjectId, ref: 'Child' },
  type: { type: String }, // e.g., 'BLOCKED_URL', 'INCOGNITO_ALERT'
  domain: { type: String },
  timestamp: { type: Date, default: Date.now },
  message: { type: String }
});

export default mongoose.model('Log', logSchema);
