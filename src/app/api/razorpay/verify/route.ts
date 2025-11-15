import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createShiprocketOrder } from '@/lib/shiprocket';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderMeta } = body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: 'Missing Razorpay key secret' }, { status: 500 });
    }

    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Payment verified -> create Shiprocket PREPAID order
    const { items, shipping, amount } = orderMeta || {};
    if (!items || !shipping || !amount) {
      return NextResponse.json({ error: 'Missing order meta for fulfillment' }, { status: 400 });
    }

    const shiprocketOrder = await createShiprocketOrder({
      payment_method: 'Prepaid',
      cod_amount: 0,
      order_amount: amount,
      items,
      customer: shipping,
    });

    return NextResponse.json({ success: true, shiprocketOrder });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Verification failed' }, { status: 500 });
  }
}
