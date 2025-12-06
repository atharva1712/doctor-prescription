const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password');
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/profile/me', authenticate, async (req, res) => {
  try {
    if (req.userType !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const doctor = await Doctor.findById(req.userId).select('-password');
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/profile/me', authenticate, upload.single('profilePicture'), async (req, res) => {
  try {
    if (req.userType !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, phone, specialty, yearsOfExperience, address, password } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (specialty) updateData.specialty = specialty;
    if (yearsOfExperience) updateData.yearsOfExperience = parseFloat(yearsOfExperience);
    if (address) updateData.address = address;
    if (req.file) updateData.profilePicture = req.file.path;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

