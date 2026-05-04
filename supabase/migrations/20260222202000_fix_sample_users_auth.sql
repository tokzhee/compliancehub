-- Migration: Fix sample users authentication
-- This migration creates sample users using Supabase Auth compatible format
-- IDEMPOTENT: Safe to run multiple times

DO $$
DECLARE
    v_ahlibank_org_id UUID;
    v_compliance_officer_role_id UUID;
    v_compliance_analyst_role_id UUID;
    v_system_admin_role_id UUID;
    v_data_reviewer_role_id UUID;
    v_user_id UUID;
    v_hashed_password TEXT;
    v_existing_count INTEGER;
BEGIN
    -- Check if sample users already exist
    SELECT COUNT(*) INTO v_existing_count
    FROM auth.users
    WHERE email IN (
        'sarah.mitchell@ahlibank.com',
        'ahmed.alrashid@ahlibank.com',
        'emily.chen@ahlibank.com',
        'mohammed.hassan@ahlibank.com',
        'david.thompson@ahlibank.com',
        'fatima.almansoori@ahlibank.com',
        'jennifer.rodriguez@ahlibank.com',
        'khalid.alzaabi@ahlibank.com',
        'fatima.alarifi@ahlibank.com'
    );

    -- If users already exist, skip creation
    IF v_existing_count > 0 THEN
        RAISE NOTICE 'Sample users already exist (found % users). Skipping creation to maintain idempotency.', v_existing_count;
        RETURN;
    END IF;

    RAISE NOTICE 'No existing sample users found. Proceeding with creation...';

    -- Get organization and role IDs
    SELECT id INTO v_ahlibank_org_id FROM public.organizations WHERE name = 'Ahlibank' LIMIT 1;
    IF v_ahlibank_org_id IS NULL THEN RAISE EXCEPTION 'Ahlibank organization not found'; END IF;

    SELECT id INTO v_compliance_officer_role_id FROM public.roles WHERE role_name = 'Compliance Officer' AND organization_id = v_ahlibank_org_id LIMIT 1;
    SELECT id INTO v_compliance_analyst_role_id FROM public.roles WHERE role_name = 'Compliance Analyst' AND organization_id = v_ahlibank_org_id LIMIT 1;
    SELECT id INTO v_system_admin_role_id FROM public.roles WHERE role_name = 'System Administrator' AND organization_id = v_ahlibank_org_id LIMIT 1;
    SELECT id INTO v_data_reviewer_role_id FROM public.roles WHERE role_name = 'Data Reviewer' AND organization_id = v_ahlibank_org_id LIMIT 1;

    v_hashed_password := crypt('password123', gen_salt('bf'));

    RAISE NOTICE 'Creating sample users...';

    -- User 1: Fatima Al-Arifi
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, phone_change, phone_change_token, email_change_token_current, email_change_confirm_status, reauthentication_token, is_sso_user) 
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'fatima.alarifi@ahlibank.com', v_hashed_password, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fatima Al-Arifi"}', NOW(), NOW(), '', '', '', '', '', '', '', 0, '', FALSE);
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) 
    VALUES (gen_random_uuid(), v_user_id, format('{"sub":"%s","email":"fatima.alarifi@ahlibank.com"}', v_user_id)::jsonb, 'email', v_user_id, NOW(), NOW(), NOW());
    INSERT INTO public.user_profiles (id, full_name, email, organization_id, role_id, authentication_source, status, created_at, updated_at) 
    VALUES (v_user_id, 'Fatima Al-Arifi', 'fatima.alarifi@ahlibank.com', v_ahlibank_org_id, v_compliance_officer_role_id, 'local_db', 'active', NOW(), NOW());

    -- User 2: Ahmed Al-Rashid
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, phone_change, phone_change_token, email_change_token_current, email_change_confirm_status, reauthentication_token, is_sso_user) 
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'ahmed.alrashid@ahlibank.com', v_hashed_password, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ahmed Al-Rashid"}', NOW(), NOW(), '', '', '', '', '', '', '', 0, '', FALSE);
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) 
    VALUES (gen_random_uuid(), v_user_id, format('{"sub":"%s","email":"ahmed.alrashid@ahlibank.com"}', v_user_id)::jsonb, 'email', v_user_id, NOW(), NOW(), NOW());
    INSERT INTO public.user_profiles (id, full_name, email, organization_id, role_id, authentication_source, status, created_at, updated_at) 
    VALUES (v_user_id, 'Ahmed Al-Rashid', 'ahmed.alrashid@ahlibank.com', v_ahlibank_org_id, v_compliance_officer_role_id, 'local_db', 'active', NOW(), NOW());

    -- User 3: Emily Chen
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, phone_change, phone_change_token, email_change_token_current, email_change_confirm_status, reauthentication_token, is_sso_user) 
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'emily.chen@ahlibank.com', v_hashed_password, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Emily Chen"}', NOW(), NOW(), '', '', '', '', '', '', '', 0, '', FALSE);
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) 
    VALUES (gen_random_uuid(), v_user_id, format('{"sub":"%s","email":"emily.chen@ahlibank.com"}', v_user_id)::jsonb, 'email', v_user_id, NOW(), NOW(), NOW());
    INSERT INTO public.user_profiles (id, full_name, email, organization_id, role_id, authentication_source, status, created_at, updated_at) 
    VALUES (v_user_id, 'Emily Chen', 'emily.chen@ahlibank.com', v_ahlibank_org_id, v_compliance_analyst_role_id, 'local_db', 'active', NOW(), NOW());

    -- User 4: Mohammed Hassan
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, phone_change, phone_change_token, email_change_token_current, email_change_confirm_status, reauthentication_token, is_sso_user) 
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'mohammed.hassan@ahlibank.com', v_hashed_password, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mohammed Hassan"}', NOW(), NOW(), '', '', '', '', '', '', '', 0, '', FALSE);
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) 
    VALUES (gen_random_uuid(), v_user_id, format('{"sub":"%s","email":"mohammed.hassan@ahlibank.com"}', v_user_id)::jsonb, 'email', v_user_id, NOW(), NOW(), NOW());
    INSERT INTO public.user_profiles (id, full_name, email, organization_id, role_id, authentication_source, status, created_at, updated_at) 
    VALUES (v_user_id, 'Mohammed Hassan', 'mohammed.hassan@ahlibank.com', v_ahlibank_org_id, v_compliance_analyst_role_id, 'local_db', 'active', NOW(), NOW());

    -- User 5: David Thompson
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, phone_change, phone_change_token, email_change_token_current, email_change_confirm_status, reauthentication_token, is_sso_user) 
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'david.thompson@ahlibank.com', v_hashed_password, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"David Thompson"}', NOW(), NOW(), '', '', '', '', '', '', '', 0, '', FALSE);
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) 
    VALUES (gen_random_uuid(), v_user_id, format('{"sub":"%s","email":"david.thompson@ahlibank.com"}', v_user_id)::jsonb, 'email', v_user_id, NOW(), NOW(), NOW());
    INSERT INTO public.user_profiles (id, full_name, email, organization_id, role_id, authentication_source, status, created_at, updated_at) 
    VALUES (v_user_id, 'David Thompson', 'david.thompson@ahlibank.com', v_ahlibank_org_id, v_system_admin_role_id, 'local_db', 'active', NOW(), NOW());

    -- User 6: Fatima Al-Mansoori
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, phone_change, phone_change_token, email_change_token_current, email_change_confirm_status, reauthentication_token, is_sso_user) 
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'fatima.almansoori@ahlibank.com', v_hashed_password, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fatima Al-Mansoori"}', NOW(), NOW(), '', '', '', '', '', '', '', 0, '', FALSE);
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) 
    VALUES (gen_random_uuid(), v_user_id, format('{"sub":"%s","email":"fatima.almansoori@ahlibank.com"}', v_user_id)::jsonb, 'email', v_user_id, NOW(), NOW(), NOW());
    INSERT INTO public.user_profiles (id, full_name, email, organization_id, role_id, authentication_source, status, created_at, updated_at) 
    VALUES (v_user_id, 'Fatima Al-Mansoori', 'fatima.almansoori@ahlibank.com', v_ahlibank_org_id, v_system_admin_role_id, 'local_db', 'active', NOW(), NOW());

    -- User 7: Jennifer Rodriguez
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, phone_change, phone_change_token, email_change_token_current, email_change_confirm_status, reauthentication_token, is_sso_user) 
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'jennifer.rodriguez@ahlibank.com', v_hashed_password, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jennifer Rodriguez"}', NOW(), NOW(), '', '', '', '', '', '', '', 0, '', FALSE);
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) 
    VALUES (gen_random_uuid(), v_user_id, format('{"sub":"%s","email":"jennifer.rodriguez@ahlibank.com"}', v_user_id)::jsonb, 'email', v_user_id, NOW(), NOW(), NOW());
    INSERT INTO public.user_profiles (id, full_name, email, organization_id, role_id, authentication_source, status, created_at, updated_at) 
    VALUES (v_user_id, 'Jennifer Rodriguez', 'jennifer.rodriguez@ahlibank.com', v_ahlibank_org_id, v_data_reviewer_role_id, 'local_db', 'active', NOW(), NOW());

    -- User 8: Khalid Al-Zaabi
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, phone_change, phone_change_token, email_change_token_current, email_change_confirm_status, reauthentication_token, is_sso_user) 
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'khalid.alzaabi@ahlibank.com', v_hashed_password, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Khalid Al-Zaabi"}', NOW(), NOW(), '', '', '', '', '', '', '', 0, '', FALSE);
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) 
    VALUES (gen_random_uuid(), v_user_id, format('{"sub":"%s","email":"khalid.alzaabi@ahlibank.com"}', v_user_id)::jsonb, 'email', v_user_id, NOW(), NOW(), NOW());
    INSERT INTO public.user_profiles (id, full_name, email, organization_id, role_id, authentication_source, status, created_at, updated_at) 
    VALUES (v_user_id, 'Khalid Al-Zaabi', 'khalid.alzaabi@ahlibank.com', v_ahlibank_org_id, v_data_reviewer_role_id, 'local_db', 'active', NOW(), NOW());

    RAISE NOTICE 'Successfully created 8 sample users';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error in sample users migration: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;