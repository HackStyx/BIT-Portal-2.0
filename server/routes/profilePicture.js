const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      const dir = path.join(__dirname, '..', 'uploads', 'profile-pictures');
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (error) {
      console.error('Error creating directory:', error);
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload endpoint
router.post('/upload-profile-picture', (req, res) => {
  upload.single('image')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    } else if (err) {
      // An unknown error occurred
      console.error('Unknown error:', err);
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    // Everything went fine
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Success
    res.json({
      success: true,
      imageUrl: `/uploads/profile-pictures/${req.file.filename}`,
      message: 'File uploaded successfully'
    });
  });
});

// Get profile picture endpoint
router.get('/get-profile-picture/:usn', async (req, res) => {
  try {
    const dir = path.join(__dirname, '..', 'uploads', 'profile-pictures');
    const files = await fs.readdir(dir);
    
    // Find the most recent profile picture
    const profilePics = files.filter(file => file.startsWith('profile-'));
    if (profilePics.length > 0) {
      const latestPic = profilePics[profilePics.length - 1];
      res.json({
        success: true,
        imageUrl: `/uploads/profile-pictures/${latestPic}`
      });
    } else {
      res.json({
        success: false,
        message: 'No profile picture found'
      });
    }
  } catch (error) {
    console.error('Error getting profile picture:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile picture'
    });
  }
});

module.exports = router;
