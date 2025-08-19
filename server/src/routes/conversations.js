const express = require('express');
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const router = express.Router();

// Start or fetch a DM between two users
router.post('/', async (req, res) => {
  try {
    const { userAId, userBId } = req.body;
    if (!userAId || !userBId) return res.status(400).json({ error: 'userAId and userBId are required' });

    if (!mongoose.isValidObjectId(userAId) || !mongoose.isValidObjectId(userBId)) {
      return res.status(400).json({ error: 'invalid user ids' });
    }

    if (userAId === userBId) return res.status(400).json({ error: 'cannot start a conversation with yourself' });

    const users = await User.find({ _id: { $in: [userAId, userBId] } });
    if (users.length !== 2) return res.status(404).json({ error: 'one or both users not found' });

    let convo = await Conversation.findOne({ participants: { $all: [userAId, userBId], $size: 2 } });
    if (!convo) {
      convo = await Conversation.create({ participants: [userAId, userBId] });
    }
    res.status(201).json(convo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create or fetch conversation' });
  }
});

// List conversations for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const convos = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate('participants', 'displayName username avatarUrl');

    res.json(convos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to list conversations' });
  }
});

// Get a conversation by id
router.get('/:id', async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id).populate('participants', 'displayName username avatarUrl');
    if (!convo) return res.status(404).json({ error: 'conversation not found' });
    res.json(convo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to get conversation' });
  }
});

module.exports = router;
