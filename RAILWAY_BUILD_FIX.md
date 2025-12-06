# Fix: npm ci Error - Package Lock Out of Sync

## Problem
Railway shows error: "npm ci can only install packages when your package.json and package-lock.json are in sync"

## ✅ Solution Applied

I've updated the `package-lock.json` file by running `npm install` locally. The lock file is now in sync with `package.json`.

## Next Steps

### 1. Commit and Push Updated Files

```bash
git add frontend/package-lock.json
git commit -m "Update package-lock.json with serve dependency"
git push
```

Railway will automatically redeploy with the updated lock file.

### 2. Alternative: Use npm install Instead

If you still get errors, you can change Railway to use `npm install` instead of `npm ci`:

**In Railway Dashboard:**
1. Go to your frontend service
2. Settings → Build Command
3. Change from: `npm ci` (default)
4. To: `npm install --legacy-peer-deps`

**Or update `frontend/nixpacks.toml`:**
```toml
[phases.install]
cmds = ["npm install --legacy-peer-deps"]
```

## Why This Happened

- I added `serve` package to `package.json`
- But `package-lock.json` wasn't updated
- Railway uses `npm ci` which requires exact sync
- `npm ci` is faster and more reliable for production

## Verification

After pushing, check Railway logs:
- Should see: "added X packages"
- Should NOT see: "Missing: serve@..."
- Build should complete successfully

## If Still Failing

1. **Delete service and recreate** with updated code
2. **Or** manually set Build Command to: `npm install --legacy-peer-deps && npm run build`
3. **Or** remove `package-lock.json` and let Railway generate it (not recommended)

The updated `package-lock.json` should fix the issue! 🎉

