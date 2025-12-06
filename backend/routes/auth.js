const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const multer = require('multer');
const path = require('path');

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

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/doctor/signup', upload.single('profilePicture'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('specialty').trim().notEmpty().withMessage('Specialty is required'),
  body('yearsOfExperience').isFloat({ min: 0 }).withMessage('Years of experience must be a valid number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, specialty, yearsOfExperience, address } = req.body;

    const existingDoctor = await Doctor.findOne({ $or: [{ email }, { phone }] });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Email or phone number already exists' });
    }

    const doctor = new Doctor({
      name,
      email,
      password,
      phone,
      specialty,
      yearsOfExperience: parseFloat(yearsOfExperience),
      address: address || 'address will go here',
      profilePicture: req.file ? req.file.path : ''
    });

    await doctor.save();

    const token = generateToken(doctor._id);

    res.status(201).json({
      token,
      user: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        profilePicture: doctor.profilePicture
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Doctor Sign In
router.post('/doctor/signin', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(doctor._id);

    res.json({
      token,
      user: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        profilePicture: doctor.profilePicture
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/patient/signup', upload.single('profilePicture'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('age').isInt({ min: 0 }).withMessage('Age must be a valid number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, age, historyOfSurgery, historyOfIllness } = req.body;

    // Check if email or phone already exists
    const existingPatient = await Patient.findOne({ $or: [{ email }, { phone }] });
    if (existingPatient) {
      return res.status(400).json({ message: 'Email or phone number already exists' });
    }

    // Parse history of illness (comma-separated)
    const illnessArray = historyOfIllness ? historyOfIllness.split(',').map(item => item.trim()).filter(item => item) : [];

    const patient = new Patient({
      name,
      email,
      password,
      phone,
      age: parseInt(age),
      historyOfSurgery: historyOfSurgery || '',
      historyOfIllness: illnessArray,
      profilePicture: req.file ? req.file.path : ''
    });

    await patient.save();

    const token = generateToken(patient._id);

    res.status(201).json({
      token,
      user: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        profilePicture: patient.profilePicture
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/patient/signin', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(patient._id);

    res.json({
      token,
      user: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        profilePicture: patient.profilePicture
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

