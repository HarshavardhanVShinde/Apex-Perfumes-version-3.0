"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Moon, 
  Sun, 
  Menu, 
  X,
  ChevronDown 
} from 'lucide-react';
import { useThemeStore } from '@/stores/theme';
import { useCartStore } from '@/stores/cart';
import { useUser, useStackApp } from '@stackframe/stack';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Helper function to get user initials
const getInitials = (email: string): string => {
  const parts = email.split('@')[0].split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
};

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const collectionsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { theme, toggleTheme } = useThemeStore();
  const openCart = useCartStore(s => s.openCart);
  const loadCart = useCartStore(s => s.loadCart);
  const itemCount = useCartStore(s => s.items.reduce((t, i) => t + i.quantity, 0));
  const stackUser = useUser({ or: 'return-null' });
  const stackApp = useStackApp();
  const router = useRouter();
    // Load cart on mount and when auth user changes
    useEffect(() => {
      loadCart().catch(() => {});
    }, [loadCart, stackUser?.id]);
  
  // Convert Stack user to simplified user object
  const user = stackUser ? {
    id: stackUser.id,
    email: stackUser.primaryEmail || '',
    firstName: stackUser.displayName?.split(' ')[0] || '',
    lastName: stackUser.displayName?.split(' ').slice(1).join(' ') || '',
  } : null;

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (collectionsRef.current && !collectionsRef.current.contains(event.target as Node)) {
        setIsCollectionsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const collections = [
    { name: "Men's", slug: 'men' },
    { name: "Women's", slug: 'women' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/collections/men?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await stackApp.signOut();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-slate-900/20 backdrop-blur-sm dark:backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-900 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="hover:opacity-80 transition-opacity group"
            >
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent hover:from-purple-300 hover:to-purple-700 transition-all duration-300">
                Aura Élixir
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Collections Dropdown */}
            <div className="relative" ref={collectionsRef}>
              <Button
                variant="ghost"
                className="flex items-center space-x-1 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors"
                onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
              >
                <span>Collections</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isCollectionsOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {isCollectionsOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gradient-to-b dark:from-slate-800 dark:to-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600/50 py-2 z-50 animate-slide-up backdrop-blur-sm">
                  {collections.map(collection => (
                    <Link
                      key={collection.slug}
                      href={`/collections/${collection.slug}`}
                      className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
                      onClick={() => setIsCollectionsOpen(false)}
                    >
                      {collection.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative hidden lg:block">
              <div className="flex items-center">
                <Input
                  type="search"
                  placeholder="Search fragrances..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 border-gray-300 dark:border-slate-600 focus:border-amber-400 focus:ring-amber-400 rounded-lg bg-white dark:bg-slate-800/50 backdrop-blur-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              title="Toggle dark mode"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {user ? (
                  // User avatar circle with initials
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-shadow">
                    {getInitials(user.email || 'User')}
                  </div>
                ) : (
                  <User className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                )}
              </Button>
              
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gradient-to-b dark:from-slate-800 dark:to-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600/50 py-2 z-50 animate-slide-up backdrop-blur-sm">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-t-lg">
                        <p className="text-xs uppercase tracking-widest text-amber-700 dark:text-amber-300 font-semibold">Account</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1 truncate" title={user.email}>{user.email}</p>
                      </div>
                      <Link
                        href="/account"
                        className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium border-t border-gray-200 dark:border-slate-600/50"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/handler/sign-in"
                        className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/handler/sign-up"
                        className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium border-t border-gray-200 dark:border-slate-600/50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 relative text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              onClick={openCart}
              title="Open shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-slate-600/50 py-4 space-y-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="px-2">
              <Input
                type="search"
                placeholder="Search fragrances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-gray-300 dark:border-slate-600 focus:border-amber-400 focus:ring-amber-400 rounded-lg bg-white dark:bg-slate-800/50 backdrop-blur-sm"
              />
            </form>

            {/* Mobile collections */}
            <div className="px-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 text-sm uppercase tracking-widest text-amber-600 dark:text-amber-300">Collections</h3>
              <div className="space-y-2">
                {collections.map(collection => (
                  <Link
                    key={collection.slug}
                    href={`/collections/${collection.slug}`}
                    className="block text-sm text-slate-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors py-1.5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {collection.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}