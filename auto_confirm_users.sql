-- Auto-Confirm Users on Signup
-- This script creates a database trigger that automatically confirms user emails
-- Use this if you want to bypass email confirmation without disabling it in settings

-- Create the function that auto-confirms users
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm the user by setting email_confirmed_at
  UPDATE auth.users
  SET 
    email_confirmed_at = NOW(),
    confirmation_sent_at = NOW()
  WHERE id = NEW.id
  AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires after user insertion
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();

-- Verify the trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Optional: Confirm all existing unconfirmed users
-- Uncomment the lines below if you want to confirm existing users
/*
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmation_sent_at = NOW()
WHERE email_confirmed_at IS NULL;
*/

-- Check results
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
