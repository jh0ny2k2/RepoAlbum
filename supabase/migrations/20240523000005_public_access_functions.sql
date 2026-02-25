-- Function to get memory details by public token
CREATE OR REPLACE FUNCTION get_memory_by_token(p_token text)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  created_at timestamptz,
  location text,
  username text,
  avatar_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id, m.title, m.content, m.created_at, m.location,
    p.username, p.avatar_url
  FROM public_share_tokens t
  JOIN memories m ON t.memory_id = m.id
  LEFT JOIN profiles p ON m.user_id = p.id
  WHERE t.token = p_token AND (t.expires_at IS NULL OR t.expires_at > now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upload media via public token
CREATE OR REPLACE FUNCTION upload_public_media(
  p_token text,
  p_file_url text,
  p_storage_path text,
  p_file_type text
) RETURNS jsonb AS $$
DECLARE
  v_memory_id uuid;
BEGIN
  -- Validate token and get memory_id
  SELECT memory_id INTO v_memory_id
  FROM public_share_tokens
  WHERE token = p_token AND (expires_at IS NULL OR expires_at > now());

  IF v_memory_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;

  -- Insert media
  INSERT INTO memory_media (memory_id, file_url, storage_path, file_type)
  VALUES (v_memory_id, p_file_url, p_storage_path, p_file_type);

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to public (anon)
GRANT EXECUTE ON FUNCTION get_memory_by_token(text) TO public;
GRANT EXECUTE ON FUNCTION upload_public_media(text, text, text, text) TO public;

-- Also need a function to get media for the public memory
CREATE OR REPLACE FUNCTION get_memory_media_by_token(p_token text)
RETURNS TABLE (
  file_url text,
  file_type text
) AS $$
BEGIN
  RETURN QUERY
  SELECT mm.file_url, mm.file_type
  FROM public_share_tokens t
  JOIN memory_media mm ON t.memory_id = mm.memory_id
  WHERE t.token = p_token AND (t.expires_at IS NULL OR t.expires_at > now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_memory_media_by_token(text) TO public;
