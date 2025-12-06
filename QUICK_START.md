# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher) - [Download](https://nodejs.org/)
- MongoDB (local or Atlas) - [Download](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas)

## Step-by-Step Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Setup Backend Environment Variables

Create `backend/.env` file with the following content:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prescription_platform
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**For MongoDB Atlas**, replace `MONGODB_URI` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prescription_platform
```

### 3. Install Frontend Dependencies

Open a **new terminal** and run:

```bash
cd frontend
npm install
```

### 4. Setup Frontend Environment Variables

Create `frontend/.env` file with the following content:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Start MongoDB

**If using local MongoDB:**
- Make sure MongoDB service is running
- On Windows: MongoDB should start automatically, or run `net start MongoDB`
- On Mac/Linux: `sudo systemctl start mongod` or `brew services start mongodb-community`

**If using MongoDB Atlas:**
- No local setup needed, just ensure your connection string is correct

### 6. Start Backend Server

In the backend terminal:

```bash
cd backend
npm start
```

You should see:
```
MongoDB Connected
Server running on port 5000
```

### 7. Start Frontend Server

In the frontend terminal:

```bash
cd frontend
npm start
```

The browser should automatically open to `http://localhost:3000`

## Access the Application

### Patient Routes
- Sign Up: http://localhost:3000/patient/signup
- Sign In: http://localhost:3000/patient/signin
- Dashboard: http://localhost:3000/patient/dashboard

### Doctor Routes
- Sign Up: http://localhost:3000/doctor/signup
- Sign In: http://localhost:3000/doctor/signin
- Profile: http://localhost:3000/doctor/profile

## Development Mode (Auto-reload)

For backend development with auto-reload:

```bash
cd backend
npm run dev
```

## Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running: `mongosh` or `mongo`
- Verify connection string in `backend/.env`
- For Atlas: Check network access and credentials

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port by setting `PORT=3001` in `frontend/.env` or use `set PORT=3001 && npm start`

### Module Not Found Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### CORS Errors
- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` in `frontend/.env`

## Quick Commands Summary

```bash
# Backend
cd backend
npm install          # Install dependencies
npm start            # Start server
npm run dev          # Start with auto-reload

# Frontend
cd frontend
npm install          # Install dependencies
npm start            # Start development server
npm run build        # Build for production
```

## Testing the Application

1. **Create a Doctor Account:**
   - Go to http://localhost:3000/doctor/signup
   - Fill in the form and sign up

2. **Create a Patient Account:**
   - Go to http://localhost:3000/patient/signup
   - Fill in the form and sign up

3. **Test Consultation Flow:**
   - Patient logs in → View Doctors → Click Consult → Fill consultation form → Submit

4. **Test Prescription Flow:**
   - Doctor logs in → Go to Prescriptions → View consultation → Write prescription → Save

