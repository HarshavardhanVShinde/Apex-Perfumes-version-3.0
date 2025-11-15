"use client";
import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CreditCard, Lock, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { useUser, useStackApp } from '@stackframe/stack';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { checkoutSchema, type CheckoutForm } from '@/lib/schema';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

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
  const stackUser = useUser();
  const stackApp = useStackApp();
  
  const user = stackUser ? {
    id: stackUser.id,
    email: stackUser.primaryEmail || '',
    firstName: stackUser.displayName?.split(' ')[0] || '',
    lastName: stackUser.displayName?.split(' ').slice(1).join(' ') || '',
  } : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      phone: '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    }
  });

  const COD_CHARGE = 49;
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const shipping = getSubtotal() >= 100 ? 0 : 15;
  const baseTotal = getTotal() + shipping;
  const finalTotal = useMemo(() => baseTotal + (paymentMethod === 'cod' ? COD_CHARGE : 0), [baseTotal, paymentMethod]);

  const onSubmit = async (data: CheckoutForm) => {
    try {
      if (!stackUser) {
        alert('Please log in to place an order.');
        router.push('/handler/sign-in');
        return;
      }
      // Build order payload
      const orderItems = items.map(it => ({
        name: it.product.name,
        sku: it.product.id,
        units: it.quantity,
        selling_price: it.unitPrice ?? it.product.price,
      }));
      const shippingDetails = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: data.phone || '',
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.zipCode,
        country: data.country || 'India',
      };

      if (paymentMethod === 'cod') {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: 'cod',
            amount: baseTotal,
            finalAmount: finalTotal,
            items: orderItems,
            shipping: shippingDetails,
          })
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          console.error('COD order error', json);
          alert(json?.error || 'Failed to place COD order.');
          return;
        }
        await clearCart();
        alert(`COD order placed. Payable ₹${finalTotal}.`);
        router.push('/account');
        return;
      }

      // Online: create Razorpay order via unified /api/orders
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'online',
          amount: baseTotal, // no COD charge for prepaid
          items: orderItems,
          shipping: shippingDetails,
        })
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.razorpayOrder) {
        console.error('Order init error', json);
        alert(json?.error || 'Failed to initialize online payment.');
        return;
      }

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

      const amountPaise = Math.round(baseTotal * 100);
      const rzp = new (window as any).Razorpay({
        key,
        amount: amountPaise,
        currency: 'INR',
        name: 'Aura Élixir',
        description: 'Order Payment',
        order_id: json.razorpayOrder.id,
        prefill: { name: shippingDetails.name, email: shippingDetails.email },
        notes: { address: `${data.address}, ${data.city}, ${data.state} ${data.zipCode}, ${data.country}` },
        theme: { color: '#C9A227' },
        handler: async (response: any) => {
          try {
            // Verify payment and fulfill via Shiprocket as prepaid
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderMeta: { items: orderItems, shipping: shippingDetails, amount: baseTotal },
              })
            });
            const verifyJson = await verifyRes.json();
            if (!verifyRes.ok || !verifyJson.success) {
              console.error('Verify error', verifyJson);
              alert('Payment verified, but fulfillment failed. Contact support.');
              return;
            }
            await clearCart();
            alert('Payment successful! Your order has been placed.');
            router.push('/account');
          } catch (e) {
            console.error('Post-payment error', e);
            alert('Payment succeeded, but order saving failed. Please contact support.');
          }
        },
        modal: { ondismiss: () => { alert('Payment cancelled. You can try again.'); } }
      });
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Unexpected error during checkout.');
    }
  };
  const handleBackToCart = useCallback(() => {
    openCart();
  }, [openCart]);

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 py-8 sm:py-10 md:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center mb-8 sm:mb-10 md:mb-12">
          <Button
            type="button"
            variant="ghost"
            className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 min-h-[48px] px-4 sm:px-6"
            onClick={handleBackToCart}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
          {/* Checkout Form - Mobile Enhanced */}
          <div>
            <div className="mb-6 sm:mb-8">
              <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold tracking-widest uppercase">Secure Checkout</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-2 leading-tight">
                Shipping Details
              </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
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
                <div className="mt-4">
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="10-digit mobile"
                    {...register('phone')}
                    error={errors.phone?.message}
                  />
                </div>
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

              {/* Payment Method (Online / COD) */}
              <div>
                <h2 className="text-lg font-semibold text-primary-950 dark:text-neutral-100 mb-4">Payment Method</h2>
                <div className="bg-neutral-50 dark:bg-primary-900 p-6 rounded-lg border border-primary-200 dark:border-primary-800 space-y-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                    />
                    <span>Pay Online (UPI / Card)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <span>Cash on Delivery (₹{COD_CHARGE} extra)</span>
                  </label>
                  {paymentMethod === 'cod' && (
                    <p className="text-xs text-amber-600">COD Charge: ₹{COD_CHARGE} added</p>
                  )}
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : `Place Order - ${formatPrice(finalTotal)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 sticky top-8">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
                Order Summary
              </h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={48}
                      height={48}
                      className="object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-slate-900 dark:text-white">
                    {formatPrice(getSubtotal())}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-gray-400">Tax</span>
                  <span className="text-slate-900 dark:text-white">
                    {formatPrice(getTax())}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-gray-400">Shipping</span>
                  <span className="text-slate-900 dark:text-white">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>COD Charge</span>
                    <span>+ {formatPrice(COD_CHARGE)}</span>
                  </div>
                )}
                
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-slate-900 dark:text-white">Total</span>
                    <span className="text-slate-900 dark:text-white">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="text-center text-sm text-slate-600 dark:text-gray-400">
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
