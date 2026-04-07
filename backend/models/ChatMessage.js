const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderImg: { type: String, default: '' }, // Store URL reference or base64 thumbnail
  message: { type: String, required: true, maxlength: 300 },
  isEdited: { type: Boolean, default: false },
  updatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now, index: { expireAfterSeconds: 604800 } } // 7-day TTL
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
