-- Allow public (anon) users to upload files to 'memories' bucket
-- This is required for the feature where guests can add photos via a shared link
CREATE POLICY "Public can upload media"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'memories' );
