-- Policies for public_share_tokens
ALTER TABLE public_share_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage tokens" ON public_share_tokens;
CREATE POLICY "Owner can manage tokens"
ON public_share_tokens
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM memories
    WHERE memories.id = public_share_tokens.memory_id
    AND memories.user_id = auth.uid()
  )
);

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token(p_memory_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token text;
BEGIN
  -- Check ownership
  IF NOT EXISTS (SELECT 1 FROM memories WHERE id = p_memory_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Check if token exists
  SELECT token INTO v_token
  FROM public_share_tokens
  WHERE memory_id = p_memory_id
  AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF v_token IS NOT NULL THEN
    RETURN v_token;
  END IF;

  -- Create new token
  v_token := encode(gen_random_bytes(16), 'hex');
  
  INSERT INTO public_share_tokens (memory_id, token)
  VALUES (p_memory_id, v_token);

  RETURN v_token;
END;
$$;
