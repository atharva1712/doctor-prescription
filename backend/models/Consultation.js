const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  // Step 1: Current illness history
  currentIllnessHistory: {
    type: String,
    required: true
  },
  recentSurgery: {
    type: String,
    default: ''
  },
  surgeryTimeSpan: {
    type: String,
    default: ''
  },
  // Step 2: Family medical history
  familyMedicalHistory: {
    diabetics: {
      type: String,
      enum: ['Diabetics', 'Non-Diabetics'],
      default: 'Non-Diabetics'
    },
    allergies: {
      type: String,
      default: ''
    },
    others: {
      type: String,
      default: ''
    }
  },
  // Step 3: Payment
  transactionId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'prescribed', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Consultation', consultationSchema);

