const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample categories
const categories = [
  {
    name: 'Electronics',
    description: 'Latest electronic devices and gadgets',
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
    isActive: true
  },
  {
    name: 'Clothing',
    description: 'Fashionable clothing for all occasions',
    slug: 'clothing',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    isActive: true
  },
  {
    name: 'Home & Garden',
    description: 'Everything for your home and garden',
    slug: 'home-garden',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    isActive: true
  },
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    slug: 'sports-outdoors',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    isActive: true
  },
  {
    name: 'Books',
    description: 'Books for all ages and interests',
    slug: 'books',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    isActive: true
  }
];

// Sample products
const products = [
  // Electronics
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and long battery life. Perfect for music lovers and professionals.',
    price: 89.99,
    stockQuantity: 50,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop'
    ],
    tags: ['wireless', 'bluetooth', 'noise-cancellation', 'headphones'],
    specifications: {
      'Battery Life': '20 hours',
      'Connectivity': 'Bluetooth 5.0',
      'Weight': '250g',
      'Color': 'Black'
    },
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Smartphone 128GB',
    description: 'Latest smartphone with advanced camera system, fast processor, and stunning display. Available in multiple colors.',
    price: 699.99,
    stockQuantity: 30,
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop'
    ],
    tags: ['smartphone', '5G', 'camera', '128GB'],
    specifications: {
      'Storage': '128GB',
      'RAM': '8GB',
      'Camera': '48MP + 12MP + 12MP',
      'Battery': '4500mAh'
    },
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Laptop 15.6"',
    description: 'Powerful laptop perfect for work and gaming. Features high-performance processor and dedicated graphics card.',
    price: 1299.99,
    stockQuantity: 25,
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=400&fit=crop'
    ],
    tags: ['laptop', 'gaming', 'work', '15.6-inch'],
    specifications: {
      'Processor': 'Intel i7-10700H',
      'RAM': '16GB DDR4',
      'Storage': '512GB SSD',
      'Graphics': 'RTX 3060 6GB'
    },
    isFeatured: true,
    isActive: true
  },

  // Clothing
  {
    name: 'Cotton T-Shirt',
    description: 'Comfortable cotton t-shirt available in multiple colors and sizes. Perfect for everyday wear.',
    price: 24.99,
    stockQuantity: 100,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop'
    ],
    tags: ['t-shirt', 'cotton', 'casual', 'comfortable'],
    specifications: {
      'Material': '100% Cotton',
      'Fit': 'Regular',
      'Care': 'Machine washable',
      'Sizes': 'XS, S, M, L, XL, XXL'
    },
    variants: [
      { name: 'Color', value: 'White', priceModifier: 0 },
      { name: 'Color', value: 'Black', priceModifier: 0 },
      { name: 'Color', value: 'Navy', priceModifier: 0 }
    ],
    isActive: true
  },
  {
    name: 'Denim Jeans',
    description: 'Classic denim jeans with perfect fit and durability. Available in various washes and sizes.',
    price: 59.99,
    stockQuantity: 75,
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop'
    ],
    tags: ['jeans', 'denim', 'casual', 'durable'],
    specifications: {
      'Material': '100% Cotton Denim',
      'Fit': 'Slim',
      'Care': 'Machine washable',
      'Sizes': '28, 30, 32, 34, 36, 38'
    },
    variants: [
      { name: 'Wash', value: 'Light Blue', priceModifier: 0 },
      { name: 'Wash', value: 'Medium Blue', priceModifier: 5 },
      { name: 'Wash', value: 'Dark Blue', priceModifier: 10 }
    ],
    isActive: true
  },

  // Home & Garden
  {
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with built-in grinder. Perfect for coffee enthusiasts who want fresh coffee every morning.',
    price: 149.99,
    stockQuantity: 40,
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop'
    ],
    tags: ['coffee', 'maker', 'programmable', 'grinder'],
    specifications: {
      'Capacity': '12 cups',
      'Timer': '24-hour programmable',
      'Features': 'Built-in grinder, auto-shutoff',
      'Material': 'Stainless steel'
    },
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Garden Tool Set',
    description: 'Complete set of essential garden tools for maintaining your garden. Includes trowel, pruner, and more.',
    price: 79.99,
    stockQuantity: 60,
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop'
    ],
    tags: ['garden', 'tools', 'set', 'outdoor'],
    specifications: {
      'Contents': 'Trowel, Pruner, Rake, Gloves',
      'Material': 'Stainless steel heads, Wooden handles',
      'Storage': 'Canvas carrying case included',
      'Warranty': '2 years'
    },
    isActive: true
  },

  // Sports & Outdoors
  {
    name: 'Yoga Mat',
    description: 'Premium yoga mat with excellent grip and cushioning. Perfect for yoga, pilates, and fitness activities.',
    price: 39.99,
    stockQuantity: 80,
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
    ],
    tags: ['yoga', 'mat', 'fitness', 'exercise'],
    specifications: {
      'Dimensions': '72" x 24"',
      'Thickness': '6mm',
      'Material': 'TPE (Thermoplastic Elastomer)',
      'Features': 'Non-slip surface, moisture resistant'
    },
    isActive: true
  },
  {
    name: 'Hiking Backpack',
    description: 'Durable hiking backpack with multiple compartments and comfortable straps. Ideal for day hikes and outdoor adventures.',
    price: 89.99,
    stockQuantity: 45,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=400&h=400&fit=crop'
    ],
    tags: ['hiking', 'backpack', 'outdoor', 'adventure'],
    specifications: {
      'Capacity': '30L',
      'Material': 'Ripstop nylon',
      'Features': 'Hydration bladder compatible, rain cover included',
      'Weight': '1.2kg'
    },
    isFeatured: true,
    isActive: true
  },

  // Books
  {
    name: 'The Art of Programming',
    description: 'Comprehensive guide to modern programming practices and techniques. Perfect for beginners and experienced developers.',
    price: 49.99,
    stockQuantity: 120,
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=400&h=400&fit=crop'
    ],
    tags: ['programming', 'technology', 'education', 'book'],
    specifications: {
      'Pages': '450',
      'Format': 'Hardcover',
      'Language': 'English',
      'ISBN': '978-0-123456-78-9'
    },
    isActive: true
  },
  {
    name: 'Healthy Cooking Recipes',
    description: 'Collection of healthy and delicious recipes for everyday cooking. Includes nutritional information and cooking tips.',
    price: 34.99,
    stockQuantity: 90,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop'
    ],
    tags: ['cooking', 'recipes', 'healthy', 'food'],
    specifications: {
      'Pages': '320',
      'Format': 'Paperback',
      'Language': 'English',
      'ISBN': '978-0-987654-32-1'
    },
    isActive: true
  }
];

// Sample admin user
const adminUser = {
  name: 'Admin User',
  email: 'admin@ecommerce.com',
  password: 'admin123',
  role: 'admin',
  isEmailVerified: true,
  isPhoneVerified: true,
  preferences: {
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    theme: 'light',
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false
  }
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log('Existing data cleared');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories created`);

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    const admin = await User.create({
      ...adminUser,
      password: hashedPassword
    });
    console.log('Admin user created:', admin.email);

    // Create regular user
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'user',
      isEmailVerified: true,
      isPhoneVerified: false
    });
    console.log('Regular user created:', regularUser.email);

    // Assign categories to products
    const electronicsCategory = createdCategories.find(cat => cat.name === 'Electronics');
    const clothingCategory = createdCategories.find(cat => cat.name === 'Clothing');
    const homeGardenCategory = createdCategories.find(cat => cat.name === 'Home & Garden');
    const sportsCategory = createdCategories.find(cat => cat.name === 'Sports & Outdoors');
    const booksCategory = createdCategories.find(cat => cat.name === 'Books');

    // Update products with category IDs
    const productsWithCategories = products.map(product => {
      if (product.tags.includes('wireless') || product.tags.includes('smartphone') || product.tags.includes('laptop')) {
        return { ...product, category: electronicsCategory._id };
      } else if (product.tags.includes('t-shirt') || product.tags.includes('jeans')) {
        return { ...product, category: clothingCategory._id };
      } else if (product.tags.includes('coffee') || product.tags.includes('garden')) {
        return { ...product, category: homeGardenCategory._id };
      } else if (product.tags.includes('yoga') || product.tags.includes('hiking')) {
        return { ...product, category: sportsCategory._id };
      } else if (product.tags.includes('book')) {
        return { ...product, category: booksCategory._id };
      }
      return product;
    });

    // Create products
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`${createdProducts.length} products created`);

    // Update category product counts
    for (const category of createdCategories) {
      const productCount = await Product.countDocuments({ category: category._id });
      await Category.findByIdAndUpdate(category._id, { productCount });
    }

    console.log('Database seeding completed successfully!');
    console.log('\nSample data created:');
    console.log(`- ${createdCategories.length} categories`);
    console.log(`- ${createdProducts.length} products`);
    console.log(`- 2 users (1 admin, 1 regular)`);
    console.log('\nAdmin credentials:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);
    console.log('\nRegular user credentials:');
    console.log('Email: john@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run seeder
if (require.main === module) {
  connectDB().then(() => {
    seedDatabase();
  });
}

module.exports = { seedDatabase };
