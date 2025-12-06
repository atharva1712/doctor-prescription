const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Consultation = require('../models/Consultation');
const { authenticate, isDoctor } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

router.post('/', authenticate, isDoctor, [
  body('consultation').notEmpty().withMessage('Consultation ID is required'),
  body('careToBeTaken').notEmpty().withMessage('Care to be taken is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { consultation, careToBeTaken, medicines } = req.body;

    const consultationDoc = await Consultation.findById(consultation)
      .populate('patient')
      .populate('doctor');
    
    if (!consultationDoc) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    if (consultationDoc.doctor._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const prescription = new Prescription({
      consultation,
      doctor: req.userId,
      patient: consultationDoc.patient._id,
      careToBeTaken,
      medicines: medicines || ''
    });

    await prescription.save();

    const pdfPath = await generatePDF(prescription, consultationDoc);
    prescription.pdfPath = pdfPath;
    prescription.status = 'sent';
    await prescription.save();

    consultationDoc.status = 'prescribed';
    await consultationDoc.save();

    await prescription.populate('patient', 'name email');
    await prescription.populate('doctor', 'name specialty');
    await prescription.populate('consultation');

    res.status(201).json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/doctor', authenticate, isDoctor, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.userId })
      .populate('patient', 'name email age profilePicture')
      .populate('consultation')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/patient', authenticate, async (req, res) => {
  try {
    if (req.userType !== 'patient') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const prescriptions = await Prescription.find({ patient: req.userId })
      .populate('doctor', 'name specialty profilePicture')
      .populate('consultation')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email age')
      .populate('doctor', 'name specialty')
      .populate('consultation');
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (req.userType === 'doctor' && prescription.doctor._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.userType === 'patient' && prescription.patient._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', authenticate, isDoctor, [
  body('careToBeTaken').notEmpty().withMessage('Care to be taken is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { careToBeTaken, medicines } = req.body;

    const prescription = await Prescription.findById(req.params.id)
      .populate('consultation')
      .populate('patient')
      .populate('doctor');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.doctor._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    prescription.careToBeTaken = careToBeTaken;
    prescription.medicines = medicines || '';

    const consultationDoc = await Consultation.findById(prescription.consultation._id)
      .populate('patient')
      .populate('doctor');
    
    const pdfPath = await generatePDF(prescription, consultationDoc);
    prescription.pdfPath = pdfPath;
    prescription.status = 'sent';
    await prescription.save();

    await prescription.populate('patient', 'name email');
    await prescription.populate('doctor', 'name specialty');
    await prescription.populate('consultation');

    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

async function generatePDF(prescription, consultation) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const fileName = `prescription-${prescription._id}-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../uploads/prescriptions', fileName);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const darkBlue = '#003366';
    const pageWidth = doc.page.width - 100;
    const lineY = 80;

    doc.fontSize(12);
    doc.text(`Dr. ${consultation.doctor.name}`, 50, 50);
    doc.text('Address:', 50, 70);
    const doctorAddress = consultation.doctor.address || 'address will go here';
    doc.text(doctorAddress, 50, 90);
    
    const dateText = `Date: ${new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })}`;
    const dateWidth = doc.widthOfString(dateText);
    doc.text(dateText, pageWidth - dateWidth, 50);

    doc.moveTo(50, lineY)
       .lineTo(pageWidth, lineY)
       .strokeColor(darkBlue)
       .lineWidth(3)
       .stroke();

    let currentY = lineY + 30;

    doc.fontSize(12);
    doc.text('Care to be taken', 50, currentY);
    currentY += 25;

    const careFieldHeight = 100;
    doc.rect(50, currentY, pageWidth - 50, careFieldHeight)
       .strokeColor('#000000')
       .lineWidth(1)
       .stroke();
    
    doc.fontSize(11)
       .text(prescription.careToBeTaken, 55, currentY + 5, {
         width: pageWidth - 60,
         align: 'left'
       });

    currentY += careFieldHeight + 30;

    doc.fontSize(12);
    doc.text('Medicine', 50, currentY);
    currentY += 25;

    const medicineFieldHeight = 100;
    doc.rect(50, currentY, pageWidth - 50, medicineFieldHeight)
       .strokeColor('#000000')
       .lineWidth(1)
       .stroke();
    
    if (prescription.medicines) {
      doc.fontSize(11)
         .text(prescription.medicines, 55, currentY + 5, {
           width: pageWidth - 60,
           align: 'left'
         });
    }

    currentY += medicineFieldHeight + 30;

    doc.moveTo(50, currentY)
       .lineTo(pageWidth, currentY)
       .strokeColor(darkBlue)
       .lineWidth(3)
       .stroke();

    const footerY = doc.page.height - 80;
    doc.fontSize(11)
       .text('Name of doctor', pageWidth - 100, footerY, { align: 'right' });

    doc.end();

    stream.on('finish', () => {
      const relativePath = `uploads/prescriptions/${fileName}`;
      resolve(relativePath);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}

module.exports = router;

