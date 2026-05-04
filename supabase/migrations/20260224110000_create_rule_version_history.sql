-- Create fatca_crs_rule_version_history table for comprehensive rule change tracking
CREATE TABLE IF NOT EXISTS public.fatca_crs_rule_version_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES public.fatca_crs_rule_sets(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    modified_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by_user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    changes JSONB NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'approved', 'rejected', 'submitted')),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_rule_version_history_rule_id ON public.fatca_crs_rule_version_history(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_version_history_organization_id ON public.fatca_crs_rule_version_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_rule_version_history_changed_by ON public.fatca_crs_rule_version_history(changed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_rule_version_history_change_type ON public.fatca_crs_rule_version_history(change_type);
CREATE INDEX IF NOT EXISTS idx_rule_version_history_modified_date ON public.fatca_crs_rule_version_history(modified_date DESC);

-- Enable RLS
ALTER TABLE public.fatca_crs_rule_version_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view version history for rules in their organization
DROP POLICY IF EXISTS "users_view_rule_version_history" ON public.fatca_crs_rule_version_history;
CREATE POLICY "users_view_rule_version_history"
ON public.fatca_crs_rule_version_history
FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Function to capture rule changes and create version history
CREATE OR REPLACE FUNCTION public.track_rule_version_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_changes JSONB := '{}'::jsonb;
    v_old_values JSONB := '{}'::jsonb;
    v_new_values JSONB := '{}'::jsonb;
    v_change_type TEXT;
    v_version_number INTEGER;
    v_changed_by_user_id UUID;
BEGIN
    -- Determine change type and user
    IF TG_OP = 'INSERT' THEN
        v_change_type := 'created';
        v_changed_by_user_id := NEW.created_by_user_id;
        
        -- For creation, capture all initial values
        v_new_values := jsonb_build_object(
            'rule_name', NEW.rule_name,
            'rule_type', NEW.regime_type::TEXT,
            'regime', NEW.regime_type::TEXT,
            'segment_id', NEW.segment_id,
            'description', NEW.description,
            'effective_date', NEW.created_on,
            'expiry_date', NULL,
            'approval_status', NEW.approval_status
        );
        
        v_changes := jsonb_build_object(
            'old_values', '{}'::jsonb,
            'new_values', v_new_values
        );
        
        v_version_number := 1;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Determine specific change type based on status changes
        IF OLD.approval_status != NEW.approval_status THEN
            IF NEW.approval_status = 'pending_approval' THEN
                v_change_type := 'submitted';
            ELSIF NEW.approval_status = 'approved' THEN
                v_change_type := 'approved';
            ELSIF NEW.approval_status = 'rejected' THEN
                v_change_type := 'rejected';
            ELSE
                v_change_type := 'updated';
            END IF;
        ELSE
            v_change_type := 'updated';
        END IF;
        
        -- Determine who made the change
        IF NEW.approved_by_user_id IS NOT NULL AND OLD.approved_by_user_id IS DISTINCT FROM NEW.approved_by_user_id THEN
            v_changed_by_user_id := NEW.approved_by_user_id;
        ELSE
            v_changed_by_user_id := COALESCE(NEW.created_by_user_id, OLD.created_by_user_id);
        END IF;
        
        -- Capture changed fields
        IF OLD.rule_name IS DISTINCT FROM NEW.rule_name THEN
            v_old_values := v_old_values || jsonb_build_object('rule_name', OLD.rule_name);
            v_new_values := v_new_values || jsonb_build_object('rule_name', NEW.rule_name);
        END IF;
        
        IF OLD.regime_type IS DISTINCT FROM NEW.regime_type THEN
            v_old_values := v_old_values || jsonb_build_object('regime', OLD.regime_type::TEXT);
            v_new_values := v_new_values || jsonb_build_object('regime', NEW.regime_type::TEXT);
        END IF;
        
        IF OLD.segment_id IS DISTINCT FROM NEW.segment_id THEN
            v_old_values := v_old_values || jsonb_build_object('segment_id', OLD.segment_id);
            v_new_values := v_new_values || jsonb_build_object('segment_id', NEW.segment_id);
        END IF;
        
        IF OLD.description IS DISTINCT FROM NEW.description THEN
            v_old_values := v_old_values || jsonb_build_object('description', OLD.description);
            v_new_values := v_new_values || jsonb_build_object('description', NEW.description);
        END IF;
        
        IF OLD.approval_status IS DISTINCT FROM NEW.approval_status THEN
            v_old_values := v_old_values || jsonb_build_object('approval_status', OLD.approval_status);
            v_new_values := v_new_values || jsonb_build_object('approval_status', NEW.approval_status);
        END IF;
        
        IF OLD.created_on IS DISTINCT FROM NEW.created_on THEN
            v_old_values := v_old_values || jsonb_build_object('effective_date', OLD.created_on);
            v_new_values := v_new_values || jsonb_build_object('effective_date', NEW.created_on);
        END IF;
        
        -- Get next version number
        SELECT COALESCE(MAX(version_number), 0) + 1
        INTO v_version_number
        FROM public.fatca_crs_rule_version_history
        WHERE rule_id = NEW.id;
        
        v_changes := jsonb_build_object(
            'old_values', v_old_values,
            'new_values', v_new_values
        );
    END IF;
    
    -- Insert version history record
    INSERT INTO public.fatca_crs_rule_version_history (
        rule_id,
        version_number,
        modified_date,
        changed_by_user_id,
        changes,
        change_type,
        organization_id
    ) VALUES (
        NEW.id,
        v_version_number,
        CURRENT_TIMESTAMP,
        v_changed_by_user_id,
        v_changes,
        v_change_type,
        NEW.organization_id
    );
    
    RETURN NEW;
END;
$$;

-- Create trigger for automatic version tracking
DROP TRIGGER IF EXISTS trigger_track_rule_version_history ON public.fatca_crs_rule_sets;
CREATE TRIGGER trigger_track_rule_version_history
AFTER INSERT OR UPDATE ON public.fatca_crs_rule_sets
FOR EACH ROW
EXECUTE FUNCTION public.track_rule_version_history();

-- Create function to track condition changes separately
CREATE OR REPLACE FUNCTION public.track_rule_condition_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rule_record RECORD;
    v_version_number INTEGER;
    v_changes JSONB;
    v_old_conditions JSONB;
    v_new_conditions JSONB;
BEGIN
    -- Get rule information
    SELECT * INTO v_rule_record
    FROM public.fatca_crs_rule_sets
    WHERE id = COALESCE(NEW.rule_set_id, OLD.rule_set_id)
    LIMIT 1;
    
    IF v_rule_record IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO v_version_number
    FROM public.fatca_crs_rule_version_history
    WHERE rule_id = v_rule_record.id;
    
    -- Build condition change record
    IF TG_OP = 'INSERT' THEN
        v_new_conditions := jsonb_build_object(
            'field_name', NEW.field_name,
            'operator', NEW.operator,
            'value', NEW.value,
            'sequence_order', NEW.sequence_order
        );
        
        v_changes := jsonb_build_object(
            'old_values', jsonb_build_object('conditions', '[]'::jsonb),
            'new_values', jsonb_build_object('conditions', jsonb_build_array(v_new_conditions))
        );
        
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_conditions := jsonb_build_object(
            'field_name', OLD.field_name,
            'operator', OLD.operator,
            'value', OLD.value,
            'sequence_order', OLD.sequence_order
        );
        
        v_new_conditions := jsonb_build_object(
            'field_name', NEW.field_name,
            'operator', NEW.operator,
            'value', NEW.value,
            'sequence_order', NEW.sequence_order
        );
        
        v_changes := jsonb_build_object(
            'old_values', jsonb_build_object('conditions', jsonb_build_array(v_old_conditions)),
            'new_values', jsonb_build_object('conditions', jsonb_build_array(v_new_conditions))
        );
        
    ELSIF TG_OP = 'DELETE' THEN
        v_old_conditions := jsonb_build_object(
            'field_name', OLD.field_name,
            'operator', OLD.operator,
            'value', OLD.value,
            'sequence_order', OLD.sequence_order
        );
        
        v_changes := jsonb_build_object(
            'old_values', jsonb_build_object('conditions', jsonb_build_array(v_old_conditions)),
            'new_values', jsonb_build_object('conditions', '[]'::jsonb)
        );
    END IF;
    
    -- Insert version history for condition change
    INSERT INTO public.fatca_crs_rule_version_history (
        rule_id,
        version_number,
        modified_date,
        changed_by_user_id,
        changes,
        change_type,
        organization_id
    ) VALUES (
        v_rule_record.id,
        v_version_number,
        CURRENT_TIMESTAMP,
        v_rule_record.created_by_user_id,
        v_changes,
        'updated',
        v_rule_record.organization_id
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for condition changes
DROP TRIGGER IF EXISTS trigger_track_rule_condition_changes ON public.fatca_crs_rule_conditions;
CREATE TRIGGER trigger_track_rule_condition_changes
AFTER INSERT OR UPDATE OR DELETE ON public.fatca_crs_rule_conditions
FOR EACH ROW
EXECUTE FUNCTION public.track_rule_condition_changes();