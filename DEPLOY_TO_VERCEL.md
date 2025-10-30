# Deploy to Vercel - Complete Guide

## 🚀 Quick Deployment Steps

### Prerequisites
- ✅ All code changes committed to Git
- ✅ Database migration applied (run `quick_migration.sql`)
- ✅ Vercel account connected to your repository

---

## Option 1: Automatic Deployment (Recommended)

### Step 1: Commit and Push Changes

```bash
# Check what files have changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add multiple images support and waifu terminology"

# Push to your main branch (or master)
git push origin main
```

### Step 2: Vercel Auto-Deploy
- Vercel will automatically detect the push
- Deployment starts immediately
- Check deployment status at: https://vercel.com/dashboard

### Step 3: Monitor Deployment
1. Go to Vercel Dashboard
2. Click on your project
3. Watch the deployment progress
4. Wait for "Ready" status (usually 2-3 minutes)

---

## Option 2: Manual Deployment via Vercel CLI

### Step 1: Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
# For production deployment
vercel --prod

# Or just deploy to preview
vercel
```

---

## Option 3: Deploy via Vercel Dashboard

### Step 1: Commit Changes Locally
```bash
git add .
git commit -m "feat: Add multiple images support and waifu terminology"
git push origin main
```

### Step 2: Manual Trigger
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Deployments" tab
4. Click "Redeploy" on the latest deployment
5. Confirm redeployment

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

### Code Changes
- ✅ Upload page updated (multiple images)
- ✅ Admin page updated (multiple images)
- ✅ Dashboard updated (image counts)
- ✅ Watch page updated (image slider + 16:9)
- ✅ All "wallpaper" → "waifu" changes
- ✅ Type definitions updated
- ✅ Components updated

### Database
- ✅ Migration applied (`quick_migration.sql`)
- ✅ `images` column exists
- ✅ `image_count` column exists
- ✅ Existing data migrated

### Environment Variables (Vercel)
Check these are set in Vercel Dashboard → Settings → Environment Variables:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ Any other custom variables

---

## 🔍 Post-Deployment Verification

After deployment completes:

### 1. Check Deployment Status
```
✅ Build successful
✅ No errors in build logs
✅ Deployment is live
```

### 2. Test Core Features
Visit your deployed site and test:

**Upload Page** (`/upload`)
- [ ] Can access upload page
- [ ] Can select multiple images (up to 15)
- [ ] Images show in preview grid
- [ ] Upload succeeds
- [ ] Success message appears

**Watch Page** (`/watch/{id}`)
- [ ] Single image posts display in 16:9
- [ ] Multiple image posts show slider
- [ ] Navigation arrows work
- [ ] Thumbnails work
- [ ] Download works

**Dashboard** (`/dashboard`)
- [ ] Shows image count badges
- [ ] Can edit posts
- [ ] All text says "waifu"

**Admin Panel** (`/admin`)
- [ ] Can upload multiple images
- [ ] Same functionality as Upload page

### 3. Check Browser Console
- [ ] No JavaScript errors
- [ ] No 404 errors
- [ ] No CORS errors

### 4. Test on Different Devices
- [ ] Desktop browser
- [ ] Mobile browser
- [ ] Tablet (if available)

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Install dependencies locally and commit
npm install
git add package-lock.json
git commit -m "fix: Update dependencies"
git push
```

**Error: "Type errors"**
```bash
# Check TypeScript errors locally
npm run type-check
# Fix errors and commit
```

### Deployment Succeeds but Features Don't Work

**Upload fails with "column does not exist"**
→ Database migration not applied
→ Run `quick_migration.sql` in Supabase

**Images don't show in slider**
→ Check if `images` field is populated
→ Verify data in Supabase dashboard

**Old terminology still showing**
→ Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
→ Clear browser cache

### Environment Variables Issues

**Supabase connection fails**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. If changed, redeploy

---

## 📊 Deployment Commands Reference

### Git Commands
```bash
# Check status
git status

# Add all changes
git add .

# Add specific files
git add src/pages/Upload.tsx src/pages/Admin.tsx

# Commit
git commit -m "feat: Add multiple images support"

# Push to main branch
git push origin main

# Push to different branch
git push origin your-branch-name
```

### Vercel CLI Commands
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls

# View logs
vercel logs

# Pull environment variables
vercel env pull
```

---

## 🎯 Deployment Workflow

### Standard Workflow
```
1. Make code changes
   ↓
2. Test locally (npm run dev)
   ↓
3. Commit changes (git commit)
   ↓
4. Push to repository (git push)
   ↓
5. Vercel auto-deploys
   ↓
6. Verify deployment
   ↓
7. Test live site
```

### Emergency Rollback
If something goes wrong:
1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." → "Promote to Production"

---

## 📝 Commit Message Template

Use clear, descriptive commit messages:

```bash
# Feature additions
git commit -m "feat: Add multiple images upload support"
git commit -m "feat: Replace wallpaper with waifu terminology"

# Bug fixes
git commit -m "fix: Resolve image slider navigation issue"

# Updates
git commit -m "update: Improve image display on watch page"

# Documentation
git commit -m "docs: Add deployment guide"
```

---

## ✅ Final Checklist

Before considering deployment complete:

### Code
- [ ] All changes committed
- [ ] Pushed to repository
- [ ] No uncommitted files

### Database
- [ ] Migration applied in Supabase
- [ ] Verified with `check_schema.sql`
- [ ] Existing data migrated

### Deployment
- [ ] Build successful
- [ ] No errors in Vercel logs
- [ ] Site is accessible

### Testing
- [ ] Upload works (single & multiple images)
- [ ] Watch page displays correctly
- [ ] Dashboard shows image counts
- [ ] Admin panel works
- [ ] All "waifu" terminology correct

### Performance
- [ ] Images load properly
- [ ] No console errors
- [ ] Responsive on mobile

---

## 🆘 Need Help?

### Check Vercel Logs
```bash
# Via CLI
vercel logs

# Via Dashboard
Vercel Dashboard → Your Project → Deployments → Click deployment → View Logs
```

### Check Build Logs
1. Vercel Dashboard → Your Project
2. Click on the deployment
3. Click "Building" or "Build Logs"
4. Look for errors

### Common Issues
- **Build fails**: Check package.json dependencies
- **Runtime errors**: Check browser console
- **Database errors**: Verify migration applied
- **Environment variables**: Check Vercel settings

---

## 🎉 Success!

Once deployed successfully:
- ✅ Multiple images feature is live
- ✅ All "waifu" terminology updated
- ✅ Watch page displays in 16:9
- ✅ Users can upload 1-15 images per post
- ✅ Image slider works perfectly

Your app is now live with all the new features! 🚀
