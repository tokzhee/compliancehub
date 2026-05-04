-- Migration: Fix missing auth.identities for existing sample users
-- This migration adds auth.identities entries for users that exist in auth.users but are missing identities
-- Root cause: Previous migration had early-return that prevented identities creation

DO $$
DECLARE
    v_user_record RECORD;
    v_identity_count INTEGER;
BEGIN
    RAISE NOTICE 'Checking for users missing auth.identities entries...';

    -- Find all sample users that exist in auth.users but missing in auth.identities
    FOR v_user_record IN
        SELECT u.id, u.email
        FROM auth.users u
        WHERE u.email IN (
            'fatima.alarifi@ahlibank.com',
            'ahmed.alrashid@ahlibank.com',
            'emily.chen@ahlibank.com',
            'mohammed.hassan@ahlibank.com',
            'david.thompson@ahlibank.com',
            'fatima.almansoori@ahlibank.com',
            'jennifer.rodriguez@ahlibank.com',
            'khalid.alzaabi@ahlibank.com'
        )
        AND NOT EXISTS (
            SELECT 1 FROM auth.identities i
            WHERE i.user_id = u.id AND i.provider = 'email'
        )
    LOOP
        RAISE NOTICE 'Creating missing identity for user: % (ID: %)', v_user_record.email, v_user_record.id;
        
        -- Insert missing identity
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        )
        VALUES (
            gen_random_uuid(),
            v_user_record.id,
            format('{"sub":"%s","email":"%s"}', v_user_record.id, v_user_record.email)::jsonb,
            'email',
            v_user_record.id,
            NOW(),
            NOW(),
            NOW()
        );
    END LOOP;

    -- Verify fix
    SELECT COUNT(*) INTO v_identity_count
    FROM auth.identities i
    INNER JOIN auth.users u ON i.user_id = u.id
    WHERE u.email IN (
        'fatima.alarifi@ahlibank.com',
        'ahmed.alrashid@ahlibank.com',
        'emily.chen@ahlibank.com',
        'mohammed.hassan@ahlibank.com',
        'david.thompson@ahlibank.com',
        'fatima.almansoori@ahlibank.com',
        'jennifer.rodriguez@ahlibank.com',
        'khalid.alzaabi@ahlibank.com'
    );

    RAISE NOTICE 'Migration complete. Total identities for sample users: %', v_identity_count;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error fixing missing identities: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;