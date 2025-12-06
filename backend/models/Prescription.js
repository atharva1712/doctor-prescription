const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  careToBeTaken: {
    type: String,
    required: true
  },
  medicines: {
    type: String,
    default: ''
  },
  pdfPath: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'sent'],
    default: 'draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);

