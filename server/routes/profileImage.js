const express = require('express');
const router = express.Router();
const ProfileImage = require('../models/ProfileImage');
const auth = require('../middleware/auth');
const User = require('../models/User');

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

    // Update both User and ProfileImage models
    const [profileImage, user] = await Promise.all([
      // Update or create ProfileImage
      ProfileImage.findOneAndUpdate(
        { usn },
        { 
          imageUrl,
          updatedAt: Date.now()
        },
        { 
          upsert: true, 
          new: true 
        }
      ),
      
      // Update User
      User.findOneAndUpdate(
        { usn },
        { profilePicture: imageUrl },
        { new: true }
      )
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      imageUrl: profileImage.imageUrl,
      user
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile image',
      error: error.message
    });
  }
});

module.exports = router; 