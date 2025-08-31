# 🛍️ E-Commerce Web Application

A modern, full-stack e-commerce platform built with React, Node.js, and MongoDB.

## 🚀 Features

- **Frontend**: React with TailwindCSS, Framer Motion, and ShadCN UI
- **Backend**: Node.js with Express.js and JWT authentication
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT, Google OAuth, Email/Phone OTP verification
- **Payments**: Stripe integration
- **Admin Dashboard**: Complete product and order management

## 📁 Project Structure

```
e-commerce-website/
├── frontend/          # React application
├── backend/           # Node.js Express server
├── database/          # Database schemas and models
├── .env.example       # Environment variables template
└── README.md          # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **ShadCN UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Stripe** - Payment processing

### Authentication
- **JWT Tokens** - Session management
- **Google OAuth** - Social login
- **Email OTP** - Email verification
- **Phone OTP** - SMS verification (Firebase)

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and setup environment**
   ```bash
   # Copy environment variables
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Start development servers**
   ```bash
   # Start backend (from backend directory)
   npm run dev

   # Start frontend (from frontend directory)
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Firebase (for phone OTP)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com

# Email (for email OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 📱 Available Scripts

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run test        # Run tests
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🗄️ Database Schema

### Users
- Basic info (name, email, phone)
- Authentication (password, OAuth providers)
- Addresses and preferences
- Role (user/admin)

### Products
- Basic info (name, description, price)
- Images and categories
- Inventory and variants
- Reviews and ratings

### Orders
- User reference
- Products and quantities
- Payment status
- Shipping details

### Cart & Wishlist
- User reference
- Product references
- Timestamps

## 🔐 Authentication Flow

1. **Email/Password**: Traditional signup with email verification
2. **Google OAuth**: Social login with Google
3. **Phone OTP**: SMS verification using Firebase
4. **JWT Tokens**: Secure session management

## 💳 Payment Integration

- **Stripe**: Secure payment processing
- **Webhook handling**: Payment status updates
- **Order management**: Complete order lifecycle

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Glassmorphism**: Modern glass effects
- **Gradients**: Beautiful color transitions
- **Animations**: Smooth Framer Motion effects
- **Dark Mode**: Toggle between themes
- **Loading States**: Skeleton loaders and spinners

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Render/Heroku)
```bash
cd backend
npm run build
# Deploy to Render or Heroku
```

### Database (MongoDB Atlas)
- Create cluster on MongoDB Atlas
- Update connection string in environment variables

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/verify-phone` - Phone verification

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart & Wishlist
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (admin)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@ecommerce.com or create an issue in the repository.
