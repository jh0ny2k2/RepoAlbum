-- Enable RLS on memory_sections
ALTER TABLE memory_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert sections to their own memories
DROP POLICY IF EXISTS "Users can insert sections to their own memories" ON memory_sections;
CREATE POLICY "Users can insert sections to their own memories"
ON memory_sections
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = memory_sections.memory_id
    AND memories.user_id = auth.uid()
  )
);

-- Policy: Users can delete sections from their own memories
DROP POLICY IF EXISTS "Users can delete sections from their own memories" ON memory_sections;
CREATE POLICY "Users can delete sections from their own memories"
ON memory_sections
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = memory_sections.memory_id
    AND memories.user_id = auth.uid()
  )
);

-- Policy: Users can update sections in their own memories
DROP POLICY IF EXISTS "Users can update sections in their own memories" ON memory_sections;
CREATE POLICY "Users can update sections in their own memories"
ON memory_sections
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = memory_sections.memory_id
    AND memories.user_id = auth.uid()
  )
);

-- Read policy (Owners + Shared contexts if applicable, usually handled by join logic but let's be explicit for simple selects)
DROP POLICY IF EXISTS "Users can view sections of visible memories" ON memory_sections;
CREATE POLICY "Users can view sections of visible memories"
ON memory_sections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = memory_sections.memory_id
    AND (
      memories.user_id = auth.uid() 
      OR memories.visibility = 'public' 
      OR memories.status = 'public_link'
      -- Add other visibility checks here if needed
    )
  )
);
