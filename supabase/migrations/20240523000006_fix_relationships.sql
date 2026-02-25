-- Asegurar que los perfiles son visibles para poder hacer joins
DROP POLICY IF EXISTS "Perfiles visibles para todos" ON public.profiles;
CREATE POLICY "Perfiles visibles para todos" ON public.profiles FOR SELECT USING (true);

-- Asegurar que los tags son visibles
DROP POLICY IF EXISTS "Tags visibles para todos" ON public.tags;
CREATE POLICY "Tags visibles para todos" ON public.tags FOR SELECT USING (true);

-- Asegurar que memory_tags son visibles si el usuario puede ver la memoria
DROP POLICY IF EXISTS "Memory tags visibles" ON public.memory_tags;
CREATE POLICY "Memory tags visibles" ON public.memory_tags FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.memories
        WHERE public.memories.id = memory_tags.memory_id
        AND (public.memories.user_id = auth.uid() OR public.memories.status = 'public_link')
    )
);
