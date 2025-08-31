import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'
import toast from 'react-hot-toast'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      // Get cart from API
      fetchCart: async () => {
        set({ isLoading: true })
        try {
          const response = await api.get('/cart')
          set({ items: response.data.items || [], isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          console.error('Failed to fetch cart:', error)
        }
      },

      // Add item to cart
      addToCart: async (productId, quantity = 1) => {
        try {
          const response = await api.post('/cart', { productId, quantity })
          set({ items: response.data.items })
          toast.success('Added to cart!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to add to cart'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Update cart item quantity
      updateQuantity: async (itemId, quantity) => {
        try {
          const response = await api.put(`/cart/${itemId}`, { quantity })
          set({ items: response.data.items })
          toast.success('Cart updated!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to update cart'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Remove item from cart
      removeFromCart: async (itemId) => {
        try {
          const response = await api.delete(`/cart/${itemId}`)
          set({ items: response.data.items })
          toast.success('Item removed from cart!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to remove item'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Clear cart
      clearCart: async () => {
        try {
          await api.delete('/cart')
          set({ items: [] })
          toast.success('Cart cleared!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to clear cart'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Move item to wishlist
      moveToWishlist: async (itemId) => {
        try {
          const response = await api.post(`/cart/move-to-wishlist`, { itemId })
          set({ items: response.data.items })
          toast.success('Moved to wishlist!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to move to wishlist'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Calculate cart totals
      getCartTotals: () => {
        const { items } = get()
        const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        const shipping = subtotal > 100 ? 0 : 10
        const tax = subtotal * 0.08 // 8% tax
        const total = subtotal + shipping + tax

        return {
          subtotal: parseFloat(subtotal.toFixed(2)),
          shipping: parseFloat(shipping.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
        }
      },

      // Get cart item count
      getItemCount: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.quantity, 0)
      },

      // Check if product is in cart
      isInCart: (productId) => {
        const { items } = get()
        return items.some(item => item.product._id === productId)
      },

      // Get cart item by product ID
      getCartItem: (productId) => {
        const { items } = get()
        return items.find(item => item.product._id === productId)
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)

export default useCartStore
