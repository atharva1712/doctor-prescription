# Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Installation Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Windows (PowerShell):
Copy-Item .env.example .env

# Linux/Mac:
cp .env.example .env

# Edit .env file with your MongoDB connection string and JWT secret
# MONGODB_URI=mongodb://localhost:27017/prescription_platform
# JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
# PORT=5000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
# Windows (PowerShell):
Copy-Item .env.example .env

# Linux/Mac:
cp .env.example .env

# Edit .env file with your API URL
# REACT_APP_API_URL=http://localhost:5000/api
```

### 3. MongoDB Setup

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/prescription_platform`

#### Option B: MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Update `.env` file in backend with Atlas connection string

### 4. Create Required Directories

```bash
# Backend uploads directory (should be created automatically)
# If not, create manually:
cd backend
mkdir uploads
mkdir uploads/prescriptions
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

Backend will run on `http://localhost:5000`

### Start Frontend Server

```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3000`

## Accessing the Application

### Doctor Routes
- Sign Up: `http://localhost:3000/doctor/signup`
- Sign In: `http://localhost:3000/doctor/signin`
- Profile: `http://localhost:3000/doctor/profile`
- Prescriptions: `http://localhost:3000/doctor/prescriptions`

### Patient Routes
- Sign Up: `http://localhost:3000/patient/signup`
- Sign In: `http://localhost:3000/patient/signin`
- Dashboard: `http://localhost:3000/patient/dashboard`
- Doctors List: `http://localhost:3000/patient/doctors`

## API Endpoints

### Authentication
- `POST /api/auth/doctor/signup` - Doctor registration
- `POST /api/auth/doctor/signin` - Doctor login
- `POST /api/auth/patient/signup` - Patient registration
- `POST /api/auth/patient/signin` - Patient login

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get single doctor
- `GET /api/doctors/profile/me` - Get current doctor profile

### Patients
- `GET /api/patients/profile/me` - Get current patient profile

### Consultations
- `POST /api/consultations` - Create consultation
- `GET /api/consultations/doctor` - Get doctor's consultations
- `GET /api/consultations/patient` - Get patient's consultations
- `GET /api/consultations/:id` - Get single consultation

### Prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/doctor` - Get doctor's prescriptions
- `GET /api/prescriptions/patient` - Get patient's prescriptions
- `GET /api/prescriptions/:id` - Get single prescription
- `PUT /api/prescriptions/:id` - Update prescription

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env` file
- Verify network access for MongoDB Atlas

### Port Already in Use
- Change PORT in backend `.env` file
- Update `REACT_APP_API_URL` in frontend `.env` file accordingly

### File Upload Issues
- Ensure `uploads` directory exists in backend
- Check file permissions
- Verify multer configuration

### CORS Issues
- Ensure backend CORS is configured correctly
- Check API URL in frontend `.env` file

## Development Tips

1. **Backend Development**
   - Use `npm run dev` for auto-reload with nodemon
   - Check console for MongoDB connection status
   - Verify JWT token in request headers

2. **Frontend Development**
   - React app auto-reloads on file changes
   - Check browser console for errors
   - Verify API calls in Network tab

3. **Testing**
   - Create test doctor and patient accounts
   - Test complete consultation flow
   - Verify PDF generation

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Build frontend: `cd frontend && npm run build`
3. Configure production MongoDB connection
4. Set up file storage (AWS S3 or similar)
5. Configure environment variables on hosting platform
6. Deploy backend and frontend separately

