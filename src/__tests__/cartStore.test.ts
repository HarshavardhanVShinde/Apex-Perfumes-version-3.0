import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/stores/cart'

describe('cart store', () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [],
      totals: { subtotal: 0, discount: 0, total: 0, promotionText: null },
    })
  })

  it('computes item count', () => {
    useCartStore.setState({ items: [
      { id: '1', product: { id: 'p1', name: 'A', brand: 'B', price: 10, images: [''], category: 'men', type: 'EDP', notes: { top: [], heart: [], base: [] }, longevity: 0, sillage: 'moderate', rating: 0, stock: 0, description: '', isNew: false, isBestSeller: false, isOnSale: false }, quantity: 2, selectedSize: '100ml', unitPrice: 10, lineTotal: 20 },
      { id: '2', product: { id: 'p2', name: 'C', brand: 'D', price: 5, images: [''], category: 'women', type: 'EDP', notes: { top: [], heart: [], base: [] }, longevity: 0, sillage: 'moderate', rating: 0, stock: 0, description: '', isNew: false, isBestSeller: false, isOnSale: false }, quantity: 1, selectedSize: '50ml', unitPrice: 5, lineTotal: 5 },
    ]})
    expect(useCartStore.getState().getItemCount()).toBe(3)
  })

  it('computes totals from state', () => {
    useCartStore.setState({ totals: { subtotal: 100, discount: 10, total: 90, promotionText: 'Promo' } })
    expect(useCartStore.getState().getSubtotal()).toBe(100)
    expect(useCartStore.getState().getTotal()).toBe(90)
  })
})