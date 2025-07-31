import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Store, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalRestaurants: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRestaurants: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    // Bu yerda API'dan statistikalar olinadi
    // Hozircha mock data
    setStats({
      totalUsers: 150,
      totalRestaurants: 25,
      totalProducts: 450,
      totalOrders: 1200,
      totalRevenue: 25000000,
      pendingOrders: 45,
    });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
    }).format(amount);
  };

  const getStatsCards = () => {
    const baseCards = [
      {
        name: 'Jami buyurtmalar',
        value: stats.totalOrders,
        icon: ShoppingCart,
        color: 'bg-orange-500',
      },
      {
        name: 'Kutilayotgan buyurtmalar',
        value: stats.pendingOrders,
        icon: ShoppingCart,
        color: 'bg-red-500',
      },
    ];

    // Admin va Super Admin uchun barcha statistikalar
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      return [
        {
          name: 'Jami foydalanuvchilar',
          value: stats.totalUsers,
          icon: Users,
          color: 'bg-blue-500',
        },
        {
          name: 'Jami restaurantlar',
          value: stats.totalRestaurants,
          icon: Store,
          color: 'bg-green-500',
        },
        {
          name: 'Jami mahsulotlar',
          value: stats.totalProducts,
          icon: Package,
          color: 'bg-purple-500',
        },
        ...baseCards,
        {
          name: 'Jami tushum',
          value: formatCurrency(stats.totalRevenue),
          icon: DollarSign,
          color: 'bg-emerald-500',
        },
      ];
    }

    // CASHER uchun
    if (user?.role === 'CASHER') {
      return [
        ...baseCards,
        {
          name: 'Jami tushum',
          value: formatCurrency(stats.totalRevenue),
          icon: DollarSign,
          color: 'bg-emerald-500',
        },
      ];
    }

    // WAITER uchun
    if (user?.role === 'WAITER') {
      return [
        ...baseCards,
        {
          name: 'Jami mahsulotlar',
          value: stats.totalProducts,
          icon: Package,
          color: 'bg-purple-500',
        },
      ];
    }

    return baseCards;
  };

  const statsCards = getStatsCards();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Xush kelibs, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Restaurant boshqaruv tizimi dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((item) => (
          <div key={item.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${item.color}`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {item.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            So'nggi faoliyat
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Yangi buyurtma qabul qilindi
                </p>
                <p className="text-sm text-gray-500">2 daqiqa oldin</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Yangi foydalanuvchi qo'shildi
                </p>
                <p className="text-sm text-gray-500">15 daqiqa oldin</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Yangi mahsulot qo'shildi
                </p>
                <p className="text-sm text-gray-500">1 soat oldin</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tezkor amallar
          </h3>
          <div className="space-y-3">
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'WAITER') && (
              <button className="w-full btn btn-primary">
                Yangi buyurtma yaratish
              </button>
            )}
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <>
                <button className="w-full btn btn-secondary">
                  Mahsulot qo'shish
                </button>
                <button className="w-full btn btn-secondary">
                  Foydalanuvchi qo'shish
                </button>
              </>
            )}
            <button className="w-full btn btn-secondary">
              Hisobot ko'rish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 