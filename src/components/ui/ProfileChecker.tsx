"use client";
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase/client';

export function ProfileChecker() {
  const { user } = useAuthStore();

  useEffect(() => {
    const ensureProfile = async () => {
      if (!user) return;

      try {
        // Check if profile exists
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile should be created by DB trigger shortly after signup.
          // Avoid client-side insert that may violate RLS; just log.
          console.log('Profile missing; will be created by trigger if signup just occurred.');
        }
      } catch (error) {
        console.error('Profile check failed:', error);
      }
    };

    ensureProfile();
  }, [user]);

  return null; // This component doesn't render anything
}