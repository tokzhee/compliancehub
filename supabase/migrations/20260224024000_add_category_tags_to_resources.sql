-- Add category and tags columns to resources_content table
ALTER TABLE public.resources_content
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add check constraint for predefined category values
ALTER TABLE public.resources_content
ADD CONSTRAINT resources_content_category_check 
CHECK (category IS NULL OR category IN (
  'FATCA',
  'CRS',
  'Portal Usage',
  'Templates',
  'FAQ',
  'Compliance',
  'Regulatory Timeline',
  'General'
));

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_resources_content_category ON public.resources_content(category);

-- Create GIN index for tags array filtering
CREATE INDEX IF NOT EXISTS idx_resources_content_tags ON public.resources_content USING GIN(tags);

-- Update existing resources with appropriate categories based on section_id
UPDATE public.resources_content
SET category = CASE
  WHEN section_id LIKE '%fatca%' THEN 'FATCA'
  WHEN section_id LIKE '%crs%' THEN 'CRS'
  WHEN section_id LIKE '%portal%' OR section_id LIKE '%guide%' THEN 'Portal Usage'
  WHEN section_id LIKE '%faq%' THEN 'FAQ'
  WHEN section_id LIKE '%template%' THEN 'Templates'
  WHEN section_id LIKE '%compliance%' THEN 'Compliance'
  WHEN section_id LIKE '%timeline%' THEN 'Regulatory Timeline'
  ELSE 'General'
END
WHERE category IS NULL;

-- Add sample tags to existing resources
UPDATE public.resources_content
SET tags = CASE
  WHEN section_id LIKE '%fatca%' THEN ARRAY['FATCA', 'US Reporting', 'Tax Compliance']
  WHEN section_id LIKE '%crs%' THEN ARRAY['CRS', 'OECD', 'International Reporting']
  WHEN section_id LIKE '%portal%' THEN ARRAY['User Guide', 'Tutorial', 'Getting Started']
  WHEN section_id LIKE '%faq%' THEN ARRAY['FAQ', 'Help', 'Support']
  ELSE ARRAY['General']
END
WHERE tags = '{}';

-- Update resources_content_history table to include category and tags
ALTER TABLE public.resources_content_history
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.resources_content.category IS 'Resource category for filtering and organization';
COMMENT ON COLUMN public.resources_content.tags IS 'Array of topic tags for multi-dimensional filtering';