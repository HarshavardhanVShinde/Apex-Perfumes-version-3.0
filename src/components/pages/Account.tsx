"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, Heart, Settings, LogOut } from 'lucide-react';
import { useUser, useStackApp } from '@stackframe/stack';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

type OrderItemDisplay = {
  name: string;
  image: string;
  quantity: number;
  price: number;
};

type OrderDisplay = {
  id: string;
  created_at: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total: number;
  items: OrderItemDisplay[];
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800'
};

export function Account() {
  const stackUser = useUser();
  const stackApp = useStackApp();
  const router = useRouter();
  const [orders, setOrders] = React.useState<OrderDisplay[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const user = stackUser ? {
    id: stackUser.id,
    email: stackUser.primaryEmail || '',
    firstName: stackUser.displayName?.split(' ')[0] || '',
    lastName: stackUser.displayName?.split(' ').slice(1).join(' ') || '',
  } : null;

  React.useEffect(() => {
    if (!stackUser) {
      router.replace('/handler/sign-in');
    }
  }, [stackUser, router]);

  React.useEffect(() => {
    if (!user) {
      return;
    }
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/orders?page=1&limit=10', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        const mapped: OrderDisplay[] = (data.orders || []).map((o: any) => ({
          id: o.id,
          created_at: o.created_at,
          status: o.status,
          total: o.total_amount,
          items: (o.order_items || []).map((i: any) => ({
            name: i.product?.name ?? 'Product',
            image: (Array.isArray(i.product?.images) && i.product?.images[0]) ? i.product.images[0] : '/perfume-logo.png',
            quantity: i.quantity,
            price: i.price,
          })),
        }));
        setOrders(mapped);

      } catch (e: any) {
        setError(e?.message ?? 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await stackApp.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      {/* Premium Hero Section - Mobile Optimized */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="mb-4 sm:mb-6 inline-block">
            <span className="text-amber-400 text-xs sm:text-sm font-semibold tracking-widest">WELCOME BACK</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-wider text-white mb-3 sm:mb-4 leading-tight">
            My Account
          </h1>
          <p className="text-lg sm:text-xl text-gray-100 tracking-wide font-light">
            {user.firstName} {user.lastName}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mr-3">
                  <User className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>

              <nav className="space-y-2">
                <a
                  href="#orders"
                  className="flex items-center px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  <Package className="h-4 w-4 mr-3" />
                  Order History
                </a>
              
                <a
                  href="#settings"
                  className="flex items-center px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </a>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Orders section */}
          <div className="lg:col-span-3">
            <section id="orders" className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Order History</h2>
                  {loading ? (
                    <p className="text-slate-600 dark:text-gray-400">Loading orders...</p>
                  ) : error ? (
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                  ) : orders.length === 0 ? (
                    <p className="text-slate-600 dark:text-gray-400">No orders yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-slate-600 dark:text-gray-400">Order ID</p>
                              <p className="font-semibold text-slate-900 dark:text-white">{order.id}</p>
                            </div>
                            <div>
                              <span className={`px-2 py-1 rounded text-xs ${statusColors[order.status as keyof typeof statusColors] || 'bg-slate-100 text-slate-800'}`}>{order.status}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-slate-600 dark:text-gray-400">Total</p>
                              <p className="font-semibold text-slate-900 dark:text-white">{formatPrice(order.total)}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-3 overflow-x-auto">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-2 min-w-[220px]">
                                <img src={it.image} alt={it.name} className="h-10 w-10 object-cover rounded" />
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">{it.name}</p>
                                  <p className="text-xs text-slate-600 dark:text-gray-400">{it.quantity} × {formatPrice(it.price)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}