import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'
import toast from 'react-hot-toast'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Login
      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', credentials)
          const { user, token } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          toast.success('Login successful!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Login failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Register
      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', userData)
          const { user, token } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          toast.success('Registration successful!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Registration failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        
        // Remove token from API headers
        delete api.defaults.headers.common['Authorization']
        
        toast.success('Logged out successfully')
      },

      // Check authentication status
      checkAuth: async () => {
        const token = get().token
        if (!token) return

        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await api.get('/auth/me')
          set({
            user: response.data.user,
            isAuthenticated: true,
          })
        } catch (error) {
          // Token is invalid, clear auth state
          get().logout()
        }
      },

      // Update user profile
      updateProfile: async (profileData) => {
        try {
          const response = await api.put('/users/profile', profileData)
          set({ user: response.data.user })
          toast.success('Profile updated successfully!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Profile update failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Change password
      changePassword: async (passwordData) => {
        try {
          await api.put('/users/change-password', passwordData)
          toast.success('Password changed successfully!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Password change failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)

export default useAuthStore
