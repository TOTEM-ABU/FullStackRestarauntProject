# Restaurant Management System

Bu tizim restaurantlarni boshqarish uchun yaratilgan to'liq fullstack dastur.

## Texnologiyalar

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

## O'rnatish

### 1. Backend o'rnatish

```bash
cd restaraunt-backend
npm install
```

### 2. Database sozlash

PostgreSQL database yarating va `.env` faylini sozlang:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/restaraunt"
```

### 3. Database migration

```bash
cd restaraunt-backend
npx prisma migrate dev
```

### 4. Frontend o'rnatish

```bash
cd restaraunt-frontend
npm install
```

## Ishga tushirish

### Backend ishga tushirish

```bash
cd restaraunt-backend
npm run start:dev
```

Backend http://localhost:3000 da ishga tushadi

### Frontend ishga tushirish

```bash
cd restaraunt-frontend
npm run dev
```

Frontend http://localhost:5173 da ishga tushadi

## Test foydalanuvchi

Sistema avtomatik ravishda test foydalanuvchi yaratadi:

- **Telefon:** +998901234567
- **Parol:** 123456
- **Rol:** ADMIN

## API Documentation

Backend ishga tushgandan so'ng API dokumentatsiyasini ko'rish uchun:
http://localhost:3000/docs

## Asosiy funksiyalar

### Foydalanuvchilar
- ✅ Ro'yxatdan o'tish
- ✅ Tizimga kirish
- ✅ Foydalanuvchilarni boshqarish
- ✅ Rollar (ADMIN, SUPER_ADMIN, CASHER, WAITER)

### Restaurantlar
- ✅ Restaurant qo'shish
- ✅ Restaurant tahrirlash
- ✅ Restaurant o'chirish
- ✅ Restaurant ma'lumotlarini ko'rish

### Mahsulotlar
- ✅ Mahsulot qo'shish
- ✅ Mahsulot tahrirlash
- ✅ Mahsulot o'chirish
- ✅ Kategoriyalar bo'yicha filtrlash

### Buyurtmalar
- ✅ Buyurtmalarni ko'rish
- ✅ Buyurtma holatini boshqarish
- ✅ Restaurant bo'yicha filtrlash

### Hududlar
- ✅ Hudud qo'shish
- ✅ Hudud tahrirlash
- ✅ Hudud o'chirish

### Kategoriyalar
- ✅ Kategoriya qo'shish
- ✅ Kategoriya tahrirlash
- ✅ Kategoriya o'chirish

### Qarzdorliklar
- ✅ Qarzdorlik qo'shish
- ✅ Qarzdorlik tahrirlash
- ✅ Qarzdorlik o'chirish

## Tizim xususiyatlari

- 🔐 JWT authentication
- 👥 Role-based access control
- 📱 Responsive design
- 🔍 Real-time search
- 📊 Dashboard with statistics
- 🎨 Modern UI/UX
- ⚡ Fast performance
- 🔄 Auto refresh tokens

## Struktura

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

## Muhim eslatmalar

1. **Database:** PostgreSQL o'rnatilgan bo'lishi kerak
2. **Node.js:** 18+ versiyasi kerak
3. **Portlar:** 3000 (backend) va 5173 (frontend) portlari bo'sh bo'lishi kerak
4. **Environment:** `.env` faylini to'g'ri sozlash kerak

## Yordam

Agar muammolar bo'lsa:
1. Database connection tekshiring
2. Portlar bo'sh ekanligini tekshiring
3. Node modules o'rnatilganini tekshiring
4. Environment variables to'g'ri sozlanganini tekshiring 