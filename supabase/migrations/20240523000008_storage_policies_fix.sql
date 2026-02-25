-- Política para permitir actualizar (UPDATE) objetos en Storage (necesario para upserts/sobrescribir)
DROP POLICY IF EXISTS "Storage Update Owner" ON storage.objects;
CREATE POLICY "Storage Update Owner" ON storage.objects
    FOR UPDATE USING (
        auth.role() = 'authenticated'
    );

-- Política para permitir borrar (DELETE) objetos en Storage
DROP POLICY IF EXISTS "Storage Delete Owner" ON storage.objects;
CREATE POLICY "Storage Delete Owner" ON storage.objects
    FOR DELETE USING (
        auth.role() = 'authenticated'
    );
