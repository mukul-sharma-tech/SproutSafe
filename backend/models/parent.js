import mongoose from "mongoose";

const parentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Child' }],
  isVerified: { type: Boolean, default: false }
});

export default mongoose.model('Parent', parentSchema);
