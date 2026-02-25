-- Tabla de perfiles (extiende auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de recuerdos
CREATE TABLE public.memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('private', 'public_link', 'circle')),
    circle_id UUID, -- Referencia circular resuelta después
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de círculos
CREATE TABLE public.circles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar FK circle_id a memories ahora que circles existe
ALTER TABLE public.memories 
ADD CONSTRAINT fk_memories_circle 
FOREIGN KEY (circle_id) REFERENCES public.circles(id) ON DELETE CASCADE;

-- Tabla de miembros de círculos
CREATE TABLE public.circle_members (
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (circle_id, user_id)
);

-- Tabla de invitaciones a círculos
CREATE TABLE public.circle_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Tabla de medios adjuntos
CREATE TABLE public.memory_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de etiquetas
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla intermedia para etiquetas de recuerdos
CREATE TABLE public.memory_tags (
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (memory_id, tag_id)
);

-- Tabla de comentarios
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reacciones
CREATE TABLE public.reactions (
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (memory_id, user_id, emoji)
);

-- Tabla de favoritos
CREATE TABLE public.favorites (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, memory_id)
);

-- Tabla de tokens de compartición pública
CREATE TABLE public.public_share_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_memories_user_id ON public.memories(user_id);
CREATE INDEX idx_memories_created_at ON public.memories(created_at DESC);
CREATE INDEX idx_memories_status ON public.memories(status);
CREATE INDEX idx_memories_circle_id ON public.memories(circle_id);
CREATE INDEX idx_circle_members_user_id ON public.circle_members(user_id);
CREATE INDEX idx_comments_memory_id ON public.comments(memory_id);
CREATE INDEX idx_reactions_memory_id ON public.reactions(memory_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_public_share_tokens_token ON public.public_share_tokens(token);
CREATE INDEX idx_memory_tags_tag_id ON public.memory_tags(tag_id);

-- Activar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_share_tokens ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para verificar si es miembro de un círculo
CREATE OR REPLACE FUNCTION public.is_circle_member(check_circle_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.circle_members 
        WHERE public.circle_members.circle_id = check_circle_id 
        AND public.circle_members.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para profiles
CREATE POLICY "Perfiles visibles para todos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden editar su propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para memories
CREATE POLICY "Usuarios pueden ver sus propios recuerdos" ON public.memories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear recuerdos" ON public.memories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios recuerdos" ON public.memories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios recuerdos" ON public.memories
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Miembros pueden ver recuerdos del círculo" ON public.memories
    FOR SELECT USING (
        status = 'circle' AND public.is_circle_member(circle_id)
    );

-- Políticas para circles
CREATE POLICY "Círculos visibles para miembros" ON public.circles
    FOR SELECT USING (public.is_circle_member(id));

CREATE POLICY "Cualquiera puede crear círculos" ON public.circles
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners pueden editar círculos" ON public.circles
    FOR UPDATE USING (auth.uid() = owner_id);

-- Políticas para circle_members
CREATE POLICY "Miembros pueden ver miembros de sus círculos" ON public.circle_members
    FOR SELECT USING (public.is_circle_member(circle_id));

CREATE POLICY "Solo owners pueden agregar miembros" ON public.circle_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.circles 
            WHERE public.circles.id = circle_id 
            AND public.circles.owner_id = auth.uid()
        )
    );

-- Políticas para comments (solo en recuerdos de círculo o propios)
CREATE POLICY "Miembros pueden ver comentarios" ON public.comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memories 
            WHERE public.memories.id = memory_id 
            AND (
                (public.memories.status = 'circle' AND public.is_circle_member(public.memories.circle_id))
                OR public.memories.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Miembros pueden comentar en recuerdos de círculo" ON public.comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.memories 
            WHERE public.memories.id = memory_id 
            AND public.memories.status = 'circle' 
            AND public.is_circle_member(public.memories.circle_id)
        )
    );

-- Políticas para reactions (solo en recuerdos de círculo)
CREATE POLICY "Miembros pueden ver reacciones" ON public.reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memories 
            WHERE public.memories.id = memory_id 
            AND (
                (public.memories.status = 'circle' AND public.is_circle_member(public.memories.circle_id))
                OR public.memories.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Miembros pueden reaccionar en recuerdos de círculo" ON public.reactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.memories 
            WHERE public.memories.id = memory_id 
            AND public.memories.status = 'circle' 
            AND public.is_circle_member(public.memories.circle_id)
        )
    );

-- Políticas para favorites
CREATE POLICY "Usuarios pueden gestionar sus favoritos" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para public_share_tokens (lectura pública)
CREATE POLICY "Tokens públicos son de lectura pública" ON public.public_share_tokens
    FOR SELECT USING (true);
