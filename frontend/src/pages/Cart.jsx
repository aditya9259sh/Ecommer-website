import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trash2, 
  Heart, 
  ShoppingBag, 
  ArrowLeft, 
  Minus, 
  Plus,
  CreditCard,
  Truck,
  Shield
} from 'lucide-react'
import useCartStore from '../stores/cartStore'
import useWishlistStore from '../stores/wishlistStore'

const Cart = () => {
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  
  const { 
    items, 
    fetchCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    moveToWishlist,
    getCartTotals,
    isLoading: cartLoading 
  } = useCartStore()
  
  const { addToWishlist } = useWishlistStore()

  useEffect(() => {
    fetchCart()
    setIsLoading(false)
  }, [fetchCart])

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    await updateQuantity(itemId, newQuantity)
  }

  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId)
  }

  const handleMoveToWishlist = async (itemId) => {
    await moveToWishlist(itemId)
  }

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart()
    }
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (isLoading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-gray-400 mb-6">
              <ShoppingBag className="h-24 w-24 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Start Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totals = getCartTotals()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Cart Items ({items.length})
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-6"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.product.images[0] || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-1">
                                {item.product.name}
                              </h3>
                              <p className="text-sm text-gray-500 mb-2">
                                {item.product.description}
                              </p>
                              <div className="flex items-center space-x-4">
                                <span className="text-lg font-bold text-primary-600">
                                  ${item.product.price}
                                </span>
                                {item.product.originalPrice > item.product.price && (
                                  <span className="text-sm text-gray-500 line-through">
                                    ${item.product.originalPrice}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-4 mt-4">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-4 py-2 text-gray-900 font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <span className="text-sm text-gray-500">
                              {item.product.stock} available
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleMoveToWishlist(item._id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Move to Wishlist"
                          >
                            <Heart className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove Item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Summary Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${totals.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {totals.shipping === 0 ? 'Free' : `$${totals.shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${totals.tax}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary-600">${totals.total}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition-colors mb-4"
              >
                Proceed to Checkout
              </button>

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="block w-full text-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                Continue Shopping
              </Link>

              {/* Features */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Truck className="h-4 w-4 text-green-500" />
                  <span>Free Shipping on Orders Over $100</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4 text-green-500" />
                  <span>Multiple Payment Options</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
