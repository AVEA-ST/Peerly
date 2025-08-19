const { Schema, model, Types } = require('mongoose');

const ConversationSchema = new Schema(
  {
    participants: [{ type: Types.ObjectId, ref: 'User', required: true, index: true }],
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

// Ensure a conversation between two users is unique (unordered)
ConversationSchema.index({ participants: 1 }, { unique: false });

module.exports = model('Conversation', ConversationSchema);
