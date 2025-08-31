import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Star, ShoppingCart, Heart } from 'lucide-react'
import api from '../services/api'
import useCartStore from '../stores/cartStore'
import useWishlistStore from '../stores/wishlistStore'
import useAuthStore from '../stores/authStore'

// Mock data for when API is not available
const mockFeaturedProducts = [
  {
    _id: '1',
    name: 'Wireless Headphones',
    price: 99.99,
    originalPrice: 129.99,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
    rating: 4.5,
    reviewCount: 128,
    category: 'Electronics',
    discount: 0
  },
  {
    _id: '2',
    name: 'Smart Watch',
    price: 199.99,
    originalPrice: 249.99,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
    rating: 4.3,
    reviewCount: 89,
    category: 'Electronics',
    discount: 20
  },
  {
    _id: '3',
    name: 'Running Shoes',
    price: 79.99,
    originalPrice: 99.99,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
    rating: 4.7,
    reviewCount: 156,
    category: 'Sports',
    discount: 0
  },
  {
    _id: '4',
    name: 'Coffee Maker',
    price: 149.99,
    originalPrice: 179.99,
    images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400'],
    rating: 4.2,
    reviewCount: 67,
    category: 'Home',
    discount: 15
  }
]

const mockCategories = [
  { _id: '1', name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300' },
  { _id: '2', name: 'Fashion', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300' },
  { _id: '3', name: 'Home & Garden', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300' },
  { _id: '4', name: 'Sports', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300' }
]

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState(mockFeaturedProducts)
  const [categories, setCategories] = useState(mockCategories)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(true)
  
  const { isAuthenticated } = useAuthStore()
  const { addToCart } = useCartStore()
  const { addToWishlist, isInWishlist } = useWishlistStore()

  useEffect(() => {
    console.log('Home component mounted successfully')
    // Temporarily disable API calls to avoid white screen
    setIsLoading(false)
    setApiError(true)
    
    // Uncomment this when backend is ready
    /*
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/categories')
        ])
        
        setFeaturedProducts(productsRes.data.products || [])
        setCategories(categoriesRes.data.categories || [])
        setApiError(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        // Use mock data when API fails
        setFeaturedProducts(mockFeaturedProducts)
        setCategories(mockCategories)
        setApiError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    */
  }, [])

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      return
    }
    await addToCart(productId)
  }

  const handleAddToWishlist = async (productId) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      return
    }
    await addToWishlist(productId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* API Error Notice */}
      {/* {apiError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Demo Mode:</strong> Backend is not connected. Showing sample data for demonstration.
              </p>
            </div>
          </div>
        </div>
      )} */}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Welcome to E-Store
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto"
            >
              Discover amazing products with the best prices and quality. Shop with confidence and enjoy fast delivery.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/products"
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors inline-flex items-center space-x-2"
              >
                <span>Shop Now</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full"></div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of products organized by categories for easy browsing
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Link
                  to={`/products?category=${category._id}`}
                  className="block bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 group-hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-primary-200 group-hover:to-secondary-200 transition-colors">
                    <span className="text-2xl font-bold text-gradient">{category.name[0]}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {category.productCount || 0} products
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked products that our customers love
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <Link to={`/products/${product._id}`}>
                    <div className="relative overflow-hidden">
                      <img
                        src={product.images?.[0] || product.image || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                          -{product.discount}%
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        ({product.reviewCount || product.reviews || 0})
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-primary-600">
                          ${product.price}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </button>
                      <button
                        onClick={() => handleAddToWishlist(product._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isInWishlist(product._id)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              <span>View All Products</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose E-Store?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide the best shopping experience with quality products and excellent service
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Quality Products',
                description: 'All our products are carefully selected and tested for quality assurance.',
                icon: '✨'
              },
              {
                title: 'Fast Delivery',
                description: 'Get your orders delivered quickly with our efficient shipping network.',
                icon: '🚚'
              },
              {
                title: 'Secure Payments',
                description: 'Shop with confidence using our secure payment processing system.',
                icon: '🔒'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
