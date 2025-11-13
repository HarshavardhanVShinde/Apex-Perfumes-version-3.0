import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'Session error',
          details: sessionError.message 
        },
        { status: 401 }
      );
    }

    if (!session?.user) {
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'No session found',
          message: 'User is not authenticated'
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at
      },
      session_info: {
        access_token_length: session.access_token?.length || 0,
        expires_at: session.expires_at
      }
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      { 
        authenticated: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}