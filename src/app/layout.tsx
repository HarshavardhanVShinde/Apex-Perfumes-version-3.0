"use client";
import React, { useEffect } from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/commerce/CartDrawer';
import { ToastContainer } from '@/components/ui/Toast';
import { ProfileChecker } from '@/components/ui/ProfileChecker';
// import { AuthDebugPanel } from '@/components/ui/AuthDebugPanel';
import { useToast } from '@/hooks/useToast';
import { onAuthStateChange } from '@/lib/supabase/auth';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        console.log('🔄 Initializing auth and cart...');
        await useAuthStore.getState().loadUser();
        await useCartStore.getState().loadCart();
        await useWishlistStore.getState().loadWishlist();
        console.log('✅ Initialization complete');
      } catch (error) {
        console.error('❌ Initialization failed:', error);
      }
    };
    init();

    const { data: { subscription } } = onAuthStateChange(async (authUser) => {
      try {
        console.log('🔄 Auth state changed:', authUser ? 'User signed in' : 'User signed out');
        
        // Load user state first
        await useAuthStore.getState().loadUser();

        // Always reload cart and wishlist after auth state change
        console.log('🔄 Reloading cart and wishlist...');
        await useCartStore.getState().loadCart();
        await useWishlistStore.getState().loadWishlist();
        console.log('✅ Cart and wishlist reloaded');
      } catch (error) {
        console.error('❌ Auth state change handler failed:', error);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-neutral-100 dark:bg-primary-950 transition-colors duration-200">
          <ProfileChecker />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <ToastContainer toasts={toasts} onRemove={removeToast} />
          {/* {process.env.NODE_ENV === 'development' && <AuthDebugPanel />} */}
        </div>
      </body>
    </html>
  );
}
