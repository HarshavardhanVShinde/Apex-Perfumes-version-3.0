import { NextRequest, NextResponse } from 'next/server';
import { createShiprocketOrder } from '@/lib/shiprocket';

const COD_CHARGE = 49;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      paymentMethod, // 'online' | 'cod'
      amount,        // cart total before COD
      finalAmount,   // cart total after adding COD if applicable
      items,         // [{ name, units, selling_price, sku? }]
      shipping,      // { name, email, phone, address, city, state, pincode, country? }
      // userId,     // optional, if you want to persist
    } = body || {};

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!shipping || !shipping.name || !shipping.address || !shipping.city || !shipping.state || !shipping.pincode || !shipping.phone || !shipping.email) {
      return NextResponse.json({ error: 'Missing shipping details' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    if (paymentMethod === 'cod') {
      const codFinal = typeof finalAmount === 'number' ? finalAmount : amount + COD_CHARGE;
      const shiprocketOrder = await createShiprocketOrder({
        payment_method: 'COD',
        cod_amount: codFinal,
        order_amount: codFinal,
        items,
        customer: shipping,
      });

      return NextResponse.json({ success: true, cod: true, finalAmount: codFinal, shiprocketOrder });
    }

    // Online: create Razorpay order (amount in paise)
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Missing Razorpay credentials' }, { status: 500 });
    }
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const payload = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { source: 'aura-elixir' },
      payment_capture: 1,
    };

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: 'Failed to create Razorpay order', details: errText }, { status: 502 });
    }
    const razorpayOrder = await res.json();

    // Return order along with passthrough meta to verify step
    return NextResponse.json({
      success: true,
      cod: false,
      razorpayOrder,
      orderMeta: { items, shipping, amount },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
import { stackServerApp } from '@/stack/server';
import { getUserOrders } from '@/lib/neon/orders';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status') || undefined;
    const startDate = url.searchParams.get('startDate') || undefined;
    const endDate = url.searchParams.get('endDate') || undefined;

    const result = await getUserOrders(user.id, { page, limit, status, startDate, endDate });

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // User-specific; do not cache publicly
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ error: err?.message || 'Failed to fetch orders' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
