# 🚀 E-Commerce Backend API

A robust, scalable backend API for the e-commerce platform built with Node.js, Express.js, and MongoDB.

## ✨ Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: CRUD operations with search, filtering, and pagination
- **Shopping Cart**: Full cart functionality with stock validation
- **Wishlist**: Save and manage favorite products
- **Order Management**: Complete order lifecycle with status tracking
- **Payment Integration**: Stripe payment processing with webhooks
- **User Management**: Profile, addresses, and preferences
- **Admin Dashboard**: Analytics, user management, and system settings
- **File Upload**: Cloudinary integration for image management
- **Email Services**: Transactional emails using Nodemailer
- **Validation**: Request validation using Joi
- **Testing**: Jest testing framework with MongoDB memory server
- **Security**: Helmet, CORS, rate limiting, and input sanitization

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, bcrypt
- **Payments**: Stripe
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Validation**: Joi
- **Testing**: Jest, Supertest
- **Linting**: ESLint
- **Logging**: Winston

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Business logic and request handlers
│   ├── middleware/      # Custom middleware functions
│   ├── models/          # MongoDB schemas and models
│   ├── routes/          # API route definitions
│   ├── utils/           # Utility functions and helpers
│   └── webhooks/        # Webhook handlers (Stripe)
├── scripts/             # Database seeding and migration
├── tests/               # Test files and setup
├── .env.example         # Environment variables template
├── .eslintrc.js         # ESLint configuration
├── jest.config.js       # Jest testing configuration
├── package.json         # Dependencies and scripts
├── README.md            # This file
└── server.js            # Main application entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Stripe account (for payments)
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Start MongoDB (if local)
   mongod
   
   # Or use MongoDB Atlas connection string
   ```

5. **Seed database (optional)**
   ```bash
   npm run seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## ⚙️ Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ecommerce

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Cloudinary (File Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Site Configuration
SITE_NAME=E-Commerce Store
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/google` | Google OAuth login | Public |
| POST | `/api/auth/verify-email` | Email verification | Public |
| POST | `/api/auth/verify-phone` | Phone verification | Public |
| POST | `/api/auth/forgot-password` | Password reset request | Public |
| POST | `/api/auth/reset-password` | Reset password | Public |
| GET | `/api/auth/me` | Get current user | Private |
| POST | `/api/auth/logout` | User logout | Private |

### Product Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/products` | Get all products | Public |
| GET | `/api/products/:id` | Get product by ID | Public |
| GET | `/api/products/categories` | Get categories | Public |
| GET | `/api/products/featured` | Get featured products | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| POST | `/api/products/:id/reviews` | Add product review | Private |

### Cart Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/cart` | Get user cart | Private |
| POST | `/api/cart` | Add item to cart | Private |
| PUT | `/api/cart/:itemId` | Update cart item | Private |
| DELETE | `/api/cart/:itemId` | Remove from cart | Private |
| DELETE | `/api/cart` | Clear cart | Private |
| POST | `/api/cart/move-to-wishlist` | Move items to wishlist | Private |

### Wishlist Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/wishlist` | Get user wishlist | Private |
| POST | `/api/wishlist` | Add to wishlist | Private |
| DELETE | `/api/wishlist/:itemId` | Remove from wishlist | Private |
| DELETE | `/api/wishlist` | Clear wishlist | Private |
| POST | `/api/wishlist/move-to-cart` | Move items to cart | Private |
| GET | `/api/wishlist/check/:productId` | Check if in wishlist | Private |

### Order Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/orders` | Create order | Private |
| GET | `/api/orders` | Get user orders | Private |
| GET | `/api/orders/:id` | Get order by ID | Private |
| PUT | `/api/orders/:id/cancel` | Cancel order | Private |
| GET | `/api/orders/:id/tracking` | Get order tracking | Private |
| GET | `/api/orders/admin/all` | Get all orders | Admin |
| PUT | `/api/orders/:id/status` | Update order status | Admin |

### Payment Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/payments/create-intent` | Create payment intent | Private |
| POST | `/api/payments/create-checkout-session` | Create checkout session | Private |
| GET | `/api/payments/methods` | Get payment methods | Private |
| POST | `/api/payments/methods` | Add payment method | Private |
| DELETE | `/api/payments/methods/:methodId` | Remove payment method | Private |
| PUT | `/api/payments/methods/:methodId/default` | Set default method | Private |
| GET | `/api/payments/history` | Get payment history | Private |
| POST | `/api/payments/:paymentIntentId/refund` | Refund payment | Admin |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users/profile` | Get user profile | Private |
| PUT | `/api/users/profile` | Update profile | Private |
| PUT | `/api/users/change-password` | Change password | Private |
| GET | `/api/users/addresses` | Get user addresses | Private |
| POST | `/api/users/addresses` | Add address | Private |
| PUT | `/api/users/addresses/:id` | Update address | Private |
| DELETE | `/api/users/addresses/:id` | Delete address | Private |
| PUT | `/api/users/addresses/:id/default` | Set default address | Private |
| GET | `/api/users/orders-summary` | Get orders summary | Private |
| PUT | `/api/users/preferences` | Update preferences | Private |
| DELETE | `/api/users/account` | Delete account | Private |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/admin/dashboard` | Dashboard statistics | Admin |
| GET | `/api/admin/analytics` | System analytics | Admin |
| GET | `/api/admin/notifications` | Admin notifications | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| PUT | `/api/admin/users/:id/role` | Update user role | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |
| PUT | `/api/admin/settings` | Update system settings | Admin |

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints and database operations
- **Test Setup**: Uses MongoDB memory server for isolated testing

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with nodemon
npm start           # Start production server

# Building
npm run build       # Build for production
npm run build:clean # Clean build directory

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues

# Database
npm run seed        # Seed database with sample data
npm run migrate     # Run database migrations
```

### Code Style

- Follow ESLint configuration
- Use consistent naming conventions
- Write meaningful comments
- Follow RESTful API design principles
- Implement proper error handling

### Adding New Features

1. **Create Model**: Define MongoDB schema in `src/models/`
2. **Create Controller**: Implement business logic in `src/controllers/`
3. **Create Routes**: Define API endpoints in `src/routes/`
4. **Add Validation**: Create Joi schemas in `src/utils/validation.js`
5. **Write Tests**: Add test coverage in `tests/`
6. **Update Documentation**: Document new endpoints

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure production database
- Set up production Stripe keys
- Configure production email settings

### Deployment Platforms
- **Heroku**: Easy deployment with Git integration
- **Render**: Modern cloud platform
- **DigitalOcean**: VPS deployment
- **AWS**: Scalable cloud infrastructure

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Joi schema validation
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **CORS Protection**: Configured for frontend domains
- **Helmet Security**: Security headers and protection
- **Input Sanitization**: Prevent injection attacks

## 📊 Monitoring & Logging

- **Winston Logger**: Structured logging with different levels
- **Morgan**: HTTP request logging
- **Error Handling**: Centralized error handling middleware
- **Health Checks**: `/health` endpoint for monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the test examples
- Contact the development team

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete e-commerce functionality
- Authentication and authorization
- Product management
- Shopping cart and wishlist
- Order management
- Payment integration
- Admin dashboard
- Comprehensive testing
- API documentation
