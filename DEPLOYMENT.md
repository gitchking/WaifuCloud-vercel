# Deployment to Vercel

This guide explains how to deploy the Waifu Gallery application to Vercel.

## Prerequisites

1. A Vercel account (free at [vercel.com](https://vercel.com))
2. This repository cloned locally or connected to GitHub

## Deployment Steps

### Option 1: Deploy from Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import this repository or select it if already connected
4. Configure the project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add environment variables (see below)
6. Click "Deploy"

### Option 2: Deploy using Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Deploy the project:
   ```bash
   vercel
   ```

3. Follow the prompts to configure the deployment

## Environment Variables

The following environment variables need to be set in your Vercel project settings:

```
VITE_SUPABASE_URL=https://frukkvbgwmskubsxqutq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydWtrdmJnd21za3Vic3hxdXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTc5OTMsImV4cCI6MjA3Njg5Mzk5M30.XaH6Lfx6AjT36a9zEJ8xYJnblIE56gKsspWQOsbYxXQ
```

Note: These values are already in your `.env` file, but when deploying to Vercel, you should add them through the Vercel dashboard for security.

## Configuration Files

This project includes the following configuration files for Vercel deployment:

- `vercel.json`: Configures routing and build settings
- `package.json`: Contains build scripts including `vercel-build`

## Troubleshooting

If you encounter issues during deployment:

1. Ensure all dependencies are properly installed
2. Check that environment variables are correctly set
3. Verify the build command works locally (`npm run build`)
4. Check Vercel logs for specific error messages

## Custom Domain

After deployment, you can add a custom domain through the Vercel dashboard:

1. Go to your project settings
2. Navigate to the "Domains" section
3. Add your custom domain
4. Follow the DNS configuration instructions