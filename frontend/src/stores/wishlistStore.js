import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'
import toast from 'react-hot-toast'

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      // Get wishlist from API
      fetchWishlist: async () => {
        set({ isLoading: true })
        try {
          const response = await api.get('/wishlist')
          set({ items: response.data.items || [], isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          console.error('Failed to fetch wishlist:', error)
        }
      },

      // Add item to wishlist
      addToWishlist: async (productId) => {
        try {
          const response = await api.post('/wishlist', { productId })
          set({ items: response.data.items })
          toast.success('Added to wishlist!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to add to wishlist'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Remove item from wishlist
      removeFromWishlist: async (itemId) => {
        try {
          const response = await api.delete(`/wishlist/${itemId}`)
          set({ items: response.data.items })
          toast.success('Removed from wishlist!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to remove from wishlist'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Clear wishlist
      clearWishlist: async () => {
        try {
          await api.delete('/wishlist')
          set({ items: [] })
          toast.success('Wishlist cleared!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to clear wishlist'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Move item to cart
      moveToCart: async (itemId) => {
        try {
          const response = await api.post(`/wishlist/move-to-cart`, { itemId })
          set({ items: response.data.items })
          toast.success('Moved to cart!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to move to cart'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Check if product is in wishlist
      isInWishlist: (productId) => {
        const { items } = get()
        return items.some(item => item.product._id === productId)
      },

      // Get wishlist item count
      getItemCount: () => {
        const { items } = get()
        return items.length
      },

      // Get wishlist item by product ID
      getWishlistItem: (productId) => {
        const { items } = get()
        return items.find(item => item.product._id === productId)
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)

export default useWishlistStore
