"use client";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import React, { Suspense } from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import dynamic from 'next/dynamic';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

const CartDrawer = dynamic(
  () => import('@/components/commerce/CartDrawer').then(mod => mod.CartDrawer),
  { ssr: false }
);

const inter = Inter({ subsets: ['latin'] });

function AppContent({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToast();

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-primary-950 transition-colors duration-200">
      <Suspense fallback={
        <div className="h-16 bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700/50 shadow-sm flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        </div>
      }>
        <Navbar />
      </Suspense>
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <AppContent>{children}</AppContent>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
