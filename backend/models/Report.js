const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  station: { type: String, required: true },
  line: { type: String, enum: ['Western', 'Central'], required: true },
  issue: { type: String, enum: ['Crowd', 'Delay', 'Platform Change'], required: true },
  details: { type: String, default: "" }, // Stores info like PF 2 -> PF 4
  message: { type: String, default: "" }, // Custom alert message added by user
  upvotes: { type: Number, default: 0 },
  verifiedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  fakeVotes: { type: Number, default: 0 },
  fakedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-delete records 24 hours (86400 seconds) after creation
ReportSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Report', ReportSchema);
