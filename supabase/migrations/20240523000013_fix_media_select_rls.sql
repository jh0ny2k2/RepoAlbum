-- Policy: Users can view media of visible memories
-- This allows owners to see their media, and others to see media of public/shared memories.
DROP POLICY IF EXISTS "Users can view media of visible memories" ON memory_media;

CREATE POLICY "Users can view media of visible memories"
ON memory_media
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = memory_media.memory_id
    AND (
      -- Owner can always view
      memories.user_id = auth.uid() 
      -- Public memories are visible
      OR memories.visibility = 'public' 
      -- Memories shared via link are visible (if the application context handles the token, 
      -- but for direct RLS, we often need a bypass or the user to be anon/authenticated correctly.
      -- For now, let's include 'public_link' status as readable by anyone authenticated or anon 
      -- if we want to support public views without tokens in the strictest sense, 
      -- but usually token access is handled by the application logic or a specific function.
      -- However, for the owner dashboard, the first condition is key.)
      OR memories.status = 'public_link'
    )
  )
);
