-- Create a new bucket called 'memories'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('memories', 'memories', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload media
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'memories' );

-- Policy to allow users to update their own media
CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'memories' AND owner = auth.uid() );

-- Policy to allow users to delete their own media
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'memories' AND owner = auth.uid() );

-- Policy to allow public access to view files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'memories' );
