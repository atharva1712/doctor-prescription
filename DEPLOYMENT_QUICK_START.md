# Quick Start: Railway Deployment

## 🚀 Fast Track Deployment (5 Minutes)

### Step 1: MongoDB Atlas Setup (2 min)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/prescription_platform?retryWrites=true&w=majority`
4. Add IP `0.0.0.0/0` to Network Access (allow all IPs)

### Step 2: Deploy Backend (2 min)
1. Go to [railway.app](https://railway.app) → New Project → GitHub Repo
2. Select your repo
3. **Settings** → Root Directory: `backend`
4. **Variables** → Add:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=any_random_long_string_here
   ```
5. **Settings** → Generate Domain
6. Copy backend URL

### Step 3: Deploy Frontend (1 min)
1. In same Railway project → **New** → **GitHub Repo** (same repo)
2. **Settings** → Root Directory: `frontend`
3. **Settings** → Build Command: `npm install && npm run build`
4. **Settings** → Start Command: `npx serve -s build -l $PORT`
5. **Variables** → Add:
   ```
   REACT_APP_API_URL=https://your-backend-url.up.railway.app/api
   ```
6. **Settings** → Generate Domain

### Step 4: Test
- Open frontend URL
- Try signing up
- Check Railway logs if issues

## 📝 Important Notes

- Backend URL format: `https://xxx.up.railway.app`
- Frontend needs backend URL in `REACT_APP_API_URL`
- MongoDB connection string must include database name
- Railway auto-deploys on git push

## 🔧 Common Fixes

**CORS Error?** → Backend `server.js` already has `app.use(cors())` - should work

**Build Fails?** → Check logs, ensure all dependencies in package.json

**Can't Connect to DB?** → Check MongoDB Atlas IP whitelist (add 0.0.0.0/0)

**Port Error?** → Railway sets PORT automatically, code already handles it

---

For detailed instructions, see `RAILWAY_DEPLOYMENT.md`

