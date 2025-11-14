import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { stackServerApp } from './src/stack/server'

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  const protectedPrefixes = ['/account', '/checkout']
  const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix))

  if (!isProtected) {
    return NextResponse.next()
  }

  const user = await stackServerApp.getUser({ tokenStore: req });

  if (!user) {
    url.pathname = '/handler/sign-in'
    url.searchParams.set('after_auth_return_to', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*'],
}