import { sql } from './db';
import { clearCart } from './cart';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address: any;
  payment_method: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: Array<OrderItem & {
    product: {
      name: string;
      images: string[];
      brand: string;
    };
  }>;
}

export interface CreateOrderData {
  userId: string;
  cartItems: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
}

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Create a new order
export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  const { userId, cartItems, totalAmount, shippingAddress, paymentMethod } = orderData;

  // Create the order
  const orderResult = await sql`
    INSERT INTO public.orders (user_id, total_amount, shipping_address, payment_method, status, payment_status)
    VALUES (
      ${userId}::text,
      ${totalAmount}::numeric,
      ${JSON.stringify(shippingAddress)}::jsonb,
      ${paymentMethod}::text,
      'pending',
      'pending'
    )
    RETURNING *
  `;

  if (orderResult.length === 0) {
    throw new Error('Failed to create order');
  }

  const order = orderResult[0];

  // Create order items
  const orderItemsData = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));

  try {
    for (const item of orderItemsData) {
      await sql`
        INSERT INTO public.order_items (order_id, product_id, quantity, price)
        VALUES (
          ${item.order_id}::uuid,
          ${item.product_id}::uuid,
          ${item.quantity}::integer,
          ${item.price}::numeric
        )
      `;
    }

    // Update product stock
    for (const item of cartItems) {
      await sql`
        SELECT public.update_product_stock(
          ${item.product_id}::uuid,
          ${item.quantity}::integer
        )
      `;
    }

    // Clear the user's cart
    await clearCart(userId);

    return mapOrder(order);
  } catch (error) {
    // Rollback: delete the order if items creation fails
    await sql`DELETE FROM public.orders WHERE id = ${order.id}::uuid`;
    throw error;
  }
}

// Get user's order history
export async function getUserOrders(
  userId: string,
  filters: OrderFilters = {}
): Promise<{
  orders: OrderWithItems[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const { page = 1, limit = 10, status, startDate, endDate } = filters;
  const offset = (page - 1) * limit;

  // Build WHERE clause with parameterization
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  conditions.push(`user_id = $${paramIndex++}`);
  params.push(userId);

  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    params.push(status);
  }
  if (startDate) {
    conditions.push(`created_at >= $${paramIndex++}`);
    params.push(startDate);
  }
  if (endDate) {
    conditions.push(`created_at <= $${paramIndex++}`);
    params.push(endDate);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Count total
  const countQuery = `
    SELECT COUNT(*)::integer AS total
    FROM public.orders
    ${whereClause}
  `;
  const countResult = await sql(countQuery, params);
  const total = countResult[0]?.total || 0;

  // Fetch orders
  const ordersQuery = `
    SELECT * FROM public.orders
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex++}
    OFFSET $${paramIndex++}
  `;
  const orders = await sql(ordersQuery, [...params, limit, offset]);

  // Fetch order items for each order
  const ordersWithItems: OrderWithItems[] = [];
  for (const order of orders) {
    const items = await sql`
      SELECT
        oi.*,
        p.name AS product_name,
        p.images AS product_images,
        p.brand AS product_brand
      FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = ${order.id}::uuid
    `;

    ordersWithItems.push({
      ...mapOrder(order),
      order_items: items.map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: parseFloat(item.price),
        created_at: item.created_at,
        product: {
          name: item.product_name,
          images: item.product_images,
          brand: item.product_brand,
        },
      })),
    });
  }

  const totalPages = Math.ceil(total / limit);

  return {
    orders: ordersWithItems,
    total,
    page,
    totalPages,
  };
}

// Get a single order by ID
export async function getOrder(orderId: string, userId: string): Promise<OrderWithItems | null> {
  const orders = await sql`
    SELECT * FROM public.orders
    WHERE id = ${orderId}::uuid AND user_id = ${userId}
  `;

  if (orders.length === 0) {
    return null;
  }

  const order = orders[0];

  const items = await sql`
    SELECT
      oi.*,
      p.name AS product_name,
      p.images AS product_images,
      p.brand AS product_brand
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = ${orderId}::uuid
  `;

  return {
    ...mapOrder(order),
    order_items: items.map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: parseFloat(item.price),
      created_at: item.created_at,
      product: {
        name: item.product_name,
        images: item.product_images,
        brand: item.product_brand,
      },
    })),
  };
}

// Update order status (admin function)
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
): Promise<Order> {
  const result = await sql`
    UPDATE public.orders
    SET status = ${status}, updated_at = now()
    WHERE id = ${orderId}::uuid
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error('Order not found');
  }

  return mapOrder(result[0]);
}

// Update payment status (admin function)
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
): Promise<Order> {
  const result = await sql`
    UPDATE public.orders
    SET payment_status = ${paymentStatus}, updated_at = now()
    WHERE id = ${orderId}::uuid
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error('Order not found');
  }

  return mapOrder(result[0]);
}

// Cancel order
export async function cancelOrder(orderId: string, userId: string): Promise<Order> {
  const orders = await sql`
    SELECT status FROM public.orders
    WHERE id = ${orderId}::uuid AND user_id = ${userId}
  `;

  if (orders.length === 0) {
    throw new Error('Order not found');
  }

  const status = orders[0].status;

  if (status === 'shipped' || status === 'delivered') {
    throw new Error('Cannot cancel shipped or delivered orders');
  }

  const result = await sql`
    UPDATE public.orders
    SET status = 'cancelled', updated_at = now()
    WHERE id = ${orderId}::uuid AND user_id = ${userId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error('Failed to cancel order');
  }

  return mapOrder(result[0]);
}

// Get order statistics (admin function)
export async function getOrderStats(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
}> {
  const result = await sql`
    SELECT
      COUNT(*)::integer AS total_orders,
      COALESCE(SUM(total_amount), 0)::numeric AS total_revenue,
      COUNT(CASE WHEN status = 'pending' THEN 1 END)::integer AS pending_orders,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END)::integer AS completed_orders
    FROM public.orders
  `;

  const stats = result[0];
  const totalOrders = stats.total_orders || 0;
  const totalRevenue = parseFloat(stats.total_revenue) || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalOrders,
    totalRevenue,
    pendingOrders: stats.pending_orders || 0,
    completedOrders: stats.completed_orders || 0,
    averageOrderValue,
  };
}

// Search orders (admin function)
export async function searchOrders(query: string, limit: number = 20): Promise<OrderWithItems[]> {
  const searchTerm = `%${query}%`;

  const orders = await sql`
    SELECT o.*
    FROM public.orders o
    LEFT JOIN public.profiles p ON p.id = o.user_id
    WHERE o.id::text ILIKE ${searchTerm}
       OR p.first_name ILIKE ${searchTerm}
       OR p.last_name ILIKE ${searchTerm}
    ORDER BY o.created_at DESC
    LIMIT ${limit}
  `;

  const ordersWithItems: OrderWithItems[] = [];
  for (const order of orders) {
    const items = await sql`
      SELECT
        oi.*,
        p.name AS product_name,
        p.images AS product_images,
        p.brand AS product_brand
      FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = ${order.id}::uuid
    `;

    ordersWithItems.push({
      ...mapOrder(order),
      order_items: items.map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: parseFloat(item.price),
        created_at: item.created_at,
        product: {
          name: item.product_name,
          images: item.product_images,
          brand: item.product_brand,
        },
      })),
    });
  }

  return ordersWithItems;
}

// Helper to map DB row to Order type
function mapOrder(row: any): Order {
  return {
    id: row.id,
    user_id: row.user_id,
    total_amount: parseFloat(row.total_amount),
    status: row.status,
    shipping_address: row.shipping_address,
    payment_method: row.payment_method,
    payment_status: row.payment_status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
