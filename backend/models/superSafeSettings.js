import mongoose from "mongoose";

const superSafeSettingsSchema = new mongoose.Schema({
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Parent", unique: true },
  enabled: { type: Boolean, default: false },
  blockExtensionsPage: { type: Boolean, default: true },
  customBlockedWords: { type: [String], default: [] },
  voiceMessageUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("SuperSafeSettings", superSafeSettingsSchema);

