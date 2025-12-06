const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user = await Doctor.findById(decoded.userId);
    let userType = 'doctor';
    
    if (!user) {
      user = await Patient.findById(decoded.userId);
      userType = 'patient';
    }

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    req.userType = userType;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const isDoctor = (req, res, next) => {
  if (req.userType !== 'doctor') {
    return res.status(403).json({ message: 'Access denied. Doctor only.' });
  }
  next();
};

const isPatient = (req, res, next) => {
  if (req.userType !== 'patient') {
    return res.status(403).json({ message: 'Access denied. Patient only.' });
  }
  next();
};

module.exports = { authenticate, isDoctor, isPatient };

