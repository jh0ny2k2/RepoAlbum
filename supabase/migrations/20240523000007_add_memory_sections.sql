-- Crear tabla de secciones (carpetas) dentro de los recuerdos
CREATE TABLE public.memory_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Añadir columna section_id a la tabla de medios
ALTER TABLE public.memory_media
ADD COLUMN section_id UUID REFERENCES public.memory_sections(id) ON DELETE SET NULL;

-- Añadir columna uploaded_by a la tabla de medios (para saber quién subió la foto)
ALTER TABLE public.memory_media
ADD COLUMN uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Habilitar RLS en memory_sections
ALTER TABLE public.memory_sections ENABLE ROW LEVEL SECURITY;

-- Políticas para memory_sections
-- Ver secciones: si puedes ver el recuerdo, puedes ver sus secciones
CREATE POLICY "Ver secciones de recuerdo" ON public.memory_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memories
            WHERE public.memories.id = memory_sections.memory_id
            AND (public.memories.user_id = auth.uid() OR public.memories.status = 'public_link')
        )
    );

-- Crear secciones: solo el dueño del recuerdo puede crear secciones
CREATE POLICY "Dueño puede crear secciones" ON public.memory_sections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.memories
            WHERE public.memories.id = memory_sections.memory_id
            AND public.memories.user_id = auth.uid()
        )
    );

-- Eliminar secciones: solo el dueño
CREATE POLICY "Dueño puede eliminar secciones" ON public.memory_sections
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.memories
            WHERE public.memories.id = memory_sections.memory_id
            AND public.memories.user_id = auth.uid()
        )
    );

-- Asegurar bucket de storage 'memories'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('memories', 'memories', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage (simplificadas para permitir subidas de dueños y lectura pública si es necesario)
DROP POLICY IF EXISTS "Storage Insert Owner" ON storage.objects;
CREATE POLICY "Storage Insert Owner" ON storage.objects
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Storage Select Public" ON storage.objects;
CREATE POLICY "Storage Select Public" ON storage.objects
    FOR SELECT USING ( bucket_id = 'memories' );
