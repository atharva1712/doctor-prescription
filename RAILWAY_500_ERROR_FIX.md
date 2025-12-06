# Fix: 500 Internal Server Error on Railway

A 500 error means the backend is receiving requests but crashing. Here's how to debug and fix it.

## 🔍 Step 1: Check Railway Backend Logs

1. Go to **Railway** → Your **Backend service**
2. Click **"View Logs"** or go to **"Deployments"** → Latest deployment → **"Logs"**
3. Look for error messages (usually in red)
4. Common errors you might see:
   - `MongoDB connection error`
   - `JWT_SECRET is not defined`
   - `Cannot find module`
   - `EADDRINUSE` (port already in use)

## ✅ Common Fixes

### Fix 1: MongoDB Connection Error

**Error in logs:** `MongoDB connection error` or `MongooseServerSelectionError`

**Solution:**
1. Check `MONGODB_URI` environment variable is set
2. For Railway MongoDB: Use `${{MongoDB.MONGO_URL}}/prescription_platform`
3. For Atlas: Verify connection string is correct
4. Make sure database name is included: `/prescription_platform`

**Test:**
- Check logs for "MongoDB Connected" message
- If not, MongoDB connection is failing

### Fix 2: Missing JWT_SECRET

**Error in logs:** `JWT_SECRET is not defined` or `jwt.sign requires a secret`

**Solution:**
1. Railway Backend → **Variables** tab
2. Add:
   ```
   JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
   ```
3. Generate a strong secret (any random long string)
4. Redeploy backend

### Fix 3: Missing Environment Variables

**Check all required variables are set:**

```
MONGODB_URI=your_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=production
PORT=5000 (optional, Railway sets this automatically)
```

### Fix 4: File Upload Directory Missing

**Error:** `ENOENT: no such file or directory, mkdir 'uploads'`

**Solution:**
Railway's filesystem is ephemeral. You need to create directories on startup or use cloud storage.

**Option A: Create directories in code (Quick Fix)**

Update `backend/server.js`:

```javascript
const fs = require('fs');
const path = require('path');

// Create upload directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const prescriptionsDir = path.join(__dirname, 'uploads/prescriptions');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(prescriptionsDir)) {
  fs.mkdirSync(prescriptionsDir, { recursive: true });
}
```

**Option B: Use Railway Volume (Better for Production)**

1. Railway Backend → **Settings** → **Volumes**
2. Click **"Add Volume"**
3. Mount path: `/uploads`
4. This persists uploaded files

### Fix 5: Port Binding Error

**Error:** `EADDRINUSE: address already in use`

**Solution:**
Your `server.js` should already be correct:
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

Railway automatically sets `PORT` - don't override it.

### Fix 6: Missing Dependencies

**Error:** `Cannot find module 'xyz'`

**Solution:**
1. Check `backend/package.json` has all dependencies
2. Railway should install them automatically
3. If not, check build logs for npm install errors

---

## 🧪 Step 2: Test Backend Directly

### Test 1: Health Check

Open in browser:
```
https://your-backend.up.railway.app/api/doctors
```

Should return JSON (empty array `[]` if no doctors).

### Test 2: Check Specific Endpoint

Try:
```
https://your-backend.up.railway.app/api/auth/doctor/signin
```

If you get 500, check logs for that specific error.

---

## 🔧 Step 3: Add Error Handling

If errors aren't showing in logs, add better error handling:

**Update `backend/server.js`:**

```javascript
// Add error handler before routes
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Server error', 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});
```

This will log errors to Railway logs.

---

## 📝 Step 4: Verify Environment Variables

**In Railway Backend → Variables, make sure you have:**

1. **MONGODB_URI** - Database connection string
2. **JWT_SECRET** - Secret key for JWT tokens
3. **NODE_ENV** - Set to `production` (optional but recommended)

**For Railway MongoDB:**
```
MONGODB_URI=${{MongoDB.MONGO_URL}}/prescription_platform
```

**For MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prescription_platform?retryWrites=true&w=majority
```

---

## 🐛 Step 5: Debug Specific Endpoints

### Check Which Endpoint is Failing

1. Open browser Developer Tools (F12)
2. Go to **Network** tab
3. Try the action that's failing (sign up, login, etc.)
4. Click on the failed request
5. Check:
   - **Request URL** - Which endpoint?
   - **Response** - What error message?
   - **Status Code** - Should be 500

### Common Failing Endpoints:

**Sign Up/Sign In:**
- Check `JWT_SECRET` is set
- Check MongoDB connection
- Check password hashing (bcrypt)

**File Upload:**
- Check uploads directory exists
- Check file size limits
- Check multer configuration

**Database Queries:**
- Check MongoDB connection
- Check collection names match
- Check ObjectId format

---

## ✅ Quick Fix Checklist

- [ ] Check Railway backend logs for specific error
- [ ] Verify `MONGODB_URI` is set correctly
- [ ] Verify `JWT_SECRET` is set
- [ ] Check MongoDB connection (logs should show "MongoDB Connected")
- [ ] Create uploads directories (if file uploads fail)
- [ ] Test backend URL directly in browser
- [ ] Check which specific endpoint returns 500
- [ ] Verify all environment variables are set
- [ ] Restart/redeploy backend service

---

## 🔍 Most Common Causes

1. **Missing MONGODB_URI** (40% of cases)
   - Backend can't connect to database
   - Fix: Set `MONGODB_URI` in Railway variables

2. **Missing JWT_SECRET** (30% of cases)
   - Authentication fails
   - Fix: Set `JWT_SECRET` in Railway variables

3. **MongoDB Connection Failed** (20% of cases)
   - Wrong connection string
   - Network access not configured
   - Fix: Verify connection string, check Atlas network settings

4. **Missing Upload Directories** (10% of cases)
   - File uploads fail
   - Fix: Create directories or use Railway volume

---

## 🚀 Quick Fix Steps

1. **Check Logs** → Railway Backend → View Logs
2. **Find Error** → Look for red error messages
3. **Fix Issue** → Based on error message
4. **Redeploy** → Railway auto-redeploys or click Redeploy
5. **Test Again** → Try the action that was failing

---

## 💡 Pro Tip

**Enable Detailed Logging:**

Add to `backend/server.js`:
```javascript
// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

This helps identify which endpoint is failing.

---

## 🆘 Still Not Working?

1. **Share the error from Railway logs** - The exact error message helps
2. **Check which endpoint fails** - Sign up? Login? File upload?
3. **Verify backend is running** - Check Railway service status
4. **Test backend directly** - Use browser/Postman to test API endpoints

The Railway logs will tell you exactly what's wrong! Check them first. 🔍

