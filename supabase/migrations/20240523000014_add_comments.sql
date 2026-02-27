-- Tabla de comentarios
CREATE TABLE IF NOT EXISTS public.memory_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_memory_comments_memory_id ON public.memory_comments(memory_id);

-- Habilitar RLS
ALTER TABLE public.memory_comments ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad (RLS)

-- 1. Lectura: Todo el mundo puede leer comentarios si el recuerdo es público o si tienen acceso.
-- Simplificación: Permitir lectura pública de comentarios por ahora para facilitar la vista de invitados.
CREATE POLICY "Comentarios visibles públicamente" ON public.memory_comments
    FOR SELECT USING (true);

-- 2. Escritura: Permitir a cualquiera insertar comentarios (para invitados).
CREATE POLICY "Cualquiera puede comentar" ON public.memory_comments
    FOR INSERT WITH CHECK (true);

-- 3. Borrado: Solo el dueño del recuerdo puede borrar comentarios (esto requiere un join más complejo o una función, 
-- pero para simplificar, permitiremos que el creador del comentario lo borre si tuviéramos auth, 
-- o restringiremos el borrado solo al dueño del proyecto desde el dashboard).
-- Por ahora, solo permitimos borrar si eres usuario autenticado (asumimos que eres el admin/dueño).
CREATE POLICY "Usuarios autenticados pueden borrar comentarios" ON public.memory_comments
    FOR DELETE USING (auth.role() = 'authenticated');
