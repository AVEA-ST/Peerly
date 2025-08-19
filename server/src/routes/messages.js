const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const router = express.Router();

// List messages for a conversation (basic pagination)
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ error: 'invalid conversationId' });
    }

    const filter = { conversationId };
    if (before) {
      filter._id = { $lt: before };
    }

    const messages = await Message.find(filter)
      .sort({ _id: -1 })
      .limit(Math.min(parseInt(limit, 10) || 50, 100))
      .populate('senderId', 'displayName username avatarUrl');

    res.json(messages.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to list messages' });
  }
});

// Send a message
router.post('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { senderId, text = '', attachments = [] } = req.body;

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ error: 'invalid conversationId' });
    }
    if (!mongoose.isValidObjectId(senderId)) {
      return res.status(400).json({ error: 'invalid senderId' });
    }

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ error: 'conversation not found' });

    const message = await Message.create({ conversationId, senderId, text, attachments });

    // bump conversation
    convo.lastMessageAt = new Date();
    await convo.save();

    const populated = await message.populate('senderId', 'displayName username avatarUrl');

    // Emit realtime event
    if (req.io) {
      req.io.to(`conversation:${conversationId}`).emit('message:new', populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to send message' });
  }
});

module.exports = router;
