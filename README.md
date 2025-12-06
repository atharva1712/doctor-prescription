# Online Prescription Platform

A comprehensive MERN stack application for doctors and patients to manage prescriptions online.

## Project Structure

```
doctorprescription/
├── backend/          # Node.js + Express + MongoDB
├── frontend/         # React application
└── README.md
```

## Features

### Doctor Features
- Sign up/Sign in with profile picture, name, specialty, email, phone, years of experience
- View consultation requests from patients
- Write and edit prescriptions
- Generate PDF prescriptions
- Send prescriptions to patients

### Patient Features
- Sign up/Sign in with profile picture, name, age, email, phone, medical history
- View list of available doctors
- Submit consultation forms (multi-step)
- Receive prescriptions from doctors

## Development Phases

### Phase 1: Project Setup ✅
- Initialize backend and frontend
- Configure MongoDB connection
- Set up authentication middleware
- Install required dependencies

### Phase 2: Authentication System
- Doctor sign-up/sign-in
- Patient sign-up/sign-in
- JWT token management
- Protected routes

### Phase 3: Doctor List & Profile
- Patient view doctors grid
- Doctor profile page
- Consultation button functionality

### Phase 4: Consultation Form
- Multi-step form (3 steps)
- Current illness history
- Family medical history
- Payment QR code and transaction ID

### Phase 5: Prescription System
- Doctor view consultations list
- Prescription form (care instructions, medicines)
- PDF generation
- Send prescription to patient
- Edit and resend functionality

### Phase 6: Payment Integration
- QR code display
- Transaction ID validation
- Payment status tracking

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Set up environment variables:
- Create `backend/.env` with MongoDB connection string and JWT secret
- Create `frontend/.env` with API URL

4. Run the application:
- Backend: `cd backend && npm start`
- Frontend: `cd frontend && npm start`

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt
- **Frontend**: React, React Router, Axios, Material-UI or Tailwind CSS
- **PDF Generation**: jsPDF or pdfkit
- **File Upload**: Multer

