-- Permitir que usuarios autenticados creen sus propios recuerdos (Asegurarnos de que la política existe)
DROP POLICY IF EXISTS "Usuarios pueden crear recuerdos" ON public.memories;
CREATE POLICY "Usuarios pueden crear recuerdos" ON public.memories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permitir lectura pública de perfiles (necesario para referenciar)
DROP POLICY IF EXISTS "Perfiles visibles para todos" ON public.profiles;
CREATE POLICY "Perfiles visibles para todos" ON public.profiles FOR SELECT USING (true);
