-- Enable RLS on memory_media (already enabled, but good practice to ensure)
ALTER TABLE memory_media ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert media to their own memories
DROP POLICY IF EXISTS "Users can insert media to their own memories" ON memory_media;
CREATE POLICY "Users can insert media to their own memories"
ON memory_media
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = memory_media.memory_id
    AND memories.user_id = auth.uid()
  )
);

-- Policy: Users can delete media from their own memories
DROP POLICY IF EXISTS "Users can delete media from their own memories" ON memory_media;
CREATE POLICY "Users can delete media from their own memories"
ON memory_media
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = memory_media.memory_id
    AND memories.user_id = auth.uid()
  )
);

-- Policy: Users can update media in their own memories (e.g. moving sections)
DROP POLICY IF EXISTS "Users can update media in their own memories" ON memory_media;
CREATE POLICY "Users can update media in their own memories"
ON memory_media
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = memory_media.memory_id
    AND memories.user_id = auth.uid()
  )
);

-- Policy: View media (Owners + Shared + Public)
-- Note: This might overlap with existing read policies, but let's ensure coverage.
-- We'll check if a read policy exists first or just create a comprehensive one.
-- Actually, let's keep it simple and just fix the INSERT/DELETE/UPDATE for now as that's the blocker.
