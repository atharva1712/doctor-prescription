# Fix: ERR_NAME_NOT_RESOLVED Error

This error means the frontend can't find the backend URL. Here's how to fix it.

## 🔍 Problem

The frontend is trying to connect to a backend URL that doesn't exist or is incorrect.

## ✅ Solution

### Step 1: Get Your Backend URL

1. Go to **Railway** → Your **Backend service**
2. Go to **"Settings"** tab
3. Click **"Generate Domain"** (if not already done)
4. Copy the domain (looks like: `https://your-backend-name.up.railway.app`)
5. Your API URL will be: `https://your-backend-name.up.railway.app/api`

### Step 2: Set Frontend Environment Variable

1. Go to **Railway** → Your **Frontend service**
2. Go to **"Variables"** tab
3. Add/Update:
   ```
   REACT_APP_API_URL=https://your-backend-name.up.railway.app/api
   ```
   **Replace `your-backend-name.up.railway.app` with your actual backend domain**

4. **Important:** 
   - Variable name MUST be `REACT_APP_API_URL` (React requires `REACT_APP_` prefix)
   - Include `/api` at the end
   - Use `https://` not `http://`

### Step 3: Redeploy Frontend

1. After setting the variable, Railway will automatically redeploy
2. Or manually click **"Redeploy"** button
3. Wait for deployment to complete

### Step 4: Verify

1. Open your frontend URL in browser
2. Open **Developer Tools** (F12) → **Console** tab
3. Try to sign up or sign in
4. Check Network tab for API calls
5. Should see requests to: `https://your-backend-name.up.railway.app/api/...`

---

## 🔧 Alternative: Check Current Configuration

### Check What URL Frontend is Using

1. Open browser console (F12)
2. Type:
   ```javascript
   console.log(process.env.REACT_APP_API_URL)
   ```
3. This shows what URL the frontend is trying to use

### Common Issues

**Issue 1: Variable Not Set**
- Make sure `REACT_APP_API_URL` is set in Railway frontend service
- Variable name is case-sensitive

**Issue 2: Wrong URL Format**
- Should be: `https://backend-name.up.railway.app/api`
- NOT: `http://localhost:5000/api`
- NOT: `backend-name.up.railway.app/api` (missing https://)

**Issue 3: Missing /api**
- Backend serves API at `/api` route
- Frontend URL must include `/api` at the end

**Issue 4: Backend Not Deployed**
- Make sure backend service is deployed and running
- Check backend logs in Railway
- Verify backend domain is accessible

---

## 🧪 Quick Test

### Test Backend Directly

1. Open browser
2. Go to: `https://your-backend-name.up.railway.app/api/doctors`
3. Should see JSON response (empty array `[]` if no doctors)
4. If this works, backend is fine - issue is frontend configuration

### Test Frontend API Call

1. Open frontend in browser
2. Open Developer Tools → Network tab
3. Try to sign up
4. Look for failed requests
5. Check the URL it's trying to connect to

---

## 📝 Step-by-Step Fix

1. ✅ **Backend deployed?** → Check Railway backend service is running
2. ✅ **Backend URL?** → Copy from Railway backend settings
3. ✅ **Frontend variable set?** → `REACT_APP_API_URL=https://backend-url.up.railway.app/api`
4. ✅ **Frontend redeployed?** → After setting variable, redeploy
5. ✅ **Test connection?** → Try sign up/login

---

## 🔄 If Still Not Working

### Option 1: Check Backend CORS

Make sure backend allows frontend domain:

```javascript
// backend/server.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-name.up.railway.app'
  ],
  credentials: true
}));
```

Or for development:
```javascript
app.use(cors()); // Allows all origins
```

### Option 2: Verify Environment Variable

1. Railway Frontend → Variables
2. Make sure variable shows:
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-backend.up.railway.app/api`
3. No extra spaces or quotes

### Option 3: Check Build Logs

1. Railway Frontend → Deployments
2. Click latest deployment
3. Check logs for:
   - Environment variables being set
   - Build errors
   - Any warnings about API URL

---

## ✅ Success Indicators

After fixing, you should see:
- ✅ Frontend loads without errors
- ✅ Sign up/login works
- ✅ Network requests go to Railway backend URL
- ✅ No `ERR_NAME_NOT_RESOLVED` errors
- ✅ API calls return data

---

## 🎯 Quick Checklist

- [ ] Backend service deployed and running
- [ ] Backend domain generated in Railway
- [ ] Frontend `REACT_APP_API_URL` variable set correctly
- [ ] URL includes `https://` and `/api`
- [ ] Frontend service redeployed after setting variable
- [ ] CORS configured in backend (if needed)
- [ ] Tested backend URL directly in browser
- [ ] Checked browser console for errors

---

## 💡 Pro Tip

**Use Railway Service References (Advanced):**

If both services are in the same Railway project:

```
REACT_APP_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api
```

This automatically uses your backend's domain. But manual URL works fine too!

---

The most common issue is forgetting to set `REACT_APP_API_URL` in the frontend service variables. Make sure it's set and the frontend is redeployed! 🚀

