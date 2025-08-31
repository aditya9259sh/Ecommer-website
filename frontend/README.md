# 🛍️ E-Commerce Frontend

A modern, responsive React frontend for the E-Commerce application built with React 18, TailwindCSS, and Framer Motion.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with glassmorphism effects
- **Authentication**: Complete user authentication system with JWT
- **Product Management**: Browse, search, and filter products
- **Shopping Cart**: Full cart functionality with quantity management
- **Wishlist**: Save and manage favorite products
- **Order Management**: Track order history and status
- **User Profiles**: Manage personal information and addresses
- **Admin Dashboard**: Complete admin interface for store management
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Animations**: Smooth Framer Motion animations throughout
- **State Management**: Zustand for efficient state management

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library
- **React Router** - Declarative routing for React
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant forms with easy validation
- **Axios** - HTTP client for API communication
- **Lucide React** - Beautiful, customizable icons
- **React Query** - Data fetching and caching

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Layout.jsx     # Main layout wrapper
│   │   ├── Header.jsx     # Navigation header
│   │   ├── Footer.jsx     # Site footer
│   │   ├── ProtectedRoute.jsx  # Auth protection
│   │   └── AdminRoute.jsx      # Admin protection
│   ├── pages/             # Page components
│   │   ├── Home.jsx       # Landing page
│   │   ├── Products.jsx   # Product listing
│   │   ├── ProductDetail.jsx  # Single product view
│   │   ├── Cart.jsx       # Shopping cart
│   │   ├── Wishlist.jsx   # User wishlist
│   │   ├── Orders.jsx     # Order history
│   │   ├── OrderDetail.jsx # Order details
│   │   ├── Profile.jsx    # User profile
│   │   ├── Login.jsx      # User login
│   │   ├── Register.jsx   # User registration
│   │   └── AdminDashboard.jsx # Admin panel
│   ├── stores/            # Zustand state stores
│   │   ├── authStore.js   # Authentication state
│   │   ├── cartStore.js   # Shopping cart state
│   │   └── wishlistStore.js # Wishlist state
│   ├── services/          # API services
│   │   └── api.js         # Axios configuration
│   ├── utils/             # Utility functions
│   │   └── cn.js          # Class name utilities
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # TailwindCSS configuration
└── postcss.config.js      # PostCSS configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend server running (see backend README)

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🎨 Design System

### Colors
- **Primary**: Blue shades (#0ea5e9)
- **Secondary**: Purple shades (#d946ef)
- **Accent**: Yellow shades (#eab308)
- **Neutral**: Gray scale for text and backgrounds

### Components
- **Buttons**: Primary, secondary, and outline variants
- **Cards**: Consistent card design with shadows
- **Forms**: Styled inputs with validation states
- **Navigation**: Responsive header with mobile menu

### Animations
- **Page Transitions**: Smooth fade-in effects
- **Hover States**: Interactive hover animations
- **Loading States**: Skeleton loaders and spinners
- **Micro-interactions**: Button clicks and form submissions

## 🔐 Authentication Flow

1. **Registration**: User creates account with email/password
2. **Login**: User authenticates with credentials
3. **JWT Storage**: Token stored in localStorage with Zustand
4. **Protected Routes**: Automatic redirect for unauthenticated users
5. **Token Refresh**: Automatic token validation on app load

## 🛒 Shopping Experience

### Product Browsing
- **Grid/List Views**: Toggle between viewing modes
- **Search & Filters**: Advanced filtering by category, price, etc.
- **Pagination**: Efficient product loading
- **Responsive Images**: Optimized product images

### Cart Management
- **Add/Remove Items**: Easy cart manipulation
- **Quantity Controls**: Increment/decrement quantities
- **Move to Wishlist**: Transfer items between lists
- **Real-time Updates**: Instant cart state updates

### Checkout Process
- **Address Selection**: Choose from saved addresses
- **Payment Integration**: Stripe payment processing
- **Order Confirmation**: Clear order status updates

## 👤 User Management

### Profile Features
- **Personal Information**: Update name, email, phone
- **Password Management**: Secure password changes
- **Address Book**: Multiple shipping addresses
- **Order History**: Complete order tracking

### Admin Features
- **Dashboard Overview**: Store statistics and metrics
- **User Management**: View and manage user accounts
- **Product Management**: Add/edit/delete products
- **Order Management**: Process and track orders

## 📱 Responsive Design

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: Responsive layouts for all screen sizes
- **Touch Friendly**: Optimized for touch interactions
- **Performance**: Fast loading on all devices

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### TailwindCSS Customization
Edit `tailwind.config.js` to customize:
- Color palette
- Typography
- Spacing
- Animations

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy automatically on push

### Deploy to Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on push

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run test:coverage
```

## 📊 Performance

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Responsive images with proper sizing
- **Bundle Analysis**: Monitor bundle size and performance

## 🔒 Security

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Route-level access control
- **Input Validation**: Form validation and sanitization
- **HTTPS**: Secure communication in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 Code Style

- **ESLint**: Consistent code formatting
- **Prettier**: Automatic code formatting
- **React Hooks**: Modern React patterns
- **Functional Components**: Stateless and stateful components

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   ```

2. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **API Connection Issues**
   - Verify backend server is running
   - Check API URL in configuration
   - Verify CORS settings

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the documentation
- Contact the development team
