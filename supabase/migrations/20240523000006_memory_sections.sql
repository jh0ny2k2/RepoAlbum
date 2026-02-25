-- Create memory_sections table
CREATE TABLE memory_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add section_id to memory_media
ALTER TABLE memory_media
ADD COLUMN section_id UUID REFERENCES memory_sections(id) ON DELETE SET NULL;

-- Enable RLS on memory_sections
ALTER TABLE memory_sections ENABLE ROW LEVEL SECURITY;

-- Policies for memory_sections

-- View sections: Users can view sections if they can view the memory
CREATE POLICY "Users can view sections of visible memories"
ON memory_sections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memories m
    WHERE m.id = memory_sections.memory_id
    AND (
      m.visibility = 'public' 
      OR (m.visibility = 'unlisted' AND m.share_token IS NOT NULL)
      OR m.user_id = auth.uid()
      -- Add circle logic later if needed
    )
  )
);

-- Create sections: Only the memory owner can create sections
CREATE POLICY "Users can create sections in their own memories"
ON memory_sections FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memories m
    WHERE m.id = memory_sections.memory_id
    AND m.user_id = auth.uid()
  )
);

-- Delete sections: Only the memory owner can delete sections
CREATE POLICY "Users can delete sections in their own memories"
ON memory_sections FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM memories m
    WHERE m.id = memory_sections.memory_id
    AND m.user_id = auth.uid()
  )
);

-- Public access policies (for shared links)
CREATE POLICY "Public can view sections via token"
ON memory_sections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public_share_tokens t
    WHERE t.memory_id = memory_sections.memory_id
    AND (t.expires_at IS NULL OR t.expires_at > now())
  )
);
