"use client";

import { ReactNode } from "react";
import { StackClientApp, StackProvider } from "@stackframe/stack";

const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
const publishableKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

const stackApp = projectId && publishableKey
  ? new StackClientApp({
      projectId,
      publishableClientKey: publishableKey,
      tokenStore: "cookie",
    })
  : null;

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  // Temporary: Allow disabling Stack Auth for testing
  const disableStackAuth = process.env.NEXT_PUBLIC_DISABLE_STACK_AUTH === 'true';
  
  if (disableStackAuth) {
    console.warn('[Providers] Stack Auth is temporarily disabled via NEXT_PUBLIC_DISABLE_STACK_AUTH');
    return <>{children}</>;
  }
  
  if (!stackApp) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Stack Auth environment variables are missing; rendering without StackProvider."
      );
    }
    return <>{children}</>;
  }

  return <StackProvider app={stackApp}>{children}</StackProvider>;
}
