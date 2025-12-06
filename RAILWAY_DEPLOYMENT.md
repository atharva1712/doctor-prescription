# Railway Deployment Guide - Doctor Prescription Platform

This guide will walk you through deploying your MERN stack application on Railway step by step.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **MongoDB Atlas Account** (or use Railway's MongoDB): For database hosting

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

### Option A: MongoDB Atlas (Recommended)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login
3. Create a new cluster (Free tier is fine)
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. Replace `<password>` with your database password
7. Add database name at the end: `...mongodb.net/prescription_platform?retryWrites=true&w=majority`
8. **Save this connection string** - you'll need it later

### Option B: Railway MongoDB Plugin

1. In Railway dashboard, click **"New"** → **"Database"** → **"Add MongoDB"**
2. Railway will provide a connection string automatically

---

## 🔧 Step 2: Prepare Backend for Deployment

### 2.1 Update `backend/package.json`

Make sure your `package.json` has a start script:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 2.2 Create `backend/railway.json` (Optional)

Create a file `backend/railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2.3 Update `backend/server.js` for Production

Make sure your server.js handles production port correctly:

```javascript
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

The `'0.0.0.0'` ensures Railway can bind to the port correctly.

### 2.4 Create `.railwayignore` (Optional)

Create `backend/.railwayignore` to exclude unnecessary files:

```
node_modules
.env
.git
*.log
uploads/*
!uploads/.gitkeep
```

---

## 🚀 Step 3: Deploy Backend to Railway

### 3.1 Create New Project on Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your repository
6. Railway will detect it's a Node.js project

### 3.2 Configure Backend Service

1. Railway will create a service automatically
2. Click on the service
3. Go to **"Settings"** tab
4. Set **Root Directory** to `backend` (if your backend is in a subfolder)
5. Set **Start Command** to `npm start`

### 3.3 Set Environment Variables

Go to **"Variables"** tab and add:

```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
NODE_ENV=production
```

**Important:**
- Replace `your_mongodb_atlas_connection_string` with your actual MongoDB connection string
- Generate a strong JWT_SECRET (you can use: `openssl rand -base64 32` or any random string generator)
- Railway will automatically set `PORT`, but you can keep it for reference

### 3.4 Deploy Backend

1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** button
3. Wait for deployment to complete
4. Go to **"Settings"** → **"Generate Domain"** to get your backend URL
5. **Copy this URL** - it will look like: `https://your-app-name.up.railway.app`

---

## 🎨 Step 4: Prepare Frontend for Deployment

### 4.1 Update Frontend Environment Variables

Create `frontend/.env.production`:

```env
REACT_APP_API_URL=https://your-backend-url.up.railway.app/api
```

Replace `your-backend-url.up.railway.app` with your actual Railway backend URL.

### 4.2 Update `frontend/package.json`

Make sure build script exists:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### 4.3 Create `frontend/railway.json`

Create `frontend/railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npx serve -s build -l 3000",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 4.4 Install serve package

Add to `frontend/package.json` dependencies:

```json
{
  "dependencies": {
    "serve": "^14.2.0"
  }
}
```

Or run:
```bash
cd frontend
npm install serve --save
```

### 4.5 Update CORS in Backend (if needed)

Make sure `backend/server.js` allows your frontend domain:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.up.railway.app'
  ],
  credentials: true
}));
```

Or for development, you can use:

```javascript
app.use(cors()); // Allows all origins (for development)
```

---

## 🚀 Step 5: Deploy Frontend to Railway

### 5.1 Create New Service for Frontend

1. In your Railway project, click **"New"** → **"GitHub Repo"**
2. Select the same repository
3. Railway will create a new service

### 5.2 Configure Frontend Service

1. Click on the new service
2. Go to **"Settings"** tab
3. Set **Root Directory** to `frontend`
4. Set **Build Command** to `npm install && npm run build`
5. Set **Start Command** to `npx serve -s build -l $PORT`

### 5.3 Set Environment Variables

Go to **"Variables"** tab and add:

```
REACT_APP_API_URL=https://your-backend-url.up.railway.app/api
PORT=3000
NODE_ENV=production
```

Replace `your-backend-url.up.railway.app` with your actual backend URL.

### 5.4 Deploy Frontend

1. Railway will automatically build and deploy
2. Wait for deployment to complete
3. Go to **"Settings"** → **"Generate Domain"** to get your frontend URL
4. **Copy this URL**

---

## 🔗 Step 6: Update Frontend API URL

### 6.1 Update Environment Variable

1. Go to your frontend service in Railway
2. Go to **"Variables"** tab
3. Update `REACT_APP_API_URL` with your actual backend URL
4. Railway will automatically redeploy

### 6.2 Update Backend CORS (if needed)

1. Go to your backend service
2. Update CORS to include your frontend URL
3. Redeploy if needed

---

## 📁 Step 7: Handle File Uploads

### 7.1 Option A: Use Railway Volume (Recommended for Production)

1. In backend service, go to **"Settings"** → **"Volumes"**
2. Click **"Add Volume"**
3. Mount path: `/uploads`
4. This will persist uploaded files

### 7.2 Option B: Use Cloud Storage (Better for Production)

For production, consider using:
- **AWS S3**
- **Cloudinary**
- **Railway's built-in storage**

Update your upload code to use cloud storage instead of local filesystem.

---

## ✅ Step 8: Verify Deployment

### 8.1 Test Backend

1. Open your backend URL: `https://your-backend.up.railway.app/api/doctors`
2. Should return JSON (empty array if no doctors)
3. Check logs in Railway dashboard for any errors

### 8.2 Test Frontend

1. Open your frontend URL
2. Try to sign up/sign in
3. Check browser console for errors
4. Verify API calls are going to correct backend URL

### 8.3 Check Logs

1. In Railway dashboard, click on your service
2. Go to **"Deployments"** tab
3. Click on latest deployment
4. Check **"Logs"** for any errors

---

## 🔧 Step 9: Common Issues and Fixes

### Issue 1: "Cannot GET /" on Backend

**Fix:** Make sure your backend has a root route or Railway is serving from `/api`

### Issue 2: CORS Errors

**Fix:** Update CORS in `backend/server.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
```

### Issue 3: Environment Variables Not Working

**Fix:** 
- Make sure variables are set in Railway dashboard
- Restart the service after adding variables
- For React apps, variables must start with `REACT_APP_`

### Issue 4: Build Fails

**Fix:**
- Check build logs in Railway
- Make sure all dependencies are in `package.json`
- Check Node.js version compatibility

### Issue 5: Port Already in Use

**Fix:** Railway automatically sets `PORT` environment variable. Use:
```javascript
const PORT = process.env.PORT || 5000;
```

### Issue 6: MongoDB Connection Fails

**Fix:**
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for all IPs)
- Verify connection string is correct
- Check MongoDB username and password

---

## 📝 Step 10: Final Checklist

- [ ] MongoDB Atlas cluster created and connection string obtained
- [ ] Backend deployed on Railway
- [ ] Backend environment variables set (MONGODB_URI, JWT_SECRET, etc.)
- [ ] Backend domain generated and working
- [ ] Frontend deployed on Railway
- [ ] Frontend environment variable set (REACT_APP_API_URL)
- [ ] Frontend domain generated
- [ ] CORS configured correctly
- [ ] File uploads working (or using cloud storage)
- [ ] Tested sign up/sign in
- [ ] Tested consultation flow
- [ ] Tested prescription creation
- [ ] All logs checked for errors

---

## 🎯 Quick Reference: Railway URLs

After deployment, you'll have:

- **Backend URL**: `https://your-backend-name.up.railway.app`
- **Backend API**: `https://your-backend-name.up.railway.app/api`
- **Frontend URL**: `https://your-frontend-name.up.railway.app`

---

## 🔄 Step 11: Continuous Deployment

Railway automatically deploys when you push to GitHub:

1. Make changes to your code
2. Commit and push to GitHub
3. Railway detects changes
4. Automatically rebuilds and redeploys
5. Check deployment status in Railway dashboard

---

## 💰 Railway Pricing

- **Free Tier**: $5 credit per month
- **Hobby Plan**: $5/month for additional resources
- Check [railway.app/pricing](https://railway.app/pricing) for current pricing

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)

---

## 🆘 Troubleshooting

### View Logs
1. Go to Railway dashboard
2. Click on your service
3. Click **"View Logs"** or check **"Deployments"** → **"Logs"**

### Restart Service
1. Go to service settings
2. Click **"Restart"** or **"Redeploy"**

### Check Environment Variables
1. Go to **"Variables"** tab
2. Verify all required variables are set
3. Check for typos

### Database Connection Issues
1. Verify MongoDB connection string
2. Check MongoDB Atlas network access (IP whitelist)
3. Verify database user credentials

---

## 🎉 Success!

Once everything is deployed:
- Share your frontend URL with users
- Monitor logs regularly
- Set up custom domains if needed (Railway Pro feature)
- Consider setting up monitoring and alerts

Good luck with your deployment! 🚀

