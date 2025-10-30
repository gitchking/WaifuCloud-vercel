# Quick Deploy Commands

## 🚀 Deploy in 3 Steps

### Step 1: Commit Changes
```bash
git add .
git commit -m "feat: Add multiple images support and waifu terminology"
```

### Step 2: Push to Repository
```bash
git push origin main
```

### Step 3: Wait for Vercel
- Vercel auto-deploys (2-3 minutes)
- Check status: https://vercel.com/dashboard

---

## ⚡ Alternative: Vercel CLI

```bash
# Install CLI (first time only)
npm install -g vercel

# Login (first time only)
vercel login

# Deploy to production
vercel --prod
```

---

## ✅ Before Deploying

**IMPORTANT:** Apply database migration first!

1. Open Supabase Dashboard → SQL Editor
2. Run `quick_migration.sql`
3. Verify with `check_schema.sql`

---

## 🧪 After Deployment

Test these URLs on your live site:

- `/upload` - Upload multiple images
- `/watch/{any-post-id}` - Check image slider
- `/dashboard` - Verify image counts
- `/admin` - Test admin upload

---

## 🐛 If Something Breaks

### Rollback
1. Vercel Dashboard → Deployments
2. Find previous working version
3. Click "..." → "Promote to Production"

### Check Logs
```bash
vercel logs
```

Or: Vercel Dashboard → Your Project → Deployments → View Logs

---

## 📋 Quick Checklist

- [ ] Database migration applied
- [ ] Code committed and pushed
- [ ] Vercel deployment successful
- [ ] Upload page works
- [ ] Watch page shows slider
- [ ] No console errors

Done! 🎉
