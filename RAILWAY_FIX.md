# Fix: Railway Build Error - "Script start.sh not found"

## Problem
Railway shows error: "Railpack could not determine how to build the app"

## Solution

### Option 1: Set Root Directory (Easiest)

1. Go to Railway dashboard
2. Click on your service
3. Go to **Settings** tab
4. **Set Root Directory** to:
   - `backend` for backend service
   - `frontend` for frontend service
5. **Change Builder** from "Railpack" to **"Nixpacks"**
6. Click **"Redeploy"**

### Option 2: Verify Files Exist

Make sure these files exist in the correct directories:

**Backend:**
- `backend/package.json` ✅
- `backend/server.js` ✅
- `backend/nixpacks.toml` ✅ (just created)

**Frontend:**
- `frontend/package.json` ✅
- `frontend/nixpacks.toml` ✅ (just created)

### Option 3: Manual Configuration

If still not working:

1. **Backend Settings:**
   - Root Directory: `backend`
   - Builder: `Nixpacks`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Frontend Settings:**
   - Root Directory: `frontend`
   - Builder: `Nixpacks`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s build -l $PORT`

### Option 4: Check Project Structure

Your project should look like:
```
doctorprescription/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── nixpacks.toml
│   └── ...
├── frontend/
│   ├── package.json
│   ├── nixpacks.toml
│   └── ...
└── README.md
```

### Common Issues:

1. **Wrong Builder Selected**
   - Railway might default to "Railpack"
   - Change to **"Nixpacks"** in Settings

2. **Root Directory Not Set**
   - If backend/frontend are in subfolders, MUST set Root Directory
   - Without it, Railway looks in root and finds nothing

3. **package.json Not Found**
   - Make sure package.json exists in the Root Directory you set
   - Check file paths are correct

### Quick Fix Steps:

1. ✅ Delete the service in Railway
2. ✅ Create new service
3. ✅ Select your GitHub repo
4. ✅ **IMMEDIATELY** go to Settings
5. ✅ Set Root Directory: `backend` or `frontend`
6. ✅ Set Builder: `Nixpacks`
7. ✅ Add environment variables
8. ✅ Deploy

The `nixpacks.toml` files I created will help Railway detect Node.js projects correctly.

