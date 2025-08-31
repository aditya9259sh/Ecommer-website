import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trash2, 
  Heart, 
  ShoppingCart, 
  ArrowLeft, 
  Star,
  Plus
} from 'lucide-react'
import useWishlistStore from '../stores/wishlistStore'
import useCartStore from '../stores/cartStore'

const Wishlist = () => {
  const [isLoading, setIsLoading] = useState(true)
  
  const { 
    items, 
    fetchWishlist, 
    removeFromWishlist, 
    clearWishlist,
    moveToCart,
    isLoading: wishlistLoading 
  } = useWishlistStore()
  
  const { addToCart } = useCartStore()

  useEffect(() => {
    fetchWishlist()
    setIsLoading(false)
  }, [fetchWishlist])

  const handleRemoveItem = async (itemId) => {
    await removeFromWishlist(itemId)
  }

  const handleMoveToCart = async (itemId) => {
    await moveToCart(itemId)
  }

  const handleAddToCart = async (productId) => {
    await addToCart(productId)
  }

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      await clearWishlist()
    }
  }

  if (isLoading || wishlistLoading) {
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
              <Heart className="h-24 w-24 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Start adding products you love to your wishlist.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">Save products you love for later</p>
        </div>

        {/* Wishlist Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Wishlist Items ({items.length})
              </h2>
              <button
                onClick={handleClearWishlist}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Clear Wishlist
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
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                            {item.product.description}
                          </p>
                          
                          {/* Rating */}
                          <div className="flex items-center mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(item.product.rating || 0)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-2">
                              ({item.product.reviewCount || 0})
                            </span>
                          </div>

                          {/* Price and Stock */}
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-primary-600">
                                ${item.product.price}
                              </span>
                              {item.product.originalPrice > item.product.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${item.product.originalPrice}
                                </span>
                              )}
                            </div>
                            {item.product.stock > 0 ? (
                              <span className="text-sm text-green-600 font-medium">
                                In Stock ({item.product.stock})
                              </span>
                            ) : (
                              <span className="text-sm text-red-600 font-medium">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      {item.product.stock > 0 ? (
                        <button
                          onClick={() => handleMoveToCart(item._id)}
                          className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>Move to Cart</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(item.product._id)}
                          className="inline-flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add to Cart</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="inline-flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Wishlist
