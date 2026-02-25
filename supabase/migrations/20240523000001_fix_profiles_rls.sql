-- Permitir a los usuarios insertar su propio perfil durante el registro
CREATE POLICY "Usuarios pueden crear su propio perfil" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
