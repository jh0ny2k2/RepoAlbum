
-- Tabla de perfiles (extiende auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de círculos
CREATE TABLE circles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de recuerdos
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('private', 'public_link', 'circle')),
    circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de miembros de círculos
CREATE TABLE circle_members (
    circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (circle_id, user_id)
);

-- Tabla de invitaciones a círculos
CREATE TABLE circle_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Tabla de medios adjuntos
CREATE TABLE memory_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de etiquetas
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla intermedia para etiquetas de recuerdos
CREATE TABLE memory_tags (
    memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (memory_id, tag_id)
);

-- Tabla de comentarios
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reacciones
CREATE TABLE reactions (
    memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (memory_id, user_id, emoji)
);

-- Tabla de favoritos
CREATE TABLE favorites (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, memory_id)
);

-- Tabla de tokens de compartición pública
CREATE TABLE public_share_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_memories_user_id ON memories(user_id);
CREATE INDEX idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX idx_memories_status ON memories(status);
CREATE INDEX idx_memories_circle_id ON memories(circle_id);
CREATE INDEX idx_circle_members_user_id ON circle_members(user_id);
CREATE INDEX idx_comments_memory_id ON comments(memory_id);
CREATE INDEX idx_reactions_memory_id ON reactions(memory_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_public_share_tokens_token ON public_share_tokens(token);
CREATE INDEX idx_memory_tags_tag_id ON memory_tags(tag_id);

-- Activar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_share_tokens ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para verificar si es miembro de un círculo
CREATE OR REPLACE FUNCTION is_circle_member(circle_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM circle_members 
        WHERE circle_members.circle_id = $1 
        AND circle_members.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para memories
CREATE POLICY "Usuarios pueden ver sus propios recuerdos" ON memories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear recuerdos" ON memories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios recuerdos" ON memories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios recuerdos" ON memories
    FOR DELETE USING (auth.uid() = user_id);

-- Ver recuerdos compartidos con círculo
CREATE POLICY "Miembros pueden ver recuerdos del círculo" ON memories
    FOR SELECT USING (
        status = 'circle' AND is_circle_member(circle_id)
    );

-- Políticas para circle_members
CREATE POLICY "Miembros pueden ver miembros de sus círculos" ON circle_members
    FOR SELECT USING (is_circle_member(circle_id));

CREATE POLICY "Solo owners pueden agregar miembros" ON circle_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM circles 
            WHERE circles.id = circle_id 
            AND circles.owner_id = auth.uid()
        )
    );

-- Políticas para comments (solo en recuerdos de círculo)
CREATE POLICY "Miembros pueden comentar en recuerdos de círculo" ON comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM memories 
            WHERE memories.id = memory_id 
            AND memories.status = 'circle' 
            AND is_circle_member(memories.circle_id)
        )
    );

-- Políticas para reactions (solo en recuerdos de círculo)
CREATE POLICY "Miembros pueden reaccionar en recuerdos de círculo" ON reactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM memories 
            WHERE memories.id = memory_id 
            AND memories.status = 'circle' 
            AND is_circle_member(memories.circle_id)
        )
    );

-- Políticas para favorites
CREATE POLICY "Usuarios pueden gestionar sus favoritos" ON favorites
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para public_share_tokens (lectura pública)
CREATE POLICY "Tokens públicos son de lectura pública" ON public_share_tokens
    FOR SELECT USING (true);

-- Otorgar permisos básicos
GRANT SELECT ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
GRANT SELECT ON memories TO anon;
GRANT ALL ON memories TO authenticated;
GRANT SELECT ON circles TO authenticated;
GRANT ALL ON circle_members TO authenticated;
GRANT ALL ON circle_invitations TO authenticated;
GRANT SELECT ON memory_media TO authenticated;
GRANT SELECT ON tags TO authenticated;
GRANT ALL ON memory_tags TO authenticated;
GRANT ALL ON comments TO authenticated;
GRANT ALL ON reactions TO authenticated;
GRANT ALL ON favorites TO authenticated;
GRANT SELECT ON public_share_tokens TO anon;

-- Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('memories', 'memories', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime']);

CREATE POLICY "Usuarios pueden subir archivos a sus carpetas" ON storage.objects
    FOR INSERT WITH CHECK (
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Usuarios pueden ver archivos de sus recuerdos" ON storage.objects
    FOR SELECT USING (
        auth.uid()::text = (storage.foldername(name))[1] OR
        EXISTS (
            SELECT 1 FROM memories 
            JOIN memory_media ON memories.id = memory_media.memory_id
            WHERE memory_media.storage_path = name
            AND memories.status = 'circle'
            AND is_circle_member(memories.circle_id)
        )
    );
