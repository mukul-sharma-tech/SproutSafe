import mongoose from "mongoose";

const allowedSiteSchema = new mongoose.Schema({
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Parent" },
  domain: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AllowedSite", allowedSiteSchema);

