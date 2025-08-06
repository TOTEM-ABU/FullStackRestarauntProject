import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { dashboardAPI } from "../services/api";
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Utensils,
  ChefHat,
  Coffee,
  Pizza,
  Wine,
  Salad,
  Clock,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

interface DashboardStats {
  totalUsers: number;
  totalRestaurants: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  netProfit: number;
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
    netProfit: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setStats(response);
    } catch (error) {
      console.error("Dashboard stats yuklashda xatolik:", error);
      toast.error("Dashboard ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
    }).format(amount);
  };

  const getStatsCards = () => {
    const baseCards = [
      {
        name: "Jami buyurtmalar",
        value: stats.totalOrders,
        icon: ShoppingCart,
        color: "from-orange-500 to-red-500",
        bgColor: "bg-gradient-to-r from-orange-500 to-red-500",
      },
      {
        name: "Kutilayotgan buyurtmalar",
        value: stats.pendingOrders,
        icon: Clock,
        color: "from-red-500 to-pink-500",
        bgColor: "bg-gradient-to-r from-red-500 to-pink-500",
      },
    ];

    if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
      return [
        {
          name: "Jami foydalanuvchilar",
          value: stats.totalUsers,
          icon: Users,
          color: "from-blue-500 to-cyan-500",
          bgColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
        },
        {
          name: "Jami restaurantlar",
          value: stats.totalRestaurants,
          icon: Store,
          color: "from-green-500 to-emerald-500",
          bgColor: "bg-gradient-to-r from-green-500 to-emerald-500",
        },
        {
          name: "Jami mahsulotlar",
          value: stats.totalProducts,
          icon: Package,
          color: "from-purple-500 to-violet-500",
          bgColor: "bg-gradient-to-r from-purple-500 to-violet-500",
        },
        ...baseCards,
        {
          name: "Sof foyda",
          value: formatCurrency(stats.netProfit),
          icon: DollarSign,
          color: "from-emerald-500 to-teal-500",
          bgColor: "bg-gradient-to-r from-emerald-500 to-teal-500",
        },
      ];
    }

    if (user?.role === "CASHER") {
      return [
        ...baseCards,
        {
          name: "Sof foyda",
          value: formatCurrency(stats.netProfit),
          icon: DollarSign,
          color: "from-emerald-500 to-teal-500",
          bgColor: "bg-gradient-to-r from-emerald-500 to-teal-500",
        },
      ];
    }

    if (user?.role === "WAITER") {
      return [
        ...baseCards,
        {
          name: "Jami mahsulotlar",
          value: stats.totalProducts,
          icon: Package,
          color: "from-purple-500 to-violet-500",
          bgColor: "bg-gradient-to-r from-purple-500 to-violet-500",
        },
      ];
    }

    return baseCards;
  };

  const statsCards = getStatsCards();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-warm-600 font-medium">Dashboard yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Xush kelibsiz, {user?.name}!{" "}
              {user?.role === "ADMIN"
                ? "👨‍💼"
                : user?.role === "SUPER_ADMIN"
                ? "👑"
                : user?.role === "CASHER"
                ? "💰"
                : user?.role === "WAITER"
                ? "👨‍🍳"
                : "👋"}
            </h1>
            <p className="text-primary-100 text-lg">
              Gastronomica Restaurant Management Dashboard
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-2">
              <Pizza className="h-6 w-6 text-white/80" />
              <Coffee className="h-6 w-6 text-white/80" />
              <Wine className="h-6 w-6 text-white/80" />
              <Salad className="h-6 w-6 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((item) => (
          <div
            key={item.name}
            className="restaurant-card group hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 p-4 rounded-xl ${item.bgColor} shadow-lg group-hover:shadow-xl transition-shadow`}
              >
                <item.icon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-warm-600 truncate">
                    {item.name}
                  </dt>
                  <dd className="text-2xl font-bold text-warm-900">
                    {item.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="restaurant-card">
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mr-3">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-warm-900">
              So'nggi faoliyat
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-warm-900">
                  Yangi buyurtma qabul qilindi
                </p>
                <p className="text-sm text-warm-500">2 daqiqa oldin</p>
              </div>
              <div className="flex items-center text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-warm-900">
                  Yangi foydalanuvchi qo'shildi
                </p>
                <p className="text-sm text-warm-500">15 daqiqa oldin</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-warm-900">
                  Yangi mahsulot qo'shildi
                </p>
                <p className="text-sm text-warm-500">1 soat oldin</p>
              </div>
            </div>
          </div>
        </div>

        <div className="restaurant-card">
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 bg-gradient-to-r from-accent-500 to-orange-500 rounded-xl flex items-center justify-center mr-3">
              <Utensils className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-warm-900">Tezkor amallar</h3>
          </div>
          <div className="space-y-4">
            {(user?.role === "ADMIN" ||
              user?.role === "SUPER_ADMIN" ||
              user?.role === "WAITER") && (
              <button className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                <ShoppingCart className="inline-block h-5 w-5 mr-2" />
                Yangi buyurtma yaratish
              </button>
            )}
            {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
              <>
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                  <Package className="inline-block h-5 w-5 mr-2" />
                  Mahsulot qo'shish
                </button>
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                  <Users className="inline-block h-5 w-5 mr-2" />
                  Foydalanuvchi qo'shish
                </button>
              </>
            )}
            <button className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              <TrendingUp className="inline-block h-5 w-5 mr-2" />
              Hisobot ko'rish
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-8 text-warm-300">
        <Pizza className="h-8 w-8" />
        <Coffee className="h-8 w-8" />
        <Wine className="h-8 w-8" />
        <Salad className="h-8 w-8" />
        <ChefHat className="h-8 w-8" />
        <Utensils className="h-8 w-8" />
      </div>
    </div>
  );
};

export default Dashboard;
