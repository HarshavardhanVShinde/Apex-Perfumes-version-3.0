const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1';

async function getShiprocketToken() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) {
    throw new Error('Missing Shiprocket credentials');
  }

  const res = await fetch(`${SHIPROCKET_BASE}/external/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    // Shiprocket API is stable; no cache
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket auth failed: ${text}`);
  }
  const json = await res.json();
  return json.token as string;
}

export interface ShiprocketOrderItem {
  name: string;
  sku?: string;
  units: number;
  selling_price: number;
}

export interface ShiprocketCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export async function createShiprocketOrder(opts: {
  payment_method: 'Prepaid' | 'COD';
  cod_amount: number;
  order_amount: number;
  items: ShiprocketOrderItem[];
  customer: ShiprocketCustomer;
}) {
  const token = await getShiprocketToken();

  const payload = {
    order_id: `AURA-${Date.now()}`,
    order_date: new Date().toISOString(),
    payment_method: opts.payment_method,
    billing_customer_name: opts.customer.name,
    billing_last_name: '',
    billing_address: opts.customer.address,
    billing_city: opts.customer.city,
    billing_pincode: opts.customer.pincode,
    billing_state: opts.customer.state,
    billing_country: opts.customer.country || 'India',
    billing_email: opts.customer.email,
    billing_phone: opts.customer.phone,
    shipping_is_billing: true,
    order_items: opts.items.map(i => ({
      name: i.name,
      sku: i.sku || i.name,
      units: i.units,
      selling_price: i.selling_price,
    })),
    sub_total: opts.order_amount,
    cod: opts.payment_method === 'COD' ? opts.cod_amount : 0,
  };

  const res = await fetch(`${SHIPROCKET_BASE}/external/orders/create/adhoc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket order failed: ${text}`);
  }

  return res.json();
}
