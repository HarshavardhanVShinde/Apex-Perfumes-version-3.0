"use client";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import React, { Suspense } from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';

// Dynamic imports for better code splitting
const Navbar = dynamic(() => import('@/components/layout/Navbar').then(mod => ({ default: mod.Navbar })), {
  ssr: true,
  loading: () => (
    <div className="h-16 bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700/50 shadow-sm flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
    </div>
  )
});

const Footer = dynamic(() => import('@/components/layout/Footer').then(mod => ({ default: mod.Footer })), {
  ssr: true
});

const CartDrawer = dynamic(
  () => import('@/components/commerce/CartDrawer').then(mod => mod.CartDrawer),
  { ssr: false }
);

const ToastContainer = dynamic(
  () => import('@/components/ui/Toast').then(mod => mod.ToastContainer),
  { ssr: false }
);

const inter = Inter({ subsets: ['latin'], display: 'swap' });

function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-primary-950 transition-colors duration-200">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <ToastContainer />
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
