-- Migration: Fix authentication by cleaning up broken user records
-- Root Cause: Direct SQL inserts into auth.users don't work with signInWithPassword
-- Solution: Remove broken users and provide instructions for proper user creation

DO $$
DECLARE
    v_broken_users TEXT[];
    v_user_email TEXT;
    v_user_id UUID;
BEGIN
    RAISE NOTICE 'Starting authentication fix migration...';

    -- Find users in auth.users that are missing auth.identities
    SELECT ARRAY_AGG(u.email) INTO v_broken_users
    FROM auth.users u
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.identities i
        WHERE i.user_id = u.id AND i.provider = 'email'
    )
    AND u.email LIKE '%@ahlibank.com';

    IF v_broken_users IS NOT NULL AND array_length(v_broken_users, 1) > 0 THEN
        RAISE NOTICE 'Found % broken user(s): %', array_length(v_broken_users, 1), v_broken_users;

        -- Clean up broken users (in correct order to respect foreign keys)
        FOR v_user_email IN SELECT unnest(v_broken_users)
        LOOP
            -- Get user ID
            SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;
            
            IF v_user_id IS NOT NULL THEN
                RAISE NOTICE 'Cleaning up broken user: % (ID: %)', v_user_email, v_user_id;
                
                -- Delete from user_profiles first (references auth.users)
                DELETE FROM public.user_profiles WHERE id = v_user_id;
                
                -- Delete from auth.identities (if any exist)
                DELETE FROM auth.identities WHERE user_id = v_user_id;
                
                -- Delete from auth.users
                DELETE FROM auth.users WHERE id = v_user_id;
                
                RAISE NOTICE 'Successfully removed broken user: %', v_user_email;
            END IF;
        END LOOP;
    ELSE
        RAISE NOTICE 'No broken users found. All users have proper identity records.';
    END IF;

    -- Verify cleanup
    DECLARE
        v_remaining_broken INTEGER;
    BEGIN
        SELECT COUNT(*) INTO v_remaining_broken
        FROM auth.users u
        WHERE NOT EXISTS (
            SELECT 1 FROM auth.identities i
            WHERE i.user_id = u.id AND i.provider = 'email'
        )
        AND u.email LIKE '%@ahlibank.com';
        
        RAISE NOTICE 'Remaining broken users after cleanup: %', v_remaining_broken;
    END;

    RAISE NOTICE '=========================================';
    RAISE NOTICE 'IMPORTANT: HOW TO CREATE TEST USERS';
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Direct SQL inserts into auth.users do NOT work with Supabase authentication.';
    RAISE NOTICE 'You must use Supabase Admin API or Dashboard to create users properly.';
    RAISE NOTICE '';
    RAISE NOTICE 'Option 1: Use Supabase Dashboard';
    RAISE NOTICE '  1. Go to Authentication > Users in Supabase Dashboard';
    RAISE NOTICE '  2. Click "Add User" button';
    RAISE NOTICE '  3. Enter email and password';
    RAISE NOTICE '  4. Enable "Auto Confirm User" option';
    RAISE NOTICE '  5. Click "Create User"';
    RAISE NOTICE '';
    RAISE NOTICE 'Option 2: Use Supabase Admin API (from backend/Edge Function)';
    RAISE NOTICE '  const { data, error } = await supabase.auth.admin.createUser({';
    RAISE NOTICE '    email: "user@ahlibank.com",';
    RAISE NOTICE '    password: "Test@123",';
    RAISE NOTICE '    email_confirm: true';
    RAISE NOTICE '  });';
    RAISE NOTICE '';
    RAISE NOTICE 'After creating users via Admin API, user_profiles will be auto-created by trigger.';
    RAISE NOTICE '=========================================';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error during authentication fix: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;