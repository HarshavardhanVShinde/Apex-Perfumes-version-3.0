import { supabase } from './client'
import type { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  profile?: {
    full_name: string | null
    avatar_url: string | null
  }
}

export interface SignUpData {
  email: string
  password: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface UpdateProfileData {
  full_name?: string
  avatar_url?: string
}

// Cache to prevent multiple rapid API calls with failed strategy tracking
let profileCache: Map<string, { 
  profile: AuthUser['profile']; 
  timestamp: number; 
  failedStrategies: Set<string>;
}> = new Map()
const CACHE_DURATION = 30000 // 30 seconds

// Lock to prevent concurrent profile calls
let isFetchingProfile = false
const FETCH_LOCK_DURATION = 2000 // 2 seconds

// Sign up new user
export async function signUp({ email, password, fullName }: SignUpData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (error) {
    throw error
  }

  // Rely on DB trigger to create profile; avoid client-side inserts that can hit RLS
  // Ensure session is established before returning
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) {
    // Wait briefly for session propagation (email confirmation flows may not create an immediate session)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return data
}

// Sign in existing user
export async function signIn({ email, password }: SignInData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

// Sign out user
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw error
  }
  
  // Clear cache on sign out
  profileCache.clear()
  isFetchingProfile = false
}

// Get current user with profile - Ultra robust with aggressive caching
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Check cache first - if we have a recent result, return it immediately
  const cacheKey = user.id
  const cached = profileCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return {
      ...user,
      profile: cached.profile
    }
  }

  // If we're already fetching, wait for the result
  if (isFetchingProfile) {
    // Wait for up to 2 seconds for the fetch to complete
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Try cache again after waiting
    const retryCached = profileCache.get(cacheKey)
    if (retryCached && Date.now() - retryCached.timestamp < CACHE_DURATION) {
      return {
        ...user,
        profile: retryCached.profile
      }
    }
  }

  // Prevent concurrent fetches
  if (isFetchingProfile) {
    // If lock is still active, return user without profile to avoid blocking
    return {
      ...user,
      profile: undefined
    }
  }

  isFetchingProfile = true

  try {
    let profile: AuthUser['profile'] = undefined

    // Only try strategies that haven't failed before
    const failedStrategies = cached?.failedStrategies || new Set<string>()

    // Strategy 1: Try full_name only if not known to fail
    if (!failedStrategies.has('full_name')) {
      try {
        const result = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single()
        
        if (result.data) {
          profile = result.data
        }
      } catch (e: any) {
        console.debug('full_name query failed:', e?.message)
        failedStrategies.add('full_name')
      }
    }

    // Strategy 2: Try first_name + last_name if full_name didn't work and hasn't failed
    if (!profile && !failedStrategies.has('name_parts')) {
      try {
        const result = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single()
        
        if (result.data) {
          const data = result.data as any
          profile = {
            full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
            avatar_url: data.avatar_url
          }
        }
      } catch (e: any) {
        console.debug('first_name/last_name query failed:', e?.message)
        failedStrategies.add('name_parts')
      }
    }

    // Strategy 3: Just avatar_url if nothing else worked
    if (!profile && !failedStrategies.has('avatar_only')) {
      try {
        const result = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()
        
        if (result.data) {
          profile = { full_name: null, avatar_url: result.data.avatar_url }
        }
      } catch (e: any) {
        console.debug('avatar_url query failed:', e?.message)
        failedStrategies.add('avatar_only')
      }
    }

    // If all strategies failed, mark as no profile available
    if (!profile && failedStrategies.size >= 3) {
      profile = undefined
    }

    // Cache the result with failed strategies
    profileCache.set(cacheKey, { 
      profile, 
      timestamp: Date.now(),
      failedStrategies 
    })

    return {
      ...user,
      profile
    }
  } finally {
    isFetchingProfile = false
  }
}

// Update user profile
export async function updateProfile(userId: string, updates: UpdateProfileData) {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  }


  if (updates.full_name !== undefined) {
    updateData.full_name = updates.full_name
  }

  if (updates.avatar_url !== undefined) {
    updateData.avatar_url = updates.avatar_url
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Clear cache for this user
    profileCache.delete(userId)
    
    return data
  } catch (error) {
    console.warn('Profile update failed:', error)
    throw error
  }
}

// Reset password
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    throw error
  }
}

// Update password
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    throw error
  }
}

// Listen to auth state changes - Ultra optimized with aggressive caching
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    // Clear cache on sign out
    if (event === 'SIGNED_OUT') {
      profileCache.clear()
      isFetchingProfile = false
      callback(null)
      return
    }

    if (session?.user) {
      // Use cached result immediately, don't wait for fresh data
      const cached = profileCache.get(session.user.id)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        callback({
          ...session.user,
          profile: cached.profile
        })
        return
      }

      // Only fetch fresh data if we don't have recent cache
      try {
        const user = await getCurrentUser()
        callback(user)
      } catch (error) {
        console.warn('Failed to fetch user profile:', error)
        callback({
          ...session.user,
          profile: undefined
        })
      }
    } else {
      callback(null)
    }
  })
}
