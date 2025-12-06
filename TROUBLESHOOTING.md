# Troubleshooting Guide

## Issue: App Stuck on Loading Screen

### Common Causes:

1. **Backend Server Not Running**
   - **Solution**: Make sure the backend server is running on port 5000
   - Check: Open http://localhost:5000/api/doctors in browser (should return JSON or error, not "Cannot GET")
   - Start backend: `cd backend && npm start`

2. **MongoDB Not Connected**
   - **Solution**: Check if MongoDB is running
   - Local MongoDB: `mongosh` or check MongoDB service
   - MongoDB Atlas: Verify connection string in `backend/.env`
   - Backend console should show: "MongoDB Connected"

3. **Environment Variables Not Set**
   - **Backend**: Check `backend/.env` exists with:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/prescription_platform
     JWT_SECRET=your_secret_key
     ```
   - **Frontend**: Check `frontend/.env` exists with:
     ```
     REACT_APP_API_URL=http://localhost:5000/api
     ```

4. **CORS Issues**
   - **Solution**: Backend should have CORS enabled (already configured)
   - Check browser console for CORS errors
   - Verify `REACT_APP_API_URL` matches backend port

5. **Old Token in LocalStorage**
   - **Solution**: Clear browser localStorage
   - Open browser console (F12) → Application/Storage → Local Storage → Clear
   - Or: `localStorage.clear()` in console

### Quick Fixes:

**Clear LocalStorage:**
```javascript
// In browser console (F12)
localStorage.clear()
location.reload()
```

**Check Backend Status:**
```bash
# Test if backend is running
curl http://localhost:5000/api/doctors
# Or open in browser: http://localhost:5000/api/doctors
```

**Check Frontend Environment:**
```bash
# Make sure .env file exists in frontend/
cd frontend
cat .env  # Linux/Mac
type .env  # Windows
```

**Restart Both Servers:**
1. Stop both frontend and backend (Ctrl+C)
2. Start backend first: `cd backend && npm start`
3. Wait for "MongoDB Connected" message
4. Start frontend: `cd frontend && npm start`

## Issue: MongoDB Connection Error

**Error**: "MongoDB connection error"

**Solutions:**
1. **Local MongoDB:**
   - Start MongoDB service: `net start MongoDB` (Windows) or `brew services start mongodb-community` (Mac)
   - Check if running: `mongosh`

2. **MongoDB Atlas:**
   - Verify connection string format
   - Check network access (IP whitelist)
   - Verify username/password in connection string

## Issue: Port Already in Use

**Error**: "Port 5000 already in use" or "Port 3000 already in use"

**Solutions:**
1. Find and kill process using the port
2. Change port in `.env` file
3. Update `REACT_APP_API_URL` if backend port changes

## Issue: Module Not Found

**Error**: "Cannot find module" or "Module not found"

**Solutions:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json  # Linux/Mac
rmdir /s node_modules && del package-lock.json  # Windows
npm install
```

## Issue: TypeScript Errors

**Error**: TypeScript compilation errors

**Solutions:**
1. Check `tsconfig.json` exists
2. Verify TypeScript version: `npm list typescript`
3. Should be version 4.9.5 (compatible with react-scripts)

## Issue: API Calls Failing

**Error**: Network errors or 404/500 responses

**Checklist:**
1. ✅ Backend server running
2. ✅ MongoDB connected
3. ✅ Correct API URL in frontend `.env`
4. ✅ CORS enabled (already configured)
5. ✅ Routes exist in backend

**Test API:**
```bash
# Test doctors endpoint
curl http://localhost:5000/api/doctors

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/doctors/profile/me
```

## Still Having Issues?

1. **Check Browser Console** (F12) for errors
2. **Check Backend Console** for error messages
3. **Verify all environment variables** are set correctly
4. **Clear browser cache and localStorage**
5. **Restart both servers**

