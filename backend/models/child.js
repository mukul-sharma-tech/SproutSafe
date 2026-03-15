import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  url: String,
  domain: String,
  category: String,
  dailyTimeSpent: {
    type: Map,
    of: Number,
    default: {}
  },
  searchQueries: [String],
  lastUpdated: { type: Date, default: Date.now }
});

const childSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Parent" },
  extensionToken: String,
  location: String,
  blockedUrls: [String],
  monitoredUrls: [urlSchema],
  incognitoAlerts: [
    {
      url: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  lastHeartbeat: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  lockoutUntil: {
    type: Date,
    default: null
  },
  failedAttempts: {
    type: Number,
    default: 0
  }
});


export default mongoose.model("Child", childSchema);
