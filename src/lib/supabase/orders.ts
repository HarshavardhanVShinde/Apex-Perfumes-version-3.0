import { supabase } from './client'
import { clearCart } from './cart'
import type { Database } from '@/types/supabase'

type Order = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderItem = Database['public']['Tables']['order_items']['Row']

export interface OrderWithItems extends Order {
  order_items: Array<OrderItem & {
    product: {
      name: string
      images: string[]
      brand: string
    }
  }>
}

export interface CreateOrderData {
  userId: string
  cartItems: Array<{
    product_id: string
    quantity: number
    price: number
  }>
  totalAmount: number
  shippingAddress: {
    fullName: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    phone?: string
  }
  paymentMethod: string
}

export interface OrderFilters {
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// Create a new order
export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  const { userId, cartItems, totalAmount, shippingAddress, paymentMethod } = orderData

  // Start a transaction by creating the order first
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total_amount: totalAmount,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      status: 'pending',
      payment_status: 'pending'
    })
    .select()
    .single()

  if (orderError) {
    throw orderError
  }

  // Create order items
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    // If order items creation fails, we should clean up the order
    await supabase.from('orders').delete().eq('id', order.id)
    throw itemsError
  }

  // Update product stock
  for (const item of cartItems) {
    const { error: stockError } = await supabase.rpc('update_product_stock', {
      product_id: item.product_id,
      quantity_sold: item.quantity
    })

    if (stockError) {
      console.error('Failed to update stock for product:', item.product_id, stockError)
      // Don't throw here as the order is already created
    }
  }

  // Clear the user's cart
  await clearCart(userId)

  return order
}

// Get user's order history
export async function getUserOrders(
  userId: string, 
  filters: OrderFilters = {}
): Promise<{
  orders: OrderWithItems[]
  total: number
  page: number
  totalPages: number
}> {
  const { page = 1, limit = 10 } = filters
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (
          name,
          images,
          brand
        )
      )
    `, { count: 'exact' })
    .eq('user_id', userId)

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate)
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate)
  }

  query = query
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    orders: data as OrderWithItems[] || [],
    total: count || 0,
    page,
    totalPages
  }
}

// Get a single order by ID
export async function getOrder(orderId: string, userId: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (
          name,
          images,
          brand
        )
      )
    `)
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Order not found
    }
    throw error
  }

  return data as OrderWithItems
}

// Update order status (admin function)
export async function updateOrderStatus(
  orderId: string, 
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Update payment status (admin function)
export async function updatePaymentStatus(
  orderId: string, 
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Cancel order
export async function cancelOrder(orderId: string, userId: string): Promise<Order> {
  // First check if order belongs to user and can be cancelled
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    throw fetchError
  }

  if (!order) {
    throw new Error('Order not found')
  }

  if (order.status === 'shipped' || order.status === 'delivered') {
    throw new Error('Cannot cancel shipped or delivered orders')
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Get order statistics (admin function)
export async function getOrderStats(): Promise<{
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
  averageOrderValue: number
}> {
  const { data, error } = await supabase
    .from('orders')
    .select('total_amount, status')

  if (error) {
    throw error
  }

  const orders = data || []
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const pendingOrders = orders.filter(order => order.status === 'pending').length
  const completedOrders = orders.filter(order => order.status === 'delivered').length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return {
    totalOrders,
    totalRevenue,
    pendingOrders,
    completedOrders,
    averageOrderValue
  }
}

// Search orders (admin function)
export async function searchOrders(
  query: string,
  limit: number = 20
): Promise<OrderWithItems[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (
          name,
          images,
          brand
        )
      ),
      profile:profiles (
        first_name,
        last_name
      )
    `)
    .or(`id.ilike.%${query}%,profile.first_name.ilike.%${query}%,profile.last_name.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return data as OrderWithItems[] || []
}