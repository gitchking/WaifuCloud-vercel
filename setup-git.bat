@echo off
echo Setting up Git repository for WaifuCloud...
echo.

REM Check if git is available
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Git is not installed or not in PATH.
    echo Please install Git from: https://git-scm.com/download/win
    echo Then run this script again.
    pause
    exit /b 1
)

echo Git found! Proceeding with setup...
echo.

REM Initialize git repository
echo Initializing Git repository...
git init

REM Add remote origin
echo Adding remote repository...
git remote add origin https://github.com/gitchking/WaifuCloud.git

REM Add all files
echo Adding all files...
git add .

REM Create initial commit
echo Creating initial commit...
git commit -m "Initial commit: WaifuCloud - Complete anime wallpaper platform

Features implemented:
- User authentication and profiles
- Wallpaper upload and management  
- Category system with thumbnails
- Search functionality with suggestions
- Favorites system with NSFW filtering
- Admin dashboard with test functions
- Pagination system
- YouTube-style share dialog
- Responsive design and animations
- Complete UI polish and loading states"

REM Set main branch and push
echo Setting main branch and pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Successfully pushed WaifuCloud to GitHub!
echo Repository: https://github.com/gitchking/WaifuCloud
echo.
pause