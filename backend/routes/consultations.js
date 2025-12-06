const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const { authenticate, isPatient, isDoctor } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

router.post('/', authenticate, isPatient, [
  body('doctor').notEmpty().withMessage('Doctor ID is required'),
  body('currentIllnessHistory').notEmpty().withMessage('Current illness history is required'),
  body('transactionId').notEmpty().withMessage('Transaction ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      doctor,
      currentIllnessHistory,
      recentSurgery,
      surgeryTimeSpan,
      familyMedicalHistory,
      transactionId
    } = req.body;

    const consultation = new Consultation({
      patient: req.userId,
      doctor,
      currentIllnessHistory,
      recentSurgery: recentSurgery || '',
      surgeryTimeSpan: surgeryTimeSpan || '',
      familyMedicalHistory: familyMedicalHistory || {
        diabetics: 'Non-Diabetics',
        allergies: '',
        others: ''
      },
      transactionId,
      paymentStatus: 'completed'
    });

    await consultation.save();
    await consultation.populate('patient', 'name email age');
    await consultation.populate('doctor', 'name specialty');

    res.status(201).json(consultation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/doctor', authenticate, isDoctor, async (req, res) => {
  try {
    const consultations = await Consultation.find({ doctor: req.userId })
      .populate('patient', 'name email age profilePicture')
      .sort({ createdAt: -1 });
    res.json(consultations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/patient', authenticate, isPatient, async (req, res) => {
  try {
    const consultations = await Consultation.find({ patient: req.userId })
      .populate('doctor', 'name specialty profilePicture')
      .sort({ createdAt: -1 });
    res.json(consultations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('patient', 'name email age profilePicture historyOfSurgery historyOfIllness')
      .populate('doctor', 'name specialty profilePicture');
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    if (req.userType === 'doctor' && consultation.doctor._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.userType === 'patient' && consultation.patient._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(consultation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

