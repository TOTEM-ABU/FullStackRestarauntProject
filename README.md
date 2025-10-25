# Restaurant Management System

This is a complete fullstack application for managing restaurants.

## Technologies

### Backend

- **NestJS** - Backend framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend

- **React** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Lucide React** - Icons

## Core Features

### Users

- ✅ User registration
- ✅ User login
- ✅ User management
- ✅ Roles (ADMIN, SUPER_ADMIN, CASHER, WAITER)

### Restaurants

- ✅ Add restaurant
- ✅ Edit restaurant
- ✅ Delete restaurant
- ✅ View restaurant details

### Products

- ✅ Add product
- ✅ Edit product
- ✅ Delete product
- ✅ Filter by categories

### Orders

- ✅ View orders
- ✅ Manage order status
- ✅ Filter by restaurant

### Regions

- ✅ Add region
- ✅ Edit region
- ✅ Delete region

### Categories

- ✅ Add category
- ✅ Edit category
- ✅ Delete category

### Debts

- ✅ Add debt
- ✅ Edit debt
- ✅ Delete debt

## System Features

- 🔐 JWT authentication
- 👥 Role-based access control
- 📱 Responsive design
- 🔍 Real-time search
- 📊 Dashboard with statistics
- 🎨 Modern UI/UX
- ⚡ Fast performance
- 🔄 Auto refresh tokens

## Structure

```
FullStackRestarauntSystem/
├── restaraunt-backend/          # Backend (NestJS)
│   ├── src/
│   │   ├── auth/               # Authentication
│   │   ├── user/               # User management
│   │   ├── restaurant/         # Restaurant management
│   │   ├── product/            # Product management
│   │   ├── order/              # Order management
│   │   ├── region/             # Region management
│   │   ├── category/           # Category management
│   │   ├── debt/               # Debt management
│   │   └── withdraw/           # Withdraw management
│   └── prisma/                 # Database schema
└── restaraunt-frontend/        # Frontend (React)
    ├── src/
    │   ├── components/         # Reusable components
    │   ├── pages/              # Page components
    │   ├── contexts/           # React contexts
    │   ├── services/           # API services
    │   └── types/              # TypeScript types
    └── public/                 # Static assets
```

## Important Notes

1. **Database:** PostgreSQL must be installed
2. **Node.js:** Version 18+ required
3. **Ports:** Ports 3000 (backend) and 5173 (frontend) must be available
4. **Environment:** Configure the `.env` file correctly

## Help

If you encounter issues:

1. Check database connection
2. Verify ports are available
3. Ensure node modules are installed
4. Verify environment variables are configured correctly
