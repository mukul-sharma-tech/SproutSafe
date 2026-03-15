import mongoose from "mongoose";

const timedBlockSchema = new mongoose.Schema({
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Parent", required: true },
  domain: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

timedBlockSchema.index({ parent: 1, domain: 1 }, { unique: true });
timedBlockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("TimedBlock", timedBlockSchema);
