const { Schema, model, Types } = require('mongoose');

const MessageSchema = new Schema(
  {
    conversationId: { type: Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, default: '' },
    attachments: [{
      url: String,
      type: { type: String, enum: ['image', 'video', 'file'], default: 'file' },
      name: String,
      size: Number,
    }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = model('Message', MessageSchema);
