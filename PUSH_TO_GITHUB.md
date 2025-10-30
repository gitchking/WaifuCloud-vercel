# Push Project to GitHub Repository

## 🎯 Target Repository
https://github.com/gitchking/WaifuCloud.git

---

## 🚀 Quick Push Commands

### If Git is Already Initialized

```bash
# Add the remote repository
git remote add origin https://github.com/gitchking/WaifuCloud.git

# Or if origin already exists, update it
git remote set-url origin https://github.com/gitchking/WaifuCloud.git

# Add all files
git add .

# Commit changes
git commit -m "feat: Add multiple images support and waifu terminology"

# Push to main branch
git push -u origin main
```

### If Git is NOT Initialized

```bash
# Initialize git repository
git init

# Add remote repository
git remote add origin https://github.com/gitchking/WaifuCloud.git

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: WaifuCloud with multiple images support"

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## 📋 Step-by-Step Guide

### Step 1: Check Git Status

```bash
# Check if git is initialized
git status
```

**If you see:** "fatal: not a git repository"
→ Run: `git init`

**If you see:** List of files
→ Git is already initialized, continue to Step 2

### Step 2: Check .gitignore

Make sure you have a `.gitignore` file to exclude sensitive files:

```bash
# Check if .gitignore exists
cat .gitignore
```

**Important files to exclude:**
- `.env` (contains secrets!)
- `node_modules/`
- `dist/`
- `.vercel/`

### Step 3: Add Remote Repository

```bash
# Check existing remotes
git remote -v

# If no remote exists, add it
git remote add origin https://github.com/gitchking/WaifuCloud.git

# If origin exists but wrong URL, update it
git remote set-url origin https://github.com/gitchking/WaifuCloud.git
```

### Step 4: Stage All Changes

```bash
# Add all files
git add .

# Or add specific files
git add src/ public/ package.json README.md
```

### Step 5: Commit Changes

```bash
git commit -m "feat: Add multiple images support and waifu terminology

- Added multiple image upload (up to 15 images per post)
- Replaced wallpaper terminology with waifu
- Implemented image slider on watch page
- Added image count badges on cards
- Updated admin panel with same features
- Watch page now displays all images in 16:9 aspect ratio"
```

### Step 6: Push to GitHub

```bash
# Push to main branch
git push -u origin main

# If main branch doesn't exist, create it
git branch -M main
git push -u origin main
```

---

## 🔐 Authentication

### If Prompted for Credentials

**Option 1: Personal Access Token (Recommended)**
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo` (full control)
4. Copy the token
5. Use token as password when pushing

**Option 2: SSH Key**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub → Settings → SSH and GPG keys

# Change remote to SSH
git remote set-url origin git@github.com:gitchking/WaifuCloud.git
```

---

## ⚠️ Important: Protect Sensitive Files

### Before Pushing, Check .gitignore

Create or update `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.production

# Dependencies
node_modules/
.pnp
.pnp.js

# Build output
dist/
build/
.vercel/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/
```

### Remove .env from Git (if already tracked)

```bash
# Remove from git but keep locally
git rm --cached .env

# Commit the removal
git commit -m "chore: Remove .env from version control"
```

---

## 🧪 Verify Before Pushing

### Check What Will Be Pushed

```bash
# See what files are staged
git status

# See what changes will be pushed
git diff --cached

# See commit history
git log --oneline
```

### Verify .env is NOT Included

```bash
# This should NOT show .env
git ls-files | grep .env
```

If `.env` appears, remove it:
```bash
git rm --cached .env
git commit -m "chore: Remove .env from tracking"
```

---

## 📦 Complete Push Script

Save this as `push-to-github.sh`:

```bash
#!/bin/bash

echo "🚀 Pushing WaifuCloud to GitHub..."

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
fi

# Add remote if not exists
if ! git remote | grep -q origin; then
    echo "Adding remote repository..."
    git remote add origin https://github.com/gitchking/WaifuCloud.git
else
    echo "Updating remote URL..."
    git remote set-url origin https://github.com/gitchking/WaifuCloud.git
fi

# Stage all changes
echo "Staging changes..."
git add .

# Commit
echo "Committing changes..."
git commit -m "feat: Add multiple images support and waifu terminology"

# Rename to main branch
echo "Ensuring main branch..."
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "✅ Done! Check: https://github.com/gitchking/WaifuCloud"
```

Make it executable and run:
```bash
chmod +x push-to-github.sh
./push-to-github.sh
```

---

## 🐛 Troubleshooting

### Error: "remote origin already exists"

```bash
# Update the URL instead
git remote set-url origin https://github.com/gitchking/WaifuCloud.git
```

### Error: "failed to push some refs"

```bash
# Pull first, then push
git pull origin main --rebase
git push -u origin main
```

### Error: "Permission denied"

```bash
# Use personal access token as password
# Or set up SSH key (see Authentication section above)
```

### Error: "large files"

```bash
# Check file sizes
find . -type f -size +50M

# Use Git LFS for large files
git lfs install
git lfs track "*.psd"
git lfs track "*.mp4"
```

---

## ✅ After Pushing

### Verify on GitHub

1. Go to https://github.com/gitchking/WaifuCloud
2. Check that all files are there
3. Verify `.env` is NOT visible
4. Check commit history

### Set Up GitHub Actions (Optional)

Create `.github/workflows/deploy.yml` for auto-deployment

### Update Repository Settings

1. Go to repository Settings
2. Add description: "WaifuCloud - Anime wallpaper sharing platform"
3. Add topics: `react`, `typescript`, `supabase`, `vercel`
4. Set up branch protection rules (optional)

---

## 🎉 Success!

Your project is now on GitHub! 

**Next Steps:**
1. ✅ Code is on GitHub
2. ⏭️ Vercel will auto-deploy from GitHub
3. ⏭️ Apply database migration in Supabase
4. ⏭️ Test the live site

**Repository URL:**
https://github.com/gitchking/WaifuCloud
