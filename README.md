# Restaurant Management System

A complete, production-ready restaurant management system built with **Node.js/Express** backend and **React** frontend. Designed for large single-branch restaurants with luxury Dubai-style UI.

## 🌟 Features

### 1. **User Authentication & Roles**
- ✅ Customer signup/signin (email, phone, password)
- ✅ Admin login with 2FA support
- ✅ Role-based access: Admin, Manager, Waiter, Customer
- ✅ Secure password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ TOTP 2FA with QR code generation

### 2. **Visual Table Layout System**
- ✅ Drag-and-drop floor plan editor
- ✅ Real-time table status: Free/Occupied/Reserved/Cleaning
- ✅ Table occupancy timers
- ✅ Clickable tables for waiter POS

### 3. **Waiter POS Ordering**
- ✅ Tablet/phone-friendly interface
- ✅ Real-time order transmission
- ✅ Kitchen display integration
- ✅ Split bill support
- ✅ Multiple payment methods: Cash, Card, Mobile (M-Pesa)

### 4. **Kitchen Order System**
- ✅ Kitchen display screen (KDS)
- ✅ Order status tracking: New → Preparing → Ready
- ✅ Time tracking per order
- ✅ Color-coded priority system
- ✅ Real-time updates via Socket.io

### 5. **Customer Intelligence System**
- ✅ Customer profiles with history
- ✅ VIP tier recognition (Bronze/Silver/Gold/Platinum)
- ✅ Loyalty points system
- ✅ Spending analytics
- ✅ Visit history tracking

### 6. **AI Recommendation Engine**
- ✅ Smart dish recommendations based on order history
- ✅ Popularity-based suggestions
- ✅ Conversion tracking
- ✅ Personalized menu suggestions for waiters

### 7. **Waiter Performance Tracking**
- ✅ Tables served metrics
- ✅ On-time delivery tracking
- ✅ Average table turnover
- ✅ Customer satisfaction scores
- ✅ Tips and upsells tracking

### 8. **Revenue Analytics & Fraud Detection**
- ✅ Real-time revenue dashboards
- ✅ Revenue breakdown by waiter/table/item/payment
- ✅ Period-over-period comparison
- ✅ Fraud risk detection and alerts
- ✅ Suspicious activity flagging

## 📁 Project Structure

```
restaurantManagement/
├── backend/
│   ├── config/
│   │   ├── database.js         # PostgreSQL connection
│   │   └── constants.js        # App constants & enums
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── OrderController.js
│   │   ├── TableController.js
│   │   └── AnalyticsController.js
│   ├── models/
│   │   ├── UserModel.js
│   │   ├── CustomerModel.js
│   │   ├── TableModel.js
│   │   ├── MenuItemModel.js
│   │   ├── OrderModel.js
│   │   ├── ReservationModel.js
│   │   └── PaymentModel.js
│   ├── services/
│   │   ├── AuthService.js
│   │   ├── RecommendationService.js
│   │   └── AnalyticsService.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── orders.js
│   │   ├── tables.js
│   │   └── analytics.js
│   ├── database/
│   │   └── schema.js
│   ├── seeds/
│   │   └── seedDatabase.js
│   ├── server.js               # Main server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navigation.jsx
│   │   ├── pages/
│   │   │   ├── Homepage.jsx
│   │   │   ├── SignIn.jsx
│   │   │   ├── SignUp.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── TableManagement.jsx
│   │   │   └── KitchenDisplay.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── stores/
│   │   │   ├── authStore.js
│   │   │   └── orderStore.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── docs/
    └── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+
- **PostgreSQL** 12+
- **npm** or **yarn**

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure database in .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_management
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key

# Seed database with sample data
npm run seed

# Start server
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

## 🔐 Authentication

### Demo Credentials

**Admin Account:**
- Email: `admin@restaurant.com`
- Password: `Admin123!@#`
- Access: Dashboard, Analytics, Settings

**Manager Account:**
- Email: `manager@restaurant.com`
- Password: `Manager123!@#`
- Access: Dashboard, Orders

**Waiter Accounts:**
- Email: `waiter1@restaurant.com` - `waiter3@restaurant.com`
- Password: `Waiter123!@#`
- Access: Tables, Orders, Kitchen Display

**Customer Accounts:**
- Email: `customer1@email.com` - `customer5@email.com`
- Password: `Customer123!@#`
- Access: Menu, Reservations, Profile

## 📊 Database Schema

### Key Tables

- **users** - Admin/Staff/Customer accounts
- **customers** - Customer profiles with history
- **tables** - Restaurant tables with floor positions
- **menu_items** - Dishes with pricing and popularity
- **orders** - Order records with items and status
- **order_items** - Individual items in orders
- **reservations** - Table reservations
- **payments** - Payment transactions with fraud detection
- **split_bills** - Bill splitting for shared tables
- **waiter_performance** - Daily metrics per waiter
- **loyalty_points** - Customer loyalty tracking
- **recommendations** - AI-generated dish suggestions

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/signup                 - Customer registration
POST   /api/auth/signin                 - User login
GET    /api/auth/me                     - Current user profile
POST   /api/auth/2fa/setup              - Initialize 2FA
POST   /api/auth/2fa/enable             - Enable 2FA
POST   /api/auth/change-password        - Change password
```

### Orders

```
GET    /api/orders/active               - Get active orders
GET    /api/orders/:orderId             - Get order details
POST   /api/orders                      - Create new order
PATCH  /api/orders/:orderId/status      - Update order status
GET    /api/orders/kitchen/queue        - Kitchen display queue
POST   /api/orders/:orderId/items       - Add item to order
POST   /api/orders/:orderId/complete    - Complete and pay
```

### Tables

```
GET    /api/tables                      - Get all tables
GET    /api/tables/:tableId             - Get table details
POST   /api/tables                      - Create table
PATCH  /api/tables/:tableId/position    - Update floor position
GET    /api/tables/status/summary       - Table status summary
GET    /api/tables/available            - Available tables for capacity
DELETE /api/tables/:tableId             - Delete table
```

### Analytics

```
GET    /api/analytics/revenue           - Revenue by date range
GET    /api/analytics/waiter-revenue    - Revenue by waiter
GET    /api/analytics/top-dishes        - Top selling dishes
GET    /api/analytics/fraud-alerts      - Fraud detection alerts
GET    /api/analytics/daily-summary     - Daily summary
GET    /api/analytics/table-turnover    - Table turnover metrics
GET    /api/analytics/customer-insights - Customer tier insights
```

## 🎨 UI/UX Design

### Luxury Theme
- **Dark Mode**: Dark background (#0f0e1a) with gold accents (#d4af37)
- **Typography**: Playfair Display for headings, Inter for body text
- **Colors**: Gold, Sapphire Blue, with high contrast for accessibility
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design for tablets and phones

### Components
- **Navigation Bar**: Fixed header with role-based menu
- **Hero Section**: Full-width hero with CTA buttons
- **Card Components**: Consistent card styling with gold borders
- **Tables Grid**: Drag-and-drop capable table layouts
- **Kitchen Display**: Color-coded order tickets with timers
- **Dashboards**: Real-time analytics with charts

## 🔄 Real-time Features

### Socket.io Events

**Kitchen Display:**
- `join:kitchen` - Connect to kitchen display
- `order:new` - New order received
- `order:status-update` - Order status changed

**Table Updates:**
- `join:table` - Monitor specific table
- `table:order-update` - Order update for table
- `table:status-change` - Table status changed

## 🛡️ Security Features

- **Password Hashing**: Bcryptjs with 12-round salt
- **JWT Tokens**: 7-day expiry with secure signing
- **2FA Support**: TOTP-based two-factor authentication
- **Role-Based Access**: Middleware enforcement
- **Input Validation**: Server-side validation for all inputs
- **Fraud Detection**: ML-based fraud scoring
- **SQL Injection Prevention**: Parameterized queries
- **CORS Enabled**: Configurable cross-origin access

## 📈 Performance Optimization

- **Connection Pooling**: 20 connection max to database
- **Real-time Updates**: Socket.io instead of polling
- **Caching**: Analytics cache table for performance
- **Indexes**: Strategic indexes on frequently queried columns
- **Pagination**: Support for large datasets

## 🧪 Testing Data

Database is pre-seeded with:
- ✅ 1 Admin, 1 Manager, 3 Waiters, 5 Customers
- ✅ 10 Restaurant Tables with positions
- ✅ 14 Menu Items across 5 categories
- ✅ 3 Sample Reservations
- ✅ 5 Completed Orders
- ✅ Customer profiles with histories

## 🚀 Deployment

### Backend (Heroku/AWS)

```bash
# Create Procfile
echo "web: npm start" > Procfile

# Deploy
git push heroku main
```

### Frontend (Vercel/Netlify)

```bash
# Build production
npm run build

# Deploy dist folder
vercel deploy
```

## 🔮 Future Enhancements

- [ ] Multi-branch support
- [ ] Inventory management
- [ ] Staff scheduling
- [ ] SMS/Email notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics with ML
- [ ] QR code ordering
- [ ] Delivery integration
- [ ] Supplier management

## 📝 License

MIT License - Feel free to use for your project

## 🆘 Support

For issues or questions:
1. Check existing documentation
2. Review API error responses
3. Check browser console for client-side errors
4. Check server logs for backend errors

## 👨‍💻 Developer Notes

### Adding New Features

1. **Create Model** in `backend/models/`
2. **Create Service** in `backend/services/` for business logic
3. **Create Controller** in `backend/controllers/`
4. **Create Routes** in `backend/routes/`
5. **Add Frontend Pages** in `frontend/src/pages/`
6. **Add Zustand Store** for state management

### Code Standards

- Use ES6+ syntax
- Add JSDoc comments for functions
- Follow naming conventions (camelCase for functions/vars, PascalCase for classes)
- Validate all inputs
- Handle errors gracefully

---

**Built with ❤️ for the finest dining experiences**
