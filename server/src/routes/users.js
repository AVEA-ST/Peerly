const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Create profile
router.post('/', async (req, res) => {
  try {
    const { displayName, username, bio = '', avatarUrl = '' } = req.body;
    if (!displayName || !username) {
      return res.status(400).json({ error: 'displayName and username are required' });
    }
    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ error: 'username already taken' });

    const user = await User.create({ displayName, username, bio, avatarUrl });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create user' });
  }
});

// Update profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, bio, avatarUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { displayName, bio, avatarUrl } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update user' });
  }
});

// Get user by id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to get user' });
  }
});

// List/search users
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q
      ? { $or: [
          { username: { $regex: q, $options: 'i' } },
          { displayName: { $regex: q, $options: 'i' } }
        ] }
      : {};
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to list users' });
  }
});

module.exports = router;
