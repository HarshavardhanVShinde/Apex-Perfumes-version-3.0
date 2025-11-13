"use client";
import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CreditCard, Lock, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { checkoutSchema, type CheckoutForm } from '@/lib/schema';
import { formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { createOrder, updatePaymentStatus } from '@/lib/supabase/orders';

// Helper to dynamically load Razorpay script
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function Checkout() {
  const router = useRouter();
  const { items, getSubtotal, getTax, getTotal, clearCart, openCart } = useCartStore();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    }
  });

  const shipping = getSubtotal() >= 100 ? 0 : 15;
  const finalTotal = getTotal() + shipping;

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) {
        alert('Please log in to place an order.');
        router.push('/auth/login');
        return;
      }

      // Prepare amount (in paise for Razorpay)
      const total = getTotal() + (getSubtotal() >= 100 ? 0 : 15);
      const amountPaise = Math.round(total * 100);

      // Create Razorpay order via server
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountPaise, currency: 'INR' })
      });
      if (!res.ok) {
        const details = await res.json().catch(() => ({}));
        console.error('Razorpay order error', details);
        alert('Failed to initialize payment. Please try again.');
        return;
      }
      const rpOrder = await res.json();

      // Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert('Failed to load payment SDK. Check your connection.');
        return;
      }

      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!key) {
        alert('Payment configuration missing. Please contact support.');
        return;
      }

      const options: any = {
        key,
        amount: amountPaise,
        currency: 'INR',
        name: 'Aura Essence Fragrances',
        description: 'Order Payment',
        order_id: rpOrder.id,
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
        },
        notes: {
          address: `${data.address}, ${data.city}, ${data.state} ${data.zipCode}, ${data.country}`,
        },
        theme: { color: '#C9A227' },
        handler: async (response: any) => {
          try {
            // Persist order after successful payment
            const created = await createOrder({
              userId: authUser.id,
              cartItems: items.map(i => ({
                product_id: i.product.id,
                quantity: i.quantity,
                price: i.product.price,
              })),
              totalAmount: total,
              shippingAddress: {
                fullName: `${data.firstName} ${data.lastName}`,
                address: data.address,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                country: data.country,
              },
              paymentMethod: 'razorpay',
            });

            // Mark payment as paid
            await updatePaymentStatus(created.id, 'paid');

            alert('Payment successful! Your order has been placed.');
            router.push('/account');
          } catch (e) {
            console.error('Failed to persist order after payment', e);
            alert('Payment succeeded, but order saving failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            alert('Payment cancelled. You can try again.');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Unexpected error during checkout.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <div className="inline-block bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 p-8 rounded-full">
              <ShoppingBag className="h-16 w-16 text-amber-500 mx-auto opacity-75" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-xl text-slate-600 dark:text-gray-300 mb-8">
            Add items to your cart before proceeding to checkout
          </p>
          <Button size="lg" asChild className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-lg">
            <Link href="/collections/men">Browse Collections</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleBackToCart = useCallback(() => {
    openCart();
  }, [openCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-12">
          <Button
            type="button"
            variant="ghost"
            className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            onClick={handleBackToCart}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div>
            <div className="mb-8">
              <span className="text-amber-600 dark:text-amber-400 text-sm font-semibold tracking-widest uppercase">Secure Checkout</span>
              <h1 className="text-5xl font-bold text-slate-900 dark:text-white mt-2">
                Shipping Details
              </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-semibold text-primary-950 dark:text-neutral-100 mb-4">
                  Contact Information
                </h2>
                <Input
                  label="Email Address"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-lg font-semibold text-primary-950 dark:text-neutral-100 mb-4">
                  Shipping Address
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    {...register('firstName')}
                    error={errors.firstName?.message}
                  />
                  <Input
                    label="Last Name"
                    {...register('lastName')}
                    error={errors.lastName?.message}
                  />
                </div>
                <div className="mt-4 space-y-4">
                  <Input
                    label="Address"
                    {...register('address')}
                    error={errors.address?.message}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      {...register('city')}
                      error={errors.city?.message}
                    />
                    <Input
                      label="State"
                      {...register('state')}
                      error={errors.state?.message}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="ZIP Code"
                      {...register('zipCode')}
                      error={errors.zipCode?.message}
                    />
                    <Input
                      label="Country"
                      {...register('country')}
                      error={errors.country?.message}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method (Mock) */}
              <div>
                <h2 className="text-lg font-semibold text-primary-950 dark:text-neutral-100 mb-4">
                  Payment Method
                </h2>
                <div className="bg-neutral-50 dark:bg-primary-900 p-6 rounded-lg border border-primary-200 dark:border-primary-800">
                  <div className="flex items-center mb-4">
                    <CreditCard className="h-5 w-5 text-primary-600 dark:text-neutral-400 mr-2" />
                    <span className="text-primary-900 dark:text-neutral-100">Credit Card</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      disabled
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Expiry Date"
                        placeholder="MM/YY"
                        disabled
                      />
                      <Input
                        label="CVV"
                        placeholder="123"
                        disabled
                      />
                    </div>
                  </div>
                  <p className="text-sm text-primary-600 dark:text-neutral-400 mt-3 flex items-center">
                    <Lock className="h-4 w-4 mr-1" />
                    This is a demo. No real payment will be processed.
                  </p>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : `Place Order - ${formatPrice(finalTotal)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white dark:bg-primary-900 rounded-lg p-6 shadow-sm border border-primary-100 dark:border-primary-800 sticky top-8">
              <h2 className="text-xl font-semibold text-primary-950 dark:text-neutral-100 mb-6">
                Order Summary
              </h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-primary-950 dark:text-neutral-100 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-primary-600 dark:text-neutral-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-primary-950 dark:text-neutral-100">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-primary-600 dark:text-neutral-400">Subtotal</span>
                  <span className="text-primary-950 dark:text-neutral-100">
                    {formatPrice(getSubtotal())}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-primary-600 dark:text-neutral-400">Tax</span>
                  <span className="text-primary-950 dark:text-neutral-100">
                    {formatPrice(getTax())}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-primary-600 dark:text-neutral-400">Shipping</span>
                  <span className="text-primary-950 dark:text-neutral-100">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                
                <div className="border-t border-primary-200 dark:border-primary-800 pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-primary-950 dark:text-neutral-100">Total</span>
                    <span className="text-primary-950 dark:text-neutral-100">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="text-center text-sm text-primary-600 dark:text-neutral-400">
                <Lock className="h-4 w-4 inline mr-1" />
                Your payment information is secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
