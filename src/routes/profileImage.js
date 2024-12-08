const express = require('express');
const router = express.Router();
const ProfileImage = require('../models/ProfileImage');
const auth = require('../middleware/auth');

// Get profile image
router.get('/profile-image/:usn', async (req, res) => {
  try {
    const profileImage = await ProfileImage.findOne({ usn: req.params.usn });
    if (!profileImage) {
      return res.status(404).json({ message: 'Profile image not found' });
    }
    res.json({ success: true, imageUrl: profileImage.imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile image
router.put('/profile-image', auth, async (req, res) => {
  try {
    const { usn, imageUrl } = req.body;

    let profileImage = await ProfileImage.findOne({ usn });

    if (profileImage) {
      // Update existing record
      profileImage.imageUrl = imageUrl;
      profileImage.updatedAt = Date.now();
    } else {
      // Create new record
      profileImage = new ProfileImage({
        usn,
        imageUrl
      });
    }

    await profileImage.save();
    res.json({ success: true, imageUrl: profileImage.imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 