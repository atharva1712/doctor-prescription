const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
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

router.get('/profile/me', authenticate, async (req, res) => {
  try {
    if (req.userType !== 'patient') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const patient = await Patient.findById(req.userId).select('-password');
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/profile/me', authenticate, upload.single('profilePicture'), async (req, res) => {
  try {
    if (req.userType !== 'patient') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, phone, age, historyOfSurgery, historyOfIllness, password } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (age) updateData.age = parseInt(age);
    if (historyOfSurgery !== undefined) updateData.historyOfSurgery = historyOfSurgery;
    if (historyOfIllness !== undefined) {
      updateData.historyOfIllness = typeof historyOfIllness === 'string' 
        ? historyOfIllness.split(',').map(item => item.trim()).filter(item => item)
        : historyOfIllness;
    }
    if (req.file) updateData.profilePicture = req.file.path;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const patient = await Patient.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

