# Code Explanation - Doctor Prescription Platform

This document explains the key parts of the codebase that are commonly asked in interviews or demos.

## 📊 Table of Contents
1. [Database Connection](#1-database-connection)
2. [Data Models & Schema](#2-data-models--schema)
3. [How Data is Saved](#3-how-data-is-saved)
4. [Data Transfer Between Doctor and Patient](#4-data-transfer-between-doctor-and-patient)
5. [Authentication Flow](#5-authentication-flow)
6. [API Endpoints](#6-api-endpoints)

---

## 1. Database Connection

**File: `backend/server.js`**

```javascript
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prescription_platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));
```

**Key Points:**
- Uses **Mongoose** ODM (Object Document Mapper) for MongoDB
- Connection string from environment variable or defaults to local MongoDB
- `useNewUrlParser` and `useUnifiedTopology` are MongoDB driver options
- Connection is established when server starts

---

## 2. Data Models & Schema

### Doctor Model (`backend/models/Doctor.js`)

```javascript
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true, unique: true },
  specialty: { type: String, required: true },
  yearsOfExperience: { type: Number, required: true, min: 0 },
  address: { type: String, default: 'address will go here' },
  profilePicture: { type: String, default: '' }
}, { timestamps: true });

// Password hashing before save
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

**Key Points:**
- `timestamps: true` automatically adds `createdAt` and `updatedAt` fields
- Password is hashed using bcrypt before saving
- `pre('save')` is a Mongoose middleware hook

### Patient Model (`backend/models/Patient.js`)

```javascript
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true, unique: true },
  age: { type: Number, required: true, min: 0 },
  historyOfSurgery: { type: String, default: '' },
  historyOfIllness: { type: [String], default: [] },
  profilePicture: { type: String, default: '' }
}, { timestamps: true });
```

### Consultation Model (`backend/models/Consultation.js`)

```javascript
const consultationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',  // Reference to Patient model
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',   // Reference to Doctor model
    required: true
  },
  currentIllnessHistory: { type: String, required: true },
  recentSurgery: { type: String, default: '' },
  surgeryTimeSpan: { type: String, default: '' },
  familyMedicalHistory: {
    diabetics: { type: String, enum: ['Diabetics', 'Non-Diabetics'] },
    allergies: { type: String, default: '' },
    others: { type: String, default: '' }
  },
  transactionId: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  status: { type: String, enum: ['pending', 'prescribed', 'completed'], default: 'pending' }
}, { timestamps: true });
```

**Key Points:**
- Uses **ObjectId references** to link Patient and Doctor
- `ref` allows Mongoose to populate related documents
- Status tracks consultation lifecycle: pending → prescribed → completed

### Prescription Model (`backend/models/Prescription.js`)

```javascript
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
  careToBeTaken: { type: String, required: true },
  medicines: { type: String, default: '' },
  pdfPath: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'sent'], default: 'draft' }
}, { timestamps: true });
```

---

## 3. How Data is Saved

### Example 1: Saving a Consultation (Patient → Database)

**File: `backend/routes/consultations.js`**

```javascript
router.post('/', authenticate, isPatient, async (req, res) => {
  // 1. Create new Consultation instance
  const consultation = new Consultation({
    patient: req.userId,        // From authenticated user
    doctor: req.body.doctor,     // From request body
    currentIllnessHistory: req.body.currentIllnessHistory,
    recentSurgery: req.body.recentSurgery || '',
    surgeryTimeSpan: req.body.surgeryTimeSpan || '',
    familyMedicalHistory: req.body.familyMedicalHistory || {...},
    transactionId: req.body.transactionId,
    paymentStatus: 'completed'
  });

  // 2. Save to database
  await consultation.save();

  // 3. Populate related fields (replace ObjectId with actual data)
  await consultation.populate('patient', 'name email age');
  await consultation.populate('doctor', 'name specialty');

  // 4. Return saved consultation
  res.status(201).json(consultation);
});
```

**Flow:**
1. Patient submits consultation form → Frontend sends POST request
2. Backend validates data and creates Consultation document
3. `consultation.save()` writes to MongoDB
4. `populate()` fetches related Patient and Doctor data
5. Response sent back to frontend

### Example 2: Saving a Prescription (Doctor → Database)

**File: `backend/routes/prescriptions.js`**

```javascript
router.post('/', authenticate, isDoctor, async (req, res) => {
  // 1. Find consultation
  const consultationDoc = await Consultation.findById(consultation)
    .populate('patient')
    .populate('doctor');

  // 2. Create prescription
  const prescription = new Prescription({
    consultation: consultationId,
    doctor: req.userId,
    patient: consultationDoc.patient._id,
    careToBeTaken: req.body.careToBeTaken,
    medicines: req.body.medicines || ''
  });

  // 3. Save prescription
  await prescription.save();

  // 4. Generate PDF
  const pdfPath = await generatePDF(prescription, consultationDoc);
  
  // 5. Update prescription with PDF path
  prescription.pdfPath = pdfPath;
  prescription.status = 'sent';
  await prescription.save();

  // 6. Update consultation status
  consultationDoc.status = 'prescribed';
  await consultationDoc.save();

  res.status(201).json(prescription);
});
```

**Key Points:**
- Uses `new Model()` to create document instance
- `save()` is async and returns a Promise
- Can update and save multiple times
- Related documents can be updated in the same transaction

---

## 4. Data Transfer Between Doctor and Patient

### Flow Diagram:

```
Patient                    Backend/Database              Doctor
  |                              |                        |
  |-- Submit Consultation ------>|                        |
  |                              |-- Save Consultation --|
  |                              |                        |
  |                              |<-- Consultation -------|
  |                              |                        |
  |                              |-- Get Consultations -->|
  |                              |                        |
  |                              |<-- Prescription -------|
  |<-- View Prescription --------|                        |
```

### Step-by-Step Data Transfer:

#### Step 1: Patient Submits Consultation

**Frontend: `frontend/src/pages/patient/ConsultationForm.tsx`**

```typescript
const handleSubmit = async () => {
  await axios.post(`${API_URL}/consultations`, {
    doctor: doctorId,
    currentIllnessHistory: formData.currentIllnessHistory,
    recentSurgery: formData.recentSurgery,
    surgeryTimeSpan: formData.surgeryTimeSpan,
    familyMedicalHistory: formData.familyMedicalHistory,
    transactionId: formData.transactionId
  });
};
```

**Backend: `backend/routes/consultations.js`**

```javascript
// Saves consultation with patient and doctor IDs
const consultation = new Consultation({
  patient: req.userId,  // Current logged-in patient
  doctor: req.body.doctor,
  // ... other fields
});
await consultation.save();
```

#### Step 2: Doctor Views Patient Consultations

**Backend: `backend/routes/consultations.js`**

```javascript
router.get('/doctor', authenticate, isDoctor, async (req, res) => {
  // Find all consultations for this doctor
  const consultations = await Consultation.find({ doctor: req.userId })
    .populate('patient', 'name email age profilePicture')  // Get patient details
    .sort({ createdAt: -1 });
  
  res.json(consultations);
});
```

**Key:** `populate('patient', ...)` replaces patient ObjectId with actual patient data

#### Step 3: Doctor Creates Prescription

**Backend: `backend/routes/prescriptions.js`**

```javascript
const prescription = new Prescription({
  consultation: consultationId,  // Links to consultation
  doctor: req.userId,           // Current doctor
  patient: consultationDoc.patient._id,  // Patient from consultation
  careToBeTaken: req.body.careToBeTaken,
  medicines: req.body.medicines
});
await prescription.save();
```

#### Step 4: Patient Views Prescriptions

**Backend: `backend/routes/prescriptions.js`**

```javascript
router.get('/patient', authenticate, async (req, res) => {
  const prescriptions = await Prescription.find({ patient: req.userId })
    .populate('doctor', 'name specialty profilePicture')  // Get doctor details
    .populate('consultation')                             // Get consultation details
    .sort({ createdAt: -1 });
  
  res.json(prescriptions);
});
```

**Frontend: `frontend/src/pages/patient/PatientConsultations.tsx`**

```typescript
const fetchData = async () => {
  const [consultationsRes, prescriptionsRes] = await Promise.all([
    axios.get(`${API_URL}/consultations/patient`),
    axios.get(`${API_URL}/prescriptions/patient`)
  ]);
  setConsultations(consultationsRes.data);
  setPrescriptions(prescriptionsRes.data);
};
```

---

## 5. Authentication Flow

### JWT Token Authentication

**File: `backend/middleware/auth.js`**

```javascript
const authenticate = async (req, res, next) => {
  // 1. Extract token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // 2. Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // 3. Find user (try doctor first, then patient)
  let user = await Doctor.findById(decoded.userId);
  let userType = 'doctor';
  
  if (!user) {
    user = await Patient.findById(decoded.userId);
    userType = 'patient';
  }

  if (!user) {
    return res.status(401).json({ message: 'Token is not valid' });
  }

  // 4. Attach user info to request
  req.user = user;
  req.userType = userType;
  req.userId = decoded.userId;
  
  next();
};
```

### Sign Up Flow

**File: `backend/routes/auth.js`**

```javascript
router.post('/doctor/signup', upload.single('profilePicture'), async (req, res) => {
  // 1. Check if email/phone already exists
  const existingDoctor = await Doctor.findOne({ $or: [{ email }, { phone }] });
  if (existingDoctor) {
    return res.status(400).json({ message: 'Email or phone already exists' });
  }

  // 2. Create new doctor
  const doctor = new Doctor({
    name, email, password, phone, specialty,
    yearsOfExperience: parseFloat(yearsOfExperience),
    address: address || 'address will go here',
    profilePicture: req.file ? req.file.path : ''
  });

  // 3. Save to database (password auto-hashed by pre-save hook)
  await doctor.save();

  // 4. Generate JWT token
  const token = generateToken(doctor._id);

  // 5. Return user and token
  res.status(201).json({
    user: { id: doctor._id, name: doctor.name, email: doctor.email },
    token
  });
});
```

### Sign In Flow

```javascript
router.post('/doctor/signin', async (req, res) => {
  // 1. Find doctor by email
  const doctor = await Doctor.findOne({ email });
  if (!doctor) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // 2. Compare password
  const isMatch = await doctor.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // 3. Generate token
  const token = generateToken(doctor._id);

  // 4. Return user and token
  res.json({
    user: { id: doctor._id, name: doctor.name, email: doctor.email },
    token
  });
});
```

---

## 6. API Endpoints

### Patient Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/patient/signup` | Patient sign up | No |
| POST | `/api/auth/patient/signin` | Patient sign in | No |
| GET | `/api/patients/profile/me` | Get patient profile | Yes |
| PUT | `/api/patients/profile/me` | Update patient profile | Yes |
| GET | `/api/doctors` | Get all doctors | No |
| GET | `/api/doctors/:id` | Get doctor by ID | No |
| POST | `/api/consultations` | Create consultation | Yes (Patient) |
| GET | `/api/consultations/patient` | Get patient consultations | Yes (Patient) |
| GET | `/api/prescriptions/patient` | Get patient prescriptions | Yes (Patient) |

### Doctor Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/doctor/signup` | Doctor sign up | No |
| POST | `/api/auth/doctor/signin` | Doctor sign in | No |
| GET | `/api/doctors/profile/me` | Get doctor profile | Yes (Doctor) |
| PUT | `/api/doctors/profile/me` | Update doctor profile | Yes (Doctor) |
| GET | `/api/consultations/doctor` | Get doctor consultations | Yes (Doctor) |
| GET | `/api/consultations/:id` | Get consultation by ID | Yes |
| POST | `/api/prescriptions` | Create prescription | Yes (Doctor) |
| GET | `/api/prescriptions/doctor` | Get doctor prescriptions | Yes (Doctor) |
| PUT | `/api/prescriptions/:id` | Update prescription | Yes (Doctor) |

---

## Key Concepts Explained

### 1. **Mongoose Populate**
```javascript
// Instead of just ObjectId, get full document
await consultation.populate('patient', 'name email age');
// Returns: { patient: { name: 'John', email: 'john@email.com', age: 30 } }
// Instead of: { patient: '507f1f77bcf86cd799439011' }
```

### 2. **ObjectId References**
- Used to link documents across collections
- More efficient than embedding full documents
- Allows querying and populating when needed

### 3. **Middleware Chain**
```javascript
router.post('/', authenticate, isPatient, async (req, res) => {
  // authenticate runs first → verifies JWT token
  // isPatient runs second → checks if user is patient
  // Then handler function runs
});
```

### 4. **File Upload**
```javascript
// Multer middleware handles file uploads
const upload = multer({ storage: storage });
router.post('/signup', upload.single('profilePicture'), ...);
// File saved to 'uploads/' directory
// Path stored in database: 'uploads/profilePicture-1234567890.jpg'
```

### 5. **PDF Generation**
```javascript
// PDFKit creates PDF documents
const doc = new PDFDocument();
// Write content to PDF
doc.text('Care to be taken', 50, 100);
// Save to file system
const stream = fs.createWriteStream(filePath);
doc.pipe(stream);
// Store path in database
prescription.pdfPath = 'uploads/prescriptions/prescription-xxx.pdf';
```

---

## Common Interview Questions

### Q: How does data flow from patient to doctor?
**A:** 
1. Patient submits consultation → Saved to `Consultation` collection with `patient` and `doctor` ObjectIds
2. Doctor queries consultations where `doctor: doctorId` → Gets all patient consultations
3. Doctor creates prescription → Saved to `Prescription` collection with references to consultation, doctor, and patient
4. Patient queries prescriptions where `patient: patientId` → Gets all prescriptions

### Q: How is authentication handled?
**A:**
1. User signs up/in → Backend generates JWT token with `userId`
2. Frontend stores token in localStorage
3. Every API request includes token in `Authorization: Bearer <token>` header
4. Backend middleware verifies token and attaches user info to `req.user` and `req.userId`

### Q: How are relationships between models handled?
**A:**
- Using **Mongoose ObjectId references** with `ref` property
- `populate()` method fetches related documents when needed
- Example: `Consultation` has `patient` and `doctor` ObjectIds, use `.populate('patient')` to get full patient data

### Q: How is password security handled?
**A:**
- Passwords hashed using **bcrypt** with salt rounds of 10
- Hashing happens in `pre('save')` middleware before saving to database
- Never store plain text passwords
- Compare using `comparePassword()` method during login

---

## Summary

- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens with bcrypt password hashing
- **Data Relationships:** ObjectId references with populate
- **File Storage:** Multer for uploads, PDFKit for PDF generation
- **Data Flow:** Patient → Consultation → Doctor → Prescription → Patient

