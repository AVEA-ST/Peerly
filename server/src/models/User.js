const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    displayName: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true, index: true },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = model('User', UserSchema);
