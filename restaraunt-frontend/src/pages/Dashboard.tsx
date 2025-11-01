import React, { useEffect, useState, useCallback, useMemo } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import { StatCard, ActionButton, ActivityItem } from "../components";

interface DashboardStats {
  totalUsers: number;
  totalRestaurants: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  netProfit: number;
  pendingOrders: number;
}

const Dashboard: React.FC = React.memo(() => {
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

  const fetchDashboardStats = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
    }).format(amount);
  }, []);

  const statsCards = useMemo(() => {
    const baseCards = [
      {
        name: "Jami buyurtmalar",
        value: stats.totalOrders,
        icon: ShoppingCart,
        bgColor: "bg-gradient-to-r from-orange-500 to-red-500",
      },
      {
        name: "Kutilayotgan buyurtmalar",
        value: stats.pendingOrders,
        icon: Clock,
        bgColor: "bg-gradient-to-r from-red-500 to-pink-500",
      },
    ];

    if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
      return [
        {
          name: "Jami foydalanuvchilar",
          value: stats.totalUsers,
          icon: Users,
          bgColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
        },
        {
          name: "Jami restaurantlar",
          value: stats.totalRestaurants,
          icon: Store,
          bgColor: "bg-gradient-to-r from-green-500 to-emerald-500",
        },
        {
          name: "Jami mahsulotlar",
          value: stats.totalProducts,
          icon: Package,
          bgColor: "bg-gradient-to-r from-purple-500 to-violet-500",
        },
        ...baseCards,
        {
          name: "Sof foyda",
          value: formatCurrency(stats.netProfit),
          icon: DollarSign,
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
          bgColor: "bg-gradient-to-r from-purple-500 to-violet-500",
        },
      ];
    }

    return baseCards;
  }, [stats, user?.role, formatCurrency]);

  const roleEmoji = useMemo(() => {
    switch (user?.role) {
      case "ADMIN":
        return "Manager";
      case "SUPER_ADMIN":
        return "Crown";
      case "CASHER":
        return "Money Bag";
      case "WAITER":
        return "Chef";
      default:
        return "Wave";
    }
  }, [user?.role]);

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
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Xush kelibsiz, {user?.name}! {roleEmoji}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((card) => (
          <StatCard
            key={card.name}
            name={card.name}
            value={card.value}
            icon={card.icon}
            bgColor={card.bgColor}
          />
        ))}
      </div>

      {/* Activity + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
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
            <ActivityItem
              icon={ShoppingCart}
              title="Yangi buyurtma qabul qilindi"
              time="2 daqiqa oldin"
              color="from-green-500 to-emerald-500"
            />
            <ActivityItem
              icon={Users}
              title="Yangi foydalanuvchi qo'shildi"
              time="15 daqiqa oldin"
              color="from-blue-500 to-cyan-500"
            />
            <ActivityItem
              icon={Package}
              title="Yangi mahsulot qo'shildi"
              time="1 soat oldin"
              color="from-purple-500 to-violet-500"
            />
          </div>
        </div>

        {/* Quick Actions */}
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
              <ActionButton
                icon={ShoppingCart}
                label="Yangi buyurtma yaratish"
                color="from-primary-500 to-accent-500"
              />
            )}
            {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
              <>
                <ActionButton
                  icon={Package}
                  label="Mahsulot qo'shish"
                  color="from-green-500 to-emerald-500"
                />
                <ActionButton
                  icon={Users}
                  label="Foydalanuvchi qo'shish"
                  color="from-blue-500 to-cyan-500"
                />
              </>
            )}
            <ActionButton
              icon={TrendingUp}
              label="Hisobot ko'rish"
              color="from-purple-500 to-violet-500"
            />
          </div>
        </div>
      </div>

      {/* Footer Icons */}
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
});

Dashboard.displayName = "Dashboard";
export default Dashboard;
