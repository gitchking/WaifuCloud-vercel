# Profile Account Management Fixes

## Issues Fixed

### 1. ✅ Password Reset
**Problem:** ResetPassword page was empty, password reset flow didn't work
**Solution:** 
- Created complete ResetPassword page with proper form validation
- Added password visibility toggles
- Proper error handling and user feedback
- Added route to App.tsx

### 2. ✅ Account Deletion
**Problem:** Used client-side admin API which doesn't work (requires server-side privileges)
**Solution:**
- Created secure edge function `delete-account` that:
  - Verifies user authentication
  - Deletes all user data (wallpapers, favorites, profile, avatar)
  - Uses service role key for admin operations
  - Proper cleanup and error handling
- Updated Profile page to call the edge function
- Added double confirmation for safety

### 3. ✅ Better UX
- Added loading states with toast notifications
- Better error messages
- Password strength requirements
- Double confirmation for account deletion
- Clear warning about data loss

## Deployment Steps

### Step 1: Deploy the Edge Function

#### Option A: Using Supabase Dashboard (Easiest)
1. Go to https://supabase.com/dashboard/project/jhusavzdsewoiwhvoczz/functions
2. Click "Create a new function"
3. Name: `delete-account`
4. Copy contents from `supabase/functions/delete-account/index.ts`
5. Click "Deploy"

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref jhusavzdsewoiwhvoczz

# Deploy the function
supabase functions deploy delete-account
```

### Step 2: Configure Email Templates (Optional but Recommended)

The password reset email can be customized:
1. Go to https://supabase.com/dashboard/project/jhusavzdsewoiwhvoczz/auth/templates
2. Select "Reset Password" template
3. Use the template from `supabase/email-templates/recovery.html`
4. Make sure the reset link points to: `{{ .SiteURL }}/reset-password`

### Step 3: Test the Features

#### Test Password Reset:
1. Log in to your app
2. Go to Profile page
3. Click "Change Password"
4. Check your email
5. Click the reset link
6. Enter new password
7. Should redirect to profile with success message

#### Test Account Deletion:
1. Create a test account
2. Upload some wallpapers, add favorites
3. Go to Profile page
4. Click "Delete Account"
5. Confirm twice
6. Account and all data should be deleted
7. Should redirect to home page

## Files Changed

### New Files:
- `src/pages/ResetPassword.tsx` - Complete password reset page
- `supabase/functions/delete-account/index.ts` - Edge function for account deletion
- `supabase/functions/delete-account/README.md` - Deployment instructions

### Modified Files:
- `src/pages/Profile.tsx` - Updated deleteAccount and changePassword functions
- `src/App.tsx` - Added /reset-password route

## Security Features

✅ Password reset requires valid email verification
✅ Account deletion requires authentication token
✅ Double confirmation prevents accidental deletion
✅ All user data is properly cleaned up
✅ Edge function uses service role key (server-side only)
✅ Cannot delete other users' accounts

## User Experience Improvements

✅ Clear loading states
✅ Informative error messages
✅ Password visibility toggles
✅ Password strength requirements (min 6 chars)
✅ Confirmation dialogs with clear warnings
✅ Toast notifications for all actions
✅ Automatic redirects after success
