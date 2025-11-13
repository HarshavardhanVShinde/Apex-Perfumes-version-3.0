"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, Heart, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';

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
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = React.useState<OrderDisplay[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            status,
            total_amount,
            order_items (
              quantity,
              price,
              product:products (
                name,
                images,
                brand
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mapped: OrderDisplay[] = (data || []).map((o: any) => ({
          id: o.id,
          created_at: o.created_at,
          status: o.status,
          total: o.total_amount,
          items: (o.order_items || []).map((i: any) => ({
            name: i.product?.name ?? 'Product',
            image:
              (Array.isArray(i.product?.images) && i.product?.images[0])
                ? i.product.images[0]
                : 'https://via.placeholder.com/80x80.png?text=Image',
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

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-950 dark:text-neutral-100 mb-2">
            My Account
          </h1>
          <p className="text-primary-600 dark:text-neutral-400">
            Welcome back, {user.firstName}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-primary-900 rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center mr-3">
                  <User className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-950 dark:text-neutral-100">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-primary-600 dark:text-neutral-400">
                    {user.email}
                  </p>
                </div>
              </div>

              <nav className="space-y-2">
                <a
                  href="#orders"
                  className="flex items-center px-3 py-2 text-sm text-primary-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-md transition-colors"
                >
                  <Package className="h-4 w-4 mr-3" />
                  Order History
                </a>
              
                <a
                  href="#settings"
                  className="flex items-center px-3 py-2 text-sm text-primary-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-md transition-colors"
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

        </div>
      </div>
    </div>
  );
}