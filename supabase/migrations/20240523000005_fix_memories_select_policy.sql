-- Asegurar política de lectura simple para memories
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios recuerdos" ON public.memories;
CREATE POLICY "Usuarios pueden ver sus propios recuerdos" ON public.memories
    FOR SELECT USING (auth.uid() = user_id);

-- Asegurarse de que el usuario tiene acceso a profiles (para los joins)
DROP POLICY IF EXISTS "Perfiles visibles para todos" ON public.profiles;
CREATE POLICY "Perfiles visibles para todos" ON public.profiles FOR SELECT USING (true);
