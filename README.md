# Online Prescription Platform

A comprehensive MERN stack web application that enables doctors and patients to manage prescriptions digitally. Patients can consult with doctors, submit medical information, and receive prescriptions in PDF format.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)
![License](https://img.shields.io/badge/License-ISC-yellow)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Key Features Explained](#-key-features-explained)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 👨‍⚕️ Doctor Features

- **Authentication**: Secure sign-up and sign-in with JWT tokens
- **Profile Management**: Complete profile with picture, specialty, experience, and address
- **Edit Profile**: Update profile information, change password, upload new profile picture
- **Consultation Management**: View all consultation requests from patients
- **Prescription Writing**: Create prescriptions with care instructions and medicines
- **PDF Generation**: Automatically generate professional PDF prescriptions
- **Prescription Management**: Edit and resend prescriptions to patients
- **View Patient History**: Access patient consultation details before prescribing

### 👤 Patient Features

- **Authentication**: Secure sign-up and sign-in with JWT tokens
- **Profile Management**: Complete profile with medical history (surgery, illnesses)
- **Edit Profile**: Update profile information, medical history, and profile picture
- **Doctor Discovery**: Browse and view all available doctors in a grid layout
- **Consultation Submission**: Multi-step form to submit consultation requests
- **Payment Integration**: QR code payment with transaction ID verification
- **Consultation History**: View all past consultations with doctors
- **Prescription Access**: View and download prescription PDFs sent by doctors

### 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with middleware
- User type validation (doctor/patient)
- Input validation with express-validator
- CORS configuration

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **PDFKit** - PDF generation
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router v6** - Client-side routing
- **Material-UI (MUI)** - UI component library
- **Axios** - HTTP client
- **QRCode.react** - QR code generation
- **Context API** - State management

## 📁 Project Structure

```
doctorprescription/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── Doctor.js            # Doctor schema
│   │   ├── Patient.js           # Patient schema
│   │   ├── Consultation.js      # Consultation schema
│   │   └── Prescription.js       # Prescription schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── doctors.js           # Doctor routes
│   │   ├── patients.js          # Patient routes
│   │   ├── consultations.js     # Consultation routes
│   │   └── prescriptions.js     # Prescription routes
│   ├── uploads/                 # Uploaded files
│   │   ├── prescriptions/       # Generated PDFs
│   │   └── profilePicture-*     # Profile pictures
│   ├── server.js                # Express server setup
│   ├── package.json
│   └── .env                      # Environment variables
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── DoctorSignUp.tsx
│   │   │   │   ├── DoctorSignIn.tsx
│   │   │   │   ├── PatientSignUp.tsx
│   │   │   │   └── PatientSignIn.tsx
│   │   │   ├── doctor/
│   │   │   │   ├── DoctorProfile.tsx
│   │   │   │   ├── PrescriptionPage.tsx
│   │   │   │   └── PrescriptionForm.tsx
│   │   │   └── patient/
│   │   │       ├── PatientDashboard.tsx
│   │   │       ├── DoctorsList.tsx
│   │   │       ├── ConsultationForm.tsx
│   │   │       └── PatientConsultations.tsx
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces
│   │   ├── App.tsx               # Main app component
│   │   └── index.tsx             # Entry point
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local installation) or **MongoDB Atlas** account
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd doctorprescription
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install --legacy-peer-deps
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `backend/.env` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/prescription_platform
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prescription_platform?retryWrites=true&w=majority

# JWT Secret (use a long random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server Port (optional, defaults to 5000)
PORT=5000

# Environment
NODE_ENV=development
```

### Frontend Environment Variables

Create a `frontend/.env` file:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npx serve -s build
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/doctor/signup` | Doctor registration | No |
| POST | `/api/auth/doctor/signin` | Doctor login | No |
| POST | `/api/auth/patient/signup` | Patient registration | No |
| POST | `/api/auth/patient/signin` | Patient login | No |

### Doctors

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/doctors` | Get all doctors | No |
| GET | `/api/doctors/:id` | Get doctor by ID | No |
| GET | `/api/doctors/profile/me` | Get current doctor profile | Doctor |
| PUT | `/api/doctors/profile/me` | Update doctor profile | Doctor |

### Patients

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/patients/profile/me` | Get current patient profile | Patient |
| PUT | `/api/patients/profile/me` | Update patient profile | Patient |

### Consultations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/consultations` | Create consultation | Patient |
| GET | `/api/consultations/doctor` | Get doctor's consultations | Doctor |
| GET | `/api/consultations/patient` | Get patient's consultations | Patient |
| GET | `/api/consultations/:id` | Get consultation by ID | Doctor/Patient |

### Prescriptions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/prescriptions` | Create prescription | Doctor |
| GET | `/api/prescriptions/doctor` | Get doctor's prescriptions | Doctor |
| GET | `/api/prescriptions/patient` | Get patient's prescriptions | Patient |
| GET | `/api/prescriptions/:id` | Get prescription by ID | Doctor/Patient |
| PUT | `/api/prescriptions/:id` | Update prescription | Doctor |

## 🌐 Deployment

### Railway Deployment (Recommended)

See detailed deployment guide: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

**Quick Steps:**
1. Push code to GitHub
2. Create Railway project
3. Add MongoDB service (or use MongoDB Atlas)
4. Deploy backend service
5. Deploy frontend service
6. Set environment variables
7. Generate domains

### Environment Variables for Production

**Backend:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `NODE_ENV=production`

**Frontend:**
- `REACT_APP_API_URL` - Backend API URL (e.g., `https://your-backend.up.railway.app/api`)

## 🔑 Key Features Explained

### Multi-Step Consultation Form

Patients submit consultations through a 3-step process:
1. **Step 1**: Current illness history and recent surgery details
2. **Step 2**: Family medical history (diabetics status, allergies, others)
3. **Step 3**: Payment via QR code and transaction ID submission

### Prescription PDF Generation

- Automatically generates professional PDF prescriptions
- Includes doctor details, patient information, care instructions, and medicines
- PDFs are stored on the server and accessible to patients
- Doctors can edit and regenerate PDFs

### Profile Management

Both doctors and patients can:
- View their complete profile
- Edit profile information
- Update password
- Change profile picture

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Verify `MONGODB_URI` is set correctly
- Check MongoDB is running (if local)
- Verify network access (if Atlas)

**JWT Authentication Error:**
- Ensure `JWT_SECRET` is set
- Check token is included in request headers
- Verify token hasn't expired

**File Upload Issues:**
- Check `uploads/` directory exists
- Verify file size limits
- Check multer configuration

**CORS Errors:**
- Verify CORS is configured in backend
- Check frontend URL is allowed
- Ensure credentials are included

For more troubleshooting, see:
- [RAILWAY_500_ERROR_FIX.md](./RAILWAY_500_ERROR_FIX.md)
- [RAILWAY_FRONTEND_FIX.md](./RAILWAY_FRONTEND_FIX.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📚 Additional Documentation

- [CODE_EXPLANATION.md](./CODE_EXPLANATION.md) - Detailed code explanations
- [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - Railway deployment guide
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [PHASES.md](./PHASES.md) - Development phases

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

Developed as a MERN stack project for online prescription management.

## 🙏 Acknowledgments

- Material-UI for the component library
- MongoDB for the database solution
- Railway for deployment platform
- All open-source contributors

---

## 📞 Support

For issues and questions:
- Check the [Troubleshooting](./TROUBLESHOOTING.md) guide
- Review [CODE_EXPLANATION.md](./CODE_EXPLANATION.md) for code details
- See deployment guides for Railway setup

---

**Made with ❤️ using MERN Stack**
