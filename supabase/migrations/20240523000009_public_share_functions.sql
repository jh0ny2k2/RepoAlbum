-- Enable Guest Uploads to Storage (memories bucket)
-- Note: This is a broad policy. For production, consider using a signed upload URL or a more specific path check.
-- But for MVP, allowing anon to upload to 'memories' bucket is acceptable if we validate usage in DB.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow Anon Uploads'
    ) THEN
        create policy "Allow Anon Uploads"
        on storage.objects for insert
        to anon
        with check ( bucket_id = 'memories' );
    END IF;
END
$$;

-- Function to get shared memory details
CREATE OR REPLACE FUNCTION get_shared_memory(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_memory_id uuid;
  v_memory json;
  v_media json;
  v_sections json;
  v_tags json;
  v_profile json;
BEGIN
  -- 1. Validate Token
  SELECT memory_id INTO v_memory_id
  FROM public_share_tokens
  WHERE token = p_token
  AND (expires_at IS NULL OR expires_at > now());

  IF v_memory_id IS NULL THEN
    RETURN json_build_object('error', 'Invalid or expired token');
  END IF;

  -- 2. Get Memory
  SELECT row_to_json(m) INTO v_memory
  FROM memories m
  WHERE id = v_memory_id;

  -- 3. Get Media
  SELECT coalesce(json_agg(row_to_json(mm)), '[]'::json) INTO v_media
  FROM (
    SELECT * FROM memory_media WHERE memory_id = v_memory_id ORDER BY created_at DESC
  ) mm;

  -- 4. Get Sections
  SELECT coalesce(json_agg(row_to_json(ms)), '[]'::json) INTO v_sections
  FROM (
    SELECT * FROM memory_sections WHERE memory_id = v_memory_id ORDER BY created_at ASC
  ) ms;

  -- 5. Get Tags
  SELECT coalesce(json_agg(row_to_json(t)), '[]'::json) INTO v_tags
  FROM (
    SELECT t.name 
    FROM memory_tags mt
    JOIN tags t ON mt.tag_id = t.id
    WHERE mt.memory_id = v_memory_id
  ) t;

  -- 6. Get Profile
  SELECT row_to_json(p) INTO v_profile
  FROM (
    SELECT username, avatar_url FROM profiles WHERE id = (v_memory->>'user_id')::uuid
  ) p;

  RETURN json_build_object(
    'memory', v_memory,
    'media', v_media,
    'sections', v_sections,
    'tags', v_tags,
    'profile', v_profile,
    'can_upload', true -- Hardcoded for now as requested
  );
END;
$$;

-- Function to add media via token
CREATE OR REPLACE FUNCTION add_media_via_token(
  p_token text,
  p_file_url text,
  p_file_type text,
  p_storage_path text,
  p_section_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_memory_id uuid;
BEGIN
  -- 1. Validate Token
  SELECT memory_id INTO v_memory_id
  FROM public_share_tokens
  WHERE token = p_token
  AND (expires_at IS NULL OR expires_at > now());

  IF v_memory_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;

  -- 2. Insert Media
  INSERT INTO memory_media (memory_id, section_id, file_url, file_type, storage_path)
  VALUES (v_memory_id, p_section_id, p_file_url, p_file_type, p_storage_path);

  RETURN json_build_object('success', true);
END;
$$;
