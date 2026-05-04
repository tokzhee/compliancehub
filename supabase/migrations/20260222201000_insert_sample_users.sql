-- Migration: Insert sample users for RBAC demonstration
-- Creates 2 users per role (Compliance Officer, Compliance Analyst, System Administrator, Data Reviewer)
-- All users assigned to Ahlibank organization with Local DB authentication

DO $$
DECLARE
    v_ahlibank_org_id UUID;
    v_compliance_officer_role_id UUID;
    v_compliance_analyst_role_id UUID;
    v_system_admin_role_id UUID;
    v_data_reviewer_role_id UUID;
    v_user_id UUID;
BEGIN
    -- Get Ahlibank organization ID
    SELECT id INTO v_ahlibank_org_id
    FROM public.organizations
    WHERE name = 'Ahlibank'
    LIMIT 1;

    -- Get role IDs
    SELECT id INTO v_compliance_officer_role_id
    FROM public.roles
    WHERE role_name = 'Compliance Officer'
    LIMIT 1;

    SELECT id INTO v_compliance_analyst_role_id
    FROM public.roles
    WHERE role_name = 'Compliance Analyst'
    LIMIT 1;

    SELECT id INTO v_system_admin_role_id
    FROM public.roles
    WHERE role_name = 'System Administrator'
    LIMIT 1;

    SELECT id INTO v_data_reviewer_role_id
    FROM public.roles
    WHERE role_name = 'Data Reviewer'
    LIMIT 1;

    -- Insert Compliance Officers (2 users)
    -- User 1: Sarah Mitchell
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (v_user_id, 'sarah.mitchell@ahlibank.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.user_profiles (
        id,
        full_name,
        email,
        organization_id,
        role_id,
        authentication_source,
        status,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'Sarah Mitchell',
        'sarah.mitchell@ahlibank.com',
        v_ahlibank_org_id,
        v_compliance_officer_role_id,
        'local_db',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- User 2: Ahmed Al-Rashid
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (v_user_id, 'ahmed.alrashid@ahlibank.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.user_profiles (
        id,
        full_name,
        email,
        organization_id,
        role_id,
        authentication_source,
        status,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'Ahmed Al-Rashid',
        'ahmed.alrashid@ahlibank.com',
        v_ahlibank_org_id,
        v_compliance_officer_role_id,
        'local_db',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert Compliance Analysts (2 users)
    -- User 3: Emily Chen
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (v_user_id, 'emily.chen@ahlibank.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.user_profiles (
        id,
        full_name,
        email,
        organization_id,
        role_id,
        authentication_source,
        status,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'Emily Chen',
        'emily.chen@ahlibank.com',
        v_ahlibank_org_id,
        v_compliance_analyst_role_id,
        'local_db',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- User 4: Mohammed Hassan
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (v_user_id, 'mohammed.hassan@ahlibank.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.user_profiles (
        id,
        full_name,
        email,
        organization_id,
        role_id,
        authentication_source,
        status,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'Mohammed Hassan',
        'mohammed.hassan@ahlibank.com',
        v_ahlibank_org_id,
        v_compliance_analyst_role_id,
        'local_db',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert System Administrators (2 users)
    -- User 5: David Thompson
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (v_user_id, 'david.thompson@ahlibank.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.user_profiles (
        id,
        full_name,
        email,
        organization_id,
        role_id,
        authentication_source,
        status,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'David Thompson',
        'david.thompson@ahlibank.com',
        v_ahlibank_org_id,
        v_system_admin_role_id,
        'local_db',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- User 6: Fatima Al-Mansoori
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (v_user_id, 'fatima.almansoori@ahlibank.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.user_profiles (
        id,
        full_name,
        email,
        organization_id,
        role_id,
        authentication_source,
        status,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'Fatima Al-Mansoori',
        'fatima.almansoori@ahlibank.com',
        v_ahlibank_org_id,
        v_system_admin_role_id,
        'local_db',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert Data Reviewers (2 users)
    -- User 7: Jennifer Rodriguez
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (v_user_id, 'jennifer.rodriguez@ahlibank.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.user_profiles (
        id,
        full_name,
        email,
        organization_id,
        role_id,
        authentication_source,
        status,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'Jennifer Rodriguez',
        'jennifer.rodriguez@ahlibank.com',
        v_ahlibank_org_id,
        v_data_reviewer_role_id,
        'local_db',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- User 8: Khalid Al-Zaabi
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (v_user_id, 'khalid.alzaabi@ahlibank.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.user_profiles (
        id,
        full_name,
        email,
        organization_id,
        role_id,
        authentication_source,
        status,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'Khalid Al-Zaabi',
        'khalid.alzaabi@ahlibank.com',
        v_ahlibank_org_id,
        v_data_reviewer_role_id,
        'local_db',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Successfully inserted 8 sample users (2 per role) for Ahlibank';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error inserting sample users: %', SQLERRM;
END $$;

-- Log activity for sample user creation
INSERT INTO public.user_activity_log (
    organization_id,
    user_id,
    action,
    module,
    ip_address,
    created_at
)
SELECT
    up.organization_id,
    up.id,
    'User Created',
    'User Management',
    '127.0.0.1',
    NOW()
FROM public.user_profiles up
WHERE up.email IN (
    'sarah.mitchell@ahlibank.com',
    'ahmed.alrashid@ahlibank.com',
    'emily.chen@ahlibank.com',
    'mohammed.hassan@ahlibank.com',
    'david.thompson@ahlibank.com',
    'fatima.almansoori@ahlibank.com',
    'jennifer.rodriguez@ahlibank.com',
    'khalid.alzaabi@ahlibank.com'
);

-- Display summary of created users
DO $$
DECLARE
    user_summary RECORD;
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'SAMPLE USERS CREATED FOR AHLIBANK';
    RAISE NOTICE '=========================================';
    
    FOR user_summary IN
        SELECT 
            up.full_name,
            up.email,
            r.role_name,
            up.authentication_source,
            up.status
        FROM public.user_profiles up
        JOIN public.roles r ON up.role_id = r.id
        WHERE up.email IN (
            'sarah.mitchell@ahlibank.com',
            'ahmed.alrashid@ahlibank.com',
            'emily.chen@ahlibank.com',
            'mohammed.hassan@ahlibank.com',
            'david.thompson@ahlibank.com',
            'fatima.almansoori@ahlibank.com',
            'jennifer.rodriguez@ahlibank.com',
            'khalid.alzaabi@ahlibank.com'
        )
        ORDER BY r.role_name, up.full_name
    LOOP
        RAISE NOTICE 'Name: % | Email: % | Role: % | Auth: % | Status: %',
            user_summary.full_name,
            user_summary.email,
            user_summary.role_name,
            user_summary.authentication_source,
            user_summary.status;
    END LOOP;
    
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Default password for all users: password123';
    RAISE NOTICE '=========================================';
END $$;