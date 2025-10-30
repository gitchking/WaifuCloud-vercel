# Delete Account Edge Function

This edge function handles secure account deletion with proper cleanup of all user data.

## What it does

1. Verifies the user's authentication token
2. Deletes all user's wallpapers
3. Deletes all user's favorites
4. Deletes user's profile
5. Deletes user's avatar from storage
6. Finally deletes the user from auth

## Deployment

### Using Supabase CLI

```bash
# Deploy the function
supabase functions deploy delete-account

# Set required secrets (if not already set)
supabase secrets set SUPABASE_URL=your-project-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
```

### Using Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/jhusavzdsewoiwhvoczz/functions
2. Click "Create a new function"
3. Name it `delete-account`
4. Copy the contents of `index.ts` into the editor
5. Click "Deploy"

## Testing

```bash
# Get your access token from the browser console after logging in
# Then test the function:

curl -X POST \
  https://jhusavzdsewoiwhvoczz.supabase.co/functions/v1/delete-account \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

## Security

- Requires valid user authentication token
- Uses service role key for admin operations (server-side only)
- Validates user identity before deletion
- Cannot be called without proper authentication
