# Fix for "area_code column missing" Error

## Problem
When updating the admin profile, you receive an error:
```
Could not find the area_code column of profiles in the schema cache
```

## Solution

### Option 1: Run the SQL Script Directly (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and run this SQL:

```sql
-- Add the missing columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pen_name TEXT,
ADD COLUMN IF NOT EXISTS area_code TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS county TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('pen_name', 'area_code', 'zip_code', 'city', 'county', 'state')
ORDER BY column_name;
```

### Option 2: Run the Migration
The migration file `supabase/migrations/20250126_ensure_profile_location_fields.sql` has been created to add these columns. If you're using Supabase CLI, you can run:

```bash
supabase db push
```

## What Was Fixed
1. Created a new migration to ensure all location fields exist in the profiles table
2. Updated the TypeScript types in `src/integrations/supabase/types.ts` to include the missing fields
3. The Profile component already had the correct interface, so no changes were needed there

## Verification
After running the SQL, you should see all 6 columns listed:
- area_code
- city
- county
- pen_name
- state
- zip_code

The profile update functionality should now work without errors.