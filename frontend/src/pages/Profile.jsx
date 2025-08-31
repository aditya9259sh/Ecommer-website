import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X,
  Plus,
  Trash2,
  Star
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import useAuthStore from '../stores/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  
  const { user, updateProfile, changePassword } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm()

  useEffect(() => {
    fetchAddresses()
    if (user) {
      setValue('name', user.name || '')
      setValue('email', user.email || '')
      setValue('phone', user.phone || '')
    }
  }, [user, setValue])

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses')
      setAddresses(response.data.addresses || [])
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const onSubmitProfile = async (data) => {
    setIsLoading(true)
    try {
      const result = await updateProfile(data)
      if (result.success) {
        setIsEditing(false)
        reset(data)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitPassword = async (data) => {
    setIsLoading(true)
    try {
      const result = await changePassword(data)
      if (result.success) {
        reset()
      }
    } catch (error) {
      console.error('Error changing password:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAddress = async (data) => {
    try {
      await api.post('/users/addresses', data)
      toast.success('Address added successfully!')
      setShowAddressForm(false)
      fetchAddresses()
      reset()
    } catch (error) {
      toast.error('Failed to add address')
    }
  }

  const handleUpdateAddress = async (addressId, data) => {
    try {
      await api.put(`/users/addresses/${addressId}`, data)
      toast.success('Address updated successfully!')
      setEditingAddress(null)
      fetchAddresses()
      reset()
    } catch (error) {
      toast.error('Failed to update address')
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await api.delete(`/users/addresses/${addressId}`)
        toast.success('Address deleted successfully!')
        fetchAddresses()
      } catch (error) {
        toast.error('Failed to delete address')
      }
    }
  }

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await api.put(`/users/addresses/${addressId}/default`)
      toast.success('Default address updated!')
      fetchAddresses()
    } catch (error) {
      toast.error('Failed to update default address')
    }
  }

  const openAddressForm = (address = null) => {
    if (address) {
      setEditingAddress(address)
      setValue('street', address.street)
      setValue('city', address.city)
      setValue('state', address.state)
      setValue('zipCode', address.zipCode)
      setValue('country', address.country)
      setValue('isDefault', address.isDefault)
    } else {
      setEditingAddress(null)
      reset()
    }
    setShowAddressForm(true)
  }

  const closeAddressForm = () => {
    setShowAddressForm(false)
    setEditingAddress(null)
    reset()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-primary-600 hover:text-primary-700 transition-colors"
                >
                  {isEditing ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('name', { required: 'Name is required' })}
                      disabled={!isEditing}
                      className={`input pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      disabled={!isEditing}
                      className={`input pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('phone', { required: 'Phone is required' })}
                      disabled={!isEditing}
                      className={`input pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                {isEditing && (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </form>
            </motion.div>

            {/* Change Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
              
              <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    {...register('currentPassword', { required: 'Current password is required' })}
                    className="input"
                  />
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    {...register('newPassword', { 
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className="input"
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: (value) => {
                        const newPassword = watch('newPassword')
                        return value === newPassword || 'Passwords do not match'
                      }
                    })}
                    className="input"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Addresses */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Addresses</h2>
                <button
                  onClick={() => openAddressForm()}
                  className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Address</span>
                </button>
              </div>

              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {address.isDefault && (
                            <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 font-medium">{address.street}</p>
                        <p className="text-gray-600">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-gray-600">{address.country}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address._id)}
                            className="text-primary-600 hover:text-primary-700 transition-colors"
                            title="Set as default"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openAddressForm(address)}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                          title="Edit address"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address._id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {addresses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No addresses added yet</p>
                    <p className="text-sm">Add your first address to get started</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Address Form Modal */}
        {showAddressForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                  onClick={closeAddressForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(editingAddress ? 
                (data) => handleUpdateAddress(editingAddress._id, data) : 
                handleAddAddress
              )} className="space-y-4">
                <div>
                  <label className="label">Street Address</label>
                  <input
                    {...register('street', { required: 'Street address is required' })}
                    className="input"
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">City</label>
                    <input
                      {...register('city', { required: 'City is required' })}
                      className="input"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <input
                      {...register('state', { required: 'State is required' })}
                      className="input"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">ZIP Code</label>
                    <input
                      {...register('zipCode', { required: 'ZIP code is required' })}
                      className="input"
                      placeholder="12345"
                    />
                  </div>
                  <div>
                    <label className="label">Country</label>
                    <input
                      {...register('country', { required: 'Country is required' })}
                      className="input"
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    {...register('isDefault')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={closeAddressForm}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingAddress ? 'Update' : 'Add'} Address
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
