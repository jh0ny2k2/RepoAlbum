-- Asegurar que todos los usuarios de auth.users tengan un perfil en public.profiles
INSERT INTO public.profiles (id, email, username, full_name, avatar_url)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
