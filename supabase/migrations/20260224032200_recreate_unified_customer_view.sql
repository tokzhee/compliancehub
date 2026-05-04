-- ============================================================================
-- RECREATE UNIFIED FATCA/CRS REGULATORY SCREENING VIEW
-- Created: 2026-02-24
-- Purpose: Recreate the missing vw_REGULATORY_UNIFIED_CUSTOMERS view
-- ============================================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.vw_REGULATORY_UNIFIED_CUSTOMERS CASCADE;

-- Create unified regulatory view
CREATE OR REPLACE VIEW public.vw_REGULATORY_UNIFIED_CUSTOMERS AS
SELECT
    -- ========================================================================
    -- SECTION A: CONTROL & SYSTEM FIELDS (Always Populated)
    -- ========================================================================
    o.id AS organization_id,
    bs.id AS segment_id,
    COALESCE(fd.reporting_year, fcm.reporting_year) AS reporting_year,
    COALESCE(fd.account_number, fcm.customer_id) AS customer_id,
    
    -- Derive customer_type automatically
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' THEN 'ENTITY'
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' THEN 'INDIVIDUAL'
        ELSE 'INDIVIDUAL' -- Default to individual if not specified
    END AS customer_type,
    
    -- Regime applicability (can be FATCA, CRS, or BOTH)
    COALESCE(fd.account_data->>'regime_applicability', 'BOTH') AS regime_applicability,
    
    -- Status
    CASE 
        WHEN fd.id IS NOT NULL THEN 'Active'
        WHEN fcm.case_status = 'Approved' THEN 'Active'
        ELSE 'Closed'
    END AS status,
    
    COALESCE(fd.created_at, fcm.created_at) AS created_on,
    COALESCE(fd.updated_at, fcm.updated_at) AS modified_on,
    fd.uploaded_by AS created_by,
    fcd.updated_by AS modified_by,

    -- ========================================================================
    -- SECTION B: ACCOUNT INFORMATION
    -- ========================================================================
    COALESCE(fd.account_number, fcm.account_number) AS account_number,
    fd.account_data->>'product' AS product,
    fd.account_data->>'product_code' AS product_code,
    fd.account_data->>'branch' AS branch,
    fd.account_data->>'currency_code' AS currency_code,
    COALESCE(fd.account_balance, fcm.account_balance) AS net_account_balance,
    
    -- Calculate exceed_threshold (configurable threshold - using 50000 as default)
    CASE 
        WHEN COALESCE(fd.account_balance, fcm.account_balance, 0) > 50000 THEN true
        ELSE false
    END AS exceed_threshold,
    
    COALESCE((fd.account_data->>'recalcitrant_customer')::boolean, false) AS recalcitrant_customer,
    fd.account_data->>'product_codes_monitoring' AS product_codes_monitoring,

    -- ========================================================================
    -- SECTION C: COMMON CONTACT INFORMATION
    -- ========================================================================
    fd.account_data->>'address_line_1' AS address_line_1,
    fd.account_data->>'address_line_2' AS address_line_2,
    fd.account_data->>'address_line_3' AS address_line_3,
    fd.account_data->>'city' AS city,
    fd.account_data->>'state' AS state,
    COALESCE(fd.country_code, fcm.country_code) AS country_of_residence,
    fd.account_data->>'main_phone_number' AS main_phone_number,
    fd.account_data->>'second_phone_number' AS second_phone_number,
    fd.account_data->>'email' AS email,

    -- ========================================================================
    -- SECTION D: INDIVIDUAL CUSTOMER FIELDS (Nullable for Entities)
    -- ========================================================================
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN fd.account_data->>'first_name' 
        ELSE NULL 
    END AS first_name,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN fd.account_data->>'middle_name' 
        ELSE NULL 
    END AS middle_name,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN fd.account_data->>'last_name' 
        ELSE NULL 
    END AS last_name,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN fd.account_data->>'prefix' 
        ELSE NULL 
    END AS prefix,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN fd.account_data->>'sex' 
        ELSE NULL 
    END AS sex,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN (fd.account_data->>'date_of_birth')::date 
        ELSE NULL 
    END AS date_of_birth,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN fd.account_data->>'nationality' 
        ELSE NULL 
    END AS nationality,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN fd.account_data->>'marital_status' 
        ELSE NULL 
    END AS marital_status,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN fd.account_data->>'profession' 
        ELSE NULL 
    END AS profession,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN fd.account_data->>'religion' 
        ELSE NULL 
    END AS religion,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN fd.account_data->>'dual_citizenship' 
        ELSE NULL 
    END AS dual_citizenship,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN fd.account_data->>'social_security_number' 
        ELSE NULL 
    END AS social_security_number,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN COALESCE(fd.tax_id, fd.account_data->>'tax_identification_no') 
        ELSE NULL 
    END AS tax_identification_no,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN fd.account_data->>'identification_type' 
        ELSE NULL 
    END AS identification_type,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'INDIVIDUAL' 
        THEN fd.account_data->>'identification_number' 
        ELSE NULL 
    END AS identification_number,

    -- ========================================================================
    -- SECTION E: ENTITY CUSTOMER FIELDS (Nullable for Individuals)
    -- ========================================================================
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN COALESCE(fd.account_holder_name, fcm.customer_name) 
        ELSE NULL 
    END AS entity_name,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN fd.account_data->>'registration_number' 
        ELSE NULL 
    END AS registration_number,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN fd.account_data->>'country_of_incorporation' 
        ELSE NULL 
    END AS country_of_incorporation,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN fd.account_data->>'entity_classification' 
        ELSE NULL 
    END AS entity_classification,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN fd.account_data->>'GIIN' 
        ELSE NULL 
    END AS GIIN,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN COALESCE(fd.tax_id, fd.account_data->>'tax_identification_no_entity') 
        ELSE NULL 
    END AS tax_identification_no_entity,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN (fd.account_data->>'beneficial_owner_flag')::boolean 
        ELSE NULL 
    END AS beneficial_owner_flag,

    -- ========================================================================
    -- SECTION F: DIRECTOR / SHAREHOLDER STRUCTURE (Phase 1 Flattened)
    -- All nullable for Individuals
    -- ========================================================================
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN fd.account_data->'directors'->0->>'name' 
        ELSE NULL 
    END AS director_name1,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN fd.account_data->'directors'->1->>'name' 
        ELSE NULL 
    END AS director_name2,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN fd.account_data->'directors'->2->>'name' 
        ELSE NULL 
    END AS director_name3,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN fd.account_data->'directors'->3->>'name' 
        ELSE NULL 
    END AS director_name4,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN fd.account_data->'directors'->4->>'name' 
        ELSE NULL 
    END AS director_name5,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN fd.account_data->'directors'->0->>'nationality' 
        ELSE NULL 
    END AS nationality_director1,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN fd.account_data->'directors'->1->>'nationality' 
        ELSE NULL 
    END AS nationality_director2,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN fd.account_data->'directors'->2->>'nationality' 
        ELSE NULL 
    END AS nationality_director3,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN fd.account_data->'directors'->3->>'nationality' 
        ELSE NULL 
    END AS nationality_director4,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN fd.account_data->'directors'->4->>'nationality' 
        ELSE NULL 
    END AS nationality_director5,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN (fd.account_data->'directors'->0->>'share_percentage')::numeric 
        ELSE NULL 
    END AS share_director1,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN (fd.account_data->'directors'->1->>'share_percentage')::numeric 
        ELSE NULL 
    END AS share_director2,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN (fd.account_data->'directors'->2->>'share_percentage')::numeric 
        ELSE NULL 
    END AS share_director3,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN (fd.account_data->'directors'->3->>'share_percentage')::numeric 
        ELSE NULL 
    END AS share_director4,
    
    CASE 
        WHEN fd.account_data->>'customer_type' = 'ENTITY' 
        THEN (fd.account_data->'directors'->4->>'share_percentage')::numeric 
        ELSE NULL 
    END AS share_director5,

    -- ========================================================================
    -- SECTION G: REGULATORY MESSAGE METADATA
    -- These fields assist XML generation
    -- ========================================================================
    fd.account_data->>'sending_company_in' AS sending_company_in,
    fd.account_data->>'doc_type_indic' AS doc_type_indic,
    fd.account_data->>'doc_ref_id' AS doc_ref_id,
    CURRENT_TIMESTAMP AS timestamp,
    fd.account_data->>'message_ref_id' AS message_ref_id,
    fd.account_data->>'transmitting_country' AS transmitting_country,
    fd.account_data->>'receiving_country' AS receiving_country

FROM 
    public.organizations o
    
    -- Left join to business segments (for segment-aware filtering)
    LEFT JOIN public.business_segments bs ON bs.organization_id = o.id AND bs.is_active = true
    
    -- Left join to FATCA dataset (primary source for customer data)
    LEFT JOIN public.fatca_dataset fd ON fd.organization_id = o.id
    
    -- Left join to FATCA/CRS case master (for case management data)
    LEFT JOIN (
        SELECT DISTINCT ON (fcm.customer_id, fcdb.reporting_year)
            fcm.id,
            fcm.customer_id,
            fcm.account_number,
            fcm.customer_name,
            fcm.account_balance,
            fcm.country_code,
            fcm.case_status,
            fcm.created_at,
            fcm.updated_at,
            fcdb.reporting_year
        FROM public.fatca_crs_case_master fcm
        INNER JOIN public.fatca_crs_dataset_batch fcdb ON fcdb.id = fcm.dataset_batch_id
        ORDER BY fcm.customer_id, fcdb.reporting_year, fcm.updated_at DESC
    ) fcm ON fcm.customer_id = fd.account_number
    
    -- Left join to case details (for field-level updates)
    LEFT JOIN (
        SELECT DISTINCT ON (case_id)
            case_id,
            updated_by
        FROM public.fatca_crs_case_details
        ORDER BY case_id, updated_on DESC NULLS LAST
    ) fcd ON fcd.case_id = fcm.id

WHERE 
    -- Only include records where we have either dataset or case data
    (fd.id IS NOT NULL OR fcm.id IS NOT NULL)
    
    -- Ensure organization is active
    AND o.status IN ('active', 'trial')

ORDER BY 
    o.id,
    COALESCE(fd.reporting_year, fcm.reporting_year) DESC,
    COALESCE(fd.account_number, fcm.customer_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index on fatca_dataset for view performance
CREATE INDEX IF NOT EXISTS idx_fatca_dataset_org_year 
    ON public.fatca_dataset(organization_id, reporting_year);

CREATE INDEX IF NOT EXISTS idx_fatca_dataset_account 
    ON public.fatca_dataset(account_number);

-- Index on fatca_crs_case_master for view performance
CREATE INDEX IF NOT EXISTS idx_fatca_crs_case_master_customer 
    ON public.fatca_crs_case_master(customer_id);

-- Index on fatca_crs_dataset_batch for join performance
CREATE INDEX IF NOT EXISTS idx_fatca_crs_dataset_batch_reporting_year 
    ON public.fatca_crs_dataset_batch(reporting_year);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON VIEW public.vw_REGULATORY_UNIFIED_CUSTOMERS IS 
'Unified FATCA/CRS regulatory screening view combining Individual and Entity customer data. 
Supports rule engine filtering, compliance review, snapshot dataset generation, and XML branching logic. 
One row per customer per account per reporting year. Allows nulls for non-applicable fields.';

-- ============================================================================
-- GRANT PERMISSIONS (Adjust based on your RLS policies)
-- ============================================================================

-- Grant read access to authenticated users (adjust as needed)
GRANT SELECT ON public.vw_REGULATORY_UNIFIED_CUSTOMERS TO authenticated;