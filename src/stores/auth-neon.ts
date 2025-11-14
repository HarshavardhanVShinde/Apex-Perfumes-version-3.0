import { create } from 'zustand';
import { useUser, useStackApp } from '@stackframe/stack';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  loadUser: () => Promise<void>;
  logout: () => Promise<void>;
}

// Utility to convert Stack Auth user to app User type
function convertStackUserToAppUser(stackUser: any): User {
  const displayName = stackUser.displayName || '';
  const nameParts = displayName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: stackUser.id,
    email: stackUser.primaryEmail || '',
    firstName,
    lastName,
    createdAt: stackUser.signedUpAt?.toISOString() || new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  loadUser: async () => {
    // This function is now mostly handled by Stack Auth hooks in components
    // We keep it for backward compatibility during migration
    set({ isInitialized: true });
  },

  logout: async () => {
    // Stack Auth logout is handled via the hook in components
    // This is kept for backward compatibility
    set({ user: null });
  },
}));

// Hook to sync Stack Auth user with Zustand store
export function useAuthSync() {
  const stackUser = useUser();
  const authStore = useAuthStore();

  // Sync Stack user to Zustand whenever it changes
  if (stackUser && !authStore.user) {
    const appUser = convertStackUserToAppUser(stackUser);
    useAuthStore.setState({ user: appUser, isInitialized: true });
  } else if (!stackUser && authStore.user) {
    useAuthStore.setState({ user: null, isInitialized: true });
  }

  return authStore.user;
}
