#!/bin/bash

echo "Setting up Git repository for WaifuCloud..."
echo

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "Git is not installed or not in PATH."
    echo "Please install Git first:"
    echo "  - macOS: brew install git"
    echo "  - Ubuntu/Debian: sudo apt install git"
    echo "  - CentOS/RHEL: sudo yum install git"
    echo "Then run this script again."
    exit 1
fi

echo "Git found! Proceeding with setup..."
echo

# Initialize git repository
echo "Initializing Git repository..."
git init

# Add remote origin
echo "Adding remote repository..."
git remote add origin https://github.com/gitchking/WaifuCloud.git

# Add all files
echo "Adding all files..."
git add .

# Create initial commit
echo "Creating initial commit..."
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

# Set main branch and push
echo "Setting main branch and pushing to GitHub..."
git branch -M main
git push -u origin main

echo
echo "✅ Successfully pushed WaifuCloud to GitHub!"
echo "Repository: https://github.com/gitchking/WaifuCloud"
echo