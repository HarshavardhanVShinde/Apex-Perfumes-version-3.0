import { create } from 'zustand';
import type { User } from '@/types';
import { loginSchema, signupSchema } from '@/lib/schema';
import { signIn, signUp, signOut, getCurrentUser, onAuthStateChange } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

// Convert Supabase user to app user format - Fixed to use correct column names
function convertToAppUser(authUser: any): User {
  const fullName = authUser.profile?.full_name ?? ''
  const nameParts = fullName.split(' ')
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ') ?? ''
  return {
    id: authUser.id,
    email: authUser.email,
    firstName,
    lastName,
    createdAt: authUser.created_at,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      
      // Validate input
      loginSchema.parse({ email, password });
      
      const data = await signIn({ email, password });
      const authUser = await getCurrentUser();
      
      if (authUser) {
        const user = convertToAppUser(authUser);
        set({ user, isLoading: false });
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (data: any) => {
    try {
      set({ isLoading: true });
      
      // Validate input
      signupSchema.parse(data);
      
      const fullName = `${data.firstName} ${data.lastName}`;
      const authUser = await signUp({
        email: data.email,
        password: data.password,
        fullName,
      });
      
      // Wait a bit for profile creation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const user = convertToAppUser(currentUser);
        set({ user, isLoading: false });
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await signOut();
    set({ user: null });
  },

  loadUser: async () => {
    // Prevent multiple simultaneous calls
    if (get().isLoading) {
      return;
    }

    try {
      // First get the current session/user from Supabase auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        set({ user: null, isInitialized: true });
        return;
      }

      if (!session?.user) {
        set({ user: null, isInitialized: true });
        return;
      }

      // Try to get additional user data, but don't fail if profile doesn't exist
      try {
        const authUser = await getCurrentUser();
        if (authUser) {
          const user = convertToAppUser(authUser);
          set({ user, isInitialized: true });
        } else {
          // Fallback to basic user data from session
          const user = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.full_name?.split(' ')[0] || '',
            lastName: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
            createdAt: session.user.created_at,
          };
          set({ user, isInitialized: true });
        }
      } catch (profileError) {
        console.warn('Profile fetch failed, using session data:', profileError);
        // Use session data as fallback
        const user = {
          id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          createdAt: session.user.created_at,
        };
        set({ user, isInitialized: true });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      set({ user: null, isInitialized: true });
    }
  },
}));
