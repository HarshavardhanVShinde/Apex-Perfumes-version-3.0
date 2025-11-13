'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';

interface AuthStatus {
  supabaseUrl: boolean;
  anonKey: boolean;
  sessionExists: boolean;
  userLoaded: boolean;
  profile: any;
  authError: string | null;
}

export function AuthDebugPanel() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<AuthStatus>({
    supabaseUrl: false,
    anonKey: false,
    sessionExists: false,
    userLoaded: !!user,
    profile: null,
    authError: null,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check env vars
        const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
        const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

        // Check profile if user exists
        let profileData = null;
        if (authUser) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          profileData = data;
        }

        setStatus({
          supabaseUrl: hasUrl,
          anonKey: hasKey,
          sessionExists: !!session,
          userLoaded: !!authUser,
          profile: profileData,
          authError: sessionError?.message || userError?.message || null,
        });
      } catch (err: any) {
        setStatus(prev => ({
          ...prev,
          authError: err.message,
        }));
      }
    };

    checkAuthStatus();
  }, [user]);

  const getStatusColor = (value: boolean) => {
    return value ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-primary-950 dark:bg-neutral-100 text-neutral-100 dark:text-primary-950 px-3 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-opacity"
      >
        🔐 Auth Debug
      </button>

      {isExpanded && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-primary-900 border border-primary-200 dark:border-primary-800 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
          <h3 className="font-bold mb-3 text-primary-950 dark:text-neutral-100">Auth Status</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-primary-700 dark:text-neutral-300">Supabase URL:</span>
              <span className={getStatusColor(status.supabaseUrl)}>
                {status.supabaseUrl ? '✓' : '✗'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-primary-700 dark:text-neutral-300">Anon Key:</span>
              <span className={getStatusColor(status.anonKey)}>
                {status.anonKey ? '✓' : '✗'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-primary-700 dark:text-neutral-300">Session Exists:</span>
              <span className={getStatusColor(status.sessionExists)}>
                {status.sessionExists ? '✓' : '✗'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-primary-700 dark:text-neutral-300">User Loaded:</span>
              <span className={getStatusColor(status.userLoaded)}>
                {status.userLoaded ? '✓' : '✗'}
              </span>
            </div>

            {user && (
              <>
                <div className="border-t border-primary-200 dark:border-primary-800 pt-2 mt-2">
                  <p className="text-primary-700 dark:text-neutral-300 font-semibold">User Info:</p>
                  <p className="text-xs text-primary-600 dark:text-neutral-400 break-all">
                    Email: {user.email}
                  </p>
                  <p className="text-xs text-primary-600 dark:text-neutral-400">
                    ID: {user.id?.substring(0, 8)}...
                  </p>
                </div>

                {status.profile && (
                  <div className="border-t border-primary-200 dark:border-primary-800 pt-2 mt-2">
                    <p className="text-primary-700 dark:text-neutral-300 font-semibold">Profile:</p>
                    <p className="text-xs text-primary-600 dark:text-neutral-400">
                      Name: {status.profile.first_name} {status.profile.last_name}
                    </p>
                  </div>
                )}
              </>
            )}

            {status.authError && (
              <div className="border-t border-primary-200 dark:border-primary-800 pt-2 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                <p className="text-xs text-red-600 dark:text-red-400 break-all">
                  Error: {status.authError}
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-800 flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.location.href = '/auth/login'}
              className="text-xs"
            >
              Login
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.location.href = '/auth/signup'}
              className="text-xs"
            >
              Signup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
