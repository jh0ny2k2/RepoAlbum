import { create } from 'zustand';
import { supabase, Profile } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: Profile | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  initialized: false,
  initialize: async () => {
    if (get().initialized) return;

    try {
      // 1. Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      
      let initialProfile: Profile | null = null;
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        initialProfile = data;
      }

      // Batch initial state update
      set({ 
        session, 
        user: initialProfile,
        // loading: false, // Don't set loading false yet, wait for listener setup? No, set it now to show UI.
      });

      // 2. Setup listener for future changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        // Only update if session actually changed ID or user
        const currentSession = get().session;
        if (currentSession?.access_token === newSession?.access_token) {
           return; // Avoid unnecessary updates for same session token refreshes if not needed
        }

        let newProfile: Profile | null = null;
        if (newSession?.user) {
           // Try to reuse current profile if ID matches to avoid fetch loop
           if (get().user?.id === newSession.user.id) {
             newProfile = get().user;
           } else {
             const { data } = await supabase
               .from('profiles')
               .select('*')
               .eq('id', newSession.user.id)
               .single();
             newProfile = data;
           }
        }

        set({ 
          session: newSession, 
          user: newProfile, 
          loading: false 
        });
      });

      // Store subscription cleanup if needed (for global store usually not needed, but good practice)
      // For now, just mark initialized.

    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ loading: false, initialized: true });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
