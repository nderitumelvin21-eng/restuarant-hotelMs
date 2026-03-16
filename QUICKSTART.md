# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in separate terminal)
cd frontend
npm install
```

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb restaurant_management

# Update backend/.env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=restaurant_management
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

### 4. Start Services

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Access Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000/api
- **Health**: http://localhost:5000/health

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@restaurant.com | Admin123!@# |
| Waiter | waiter1@restaurant.com | Waiter123!@# |
| Customer | customer1@email.com | Customer123!@# |

## Key Features to Try

### For Admin
1. Go to Dashboard - View real-time metrics
2. Check Analytics - Revenue, top dishes, fraud alerts
3. Manage Tables - View floor plan and table status

### For Waiter
1. View Tables - See current table status
2. Create Order - Take order from table
3. Kitchen Display - Track order preparation

### For Customer
1. Browse Menu - See all available dishes
2. Make Reservation - Book a table
3. View Profile - Check loyalty points

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Create database if not exists
createdb restaurant_management
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Package Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules

# Reinstall
npm install
```

## File Structure Quick Reference

```
backend/
├── models/       ← Database access
├── services/     ← Business logic
├── controllers/  ← Request handlers
├── routes/       ← API endpoints
└── server.js     ← Start here

frontend/
├── pages/        ← Full page components
├── components/   ← Reusable components
├── services/     ← API & Socket calls
├── stores/       ← Zustand state
└── App.jsx       ← Start here
```

## Environment Variables

### Backend (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_management
DB_USER=postgres
DB_PASSWORD=your_password
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRY=7d
SOCKET_ORIGIN=http://localhost:3000
```

## Common Tasks

### Add New Menu Item
1. Use Admin Dashboard
2. Or direct database insert:
```sql
INSERT INTO menu_items (name, description, category, price, cost, preparation_time_minutes)
VALUES ('Dish Name', 'Description', 'Category', 99.99, 20.00, 15);
```

### Create New User
```sql
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('email@test.com', 'hashed_password', 'First', 'Last', 'waiter');
```

### View Active Orders
```bash
curl http://localhost:5000/api/orders/active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Performance Tips

- Dashboard updates every 30 seconds
- Kitchen display updates every 15 seconds
- Use filtering to reduce data load
- Clear browser cache if UI looks stale

## API Testing

### Using cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"Admin123!@#"}'

# Get active orders
curl http://localhost:5000/api/orders/active \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman
1. Import API collection from docs
2. Set environment variables
3. Run requests

## Next Steps

1. ✅ Explore the dashboard
2. ✅ Create test orders
3. ✅ Track kitchen display
4. ✅ View analytics
5. ✅ Customize branding
6. ✅ Deploy to production

---

**Need help?** Check the main README.md or API documentation.
