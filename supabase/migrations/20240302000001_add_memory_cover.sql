
-- Add cover_media_id to memories table
ALTER TABLE memories
ADD COLUMN cover_media_id uuid REFERENCES memory_media(id) ON DELETE SET NULL;
