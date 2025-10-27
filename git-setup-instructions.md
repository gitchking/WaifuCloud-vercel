# Git Setup Instructions for WaifuCloud

## 1. Install Git
First, download and install Git from: https://git-scm.com/download/win

## 2. Configure Git (After Installation)
Open a terminal/command prompt and run:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 3. Initialize the Repository
Navigate to your project directory and run:
```bash
cd c:\Users\celic\OneDrive\Desktop\proxima-waifu-gallery-91238-main
git init
git add .
git commit -m "Initial commit"
```

## 4. Push to GitHub
```bash
git remote add origin https://github.com/gitchking/WaifuCloud.git
git branch -M main
git push -u origin main
```

## 5. If You Have Authentication Issues
You may need to use a Personal Access Token:
```bash
git remote set-url origin https://username:token@github.com/gitchking/WaifuCloud.git
git push -u origin main
```

Or use SSH (requires SSH key setup):
```bash
git remote set-url origin git@github.com:gitchking/WaifuCloud.git
git push -u origin main
```