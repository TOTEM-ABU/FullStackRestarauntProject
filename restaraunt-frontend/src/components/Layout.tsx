import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  Users,
  Store,
  Package,
  ShoppingCart,
  MapPin,
  Tags,
  DollarSign,
  LogOut,
  Menu,
  X,
  User,
  Crown,
  Sparkles,
  Pizza,
  Coffee,
  Wine,
  Salad,
} from "lucide-react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
        roles: ["ADMIN", "SUPER_ADMIN", "CASHER", "WAITER"],
      },
    ];

    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      return [
        ...baseItems,
        {
          name: "Foydalanuvchilar",
          href: "/users",
          icon: Users,
          roles: ["ADMIN", "SUPER_ADMIN"],
        },
        {
          name: "Restoranlar",
          href: "/restaurants",
          icon: Store,
          roles: ["ADMIN", "SUPER_ADMIN"],
        },
        {
          name: "Mahsulotlar",
          href: "/products",
          icon: Package,
          roles: ["ADMIN", "SUPER_ADMIN"],
        },
        {
          name: "Buyurtmalar",
          href: "/orders",
          icon: ShoppingCart,
          roles: ["ADMIN", "SUPER_ADMIN", "CASHER", "WAITER"],
        },
        {
          name: "Hududlar",
          href: "/regions",
          icon: MapPin,
          roles: ["ADMIN", "SUPER_ADMIN"],
        },
        {
          name: "Kategoriyalar",
          href: "/categories",
          icon: Tags,
          roles: ["ADMIN", "SUPER_ADMIN"],
        },

        {
          name: "Qarzdorliklar",
          href: "/debts",
          icon: DollarSign,
          roles: ["ADMIN", "SUPER_ADMIN", "CASHER"],
        },
        {
          name: "Chiqimlar",
          href: "/withdraws",
          icon: DollarSign,
          roles: ["ADMIN", "SUPER_ADMIN", "CASHER"],
        },
      ];
    }

    if (user.role === "CASHER") {
      return [
        ...baseItems,
        {
          name: "Buyurtmalar",
          href: "/orders",
          icon: ShoppingCart,
          roles: ["CASHER"],
        },
        {
          name: "Qarzdorliklar",
          href: "/debts",
          icon: DollarSign,
          roles: ["CASHER"],
        },
        {
          name: "Chiqimlar",
          href: "/withdraws",
          icon: DollarSign,
          roles: ["CASHER"],
        },
      ];
    }

    if (user.role === "WAITER") {
      return [
        ...baseItems,
        {
          name: "Buyurtmalar",
          href: "/orders",
          icon: ShoppingCart,
          roles: ["WAITER"],
        },
        {
          name: "Mahsulotlar",
          href: "/products",
          icon: Package,
          roles: ["WAITER"],
        },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const NavItem = ({ item }: { item: any }) => {
    const Icon = item.icon;
    return (
      <Link
        to={item.href}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
          isActive(item.href)
            ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg"
            : "text-warm-600 hover:bg-warm-100 hover:text-warm-900"
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <Icon className="mr-3 h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-accent-50 to-primary-50">
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-warm-900 bg-opacity-75 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white/95 backdrop-blur-sm border-r border-warm-200">
          <div className="flex h-16 items-center justify-between px-4 bg-gradient-to-r from-primary-500 to-accent-500">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center mr-3 relative">
                <Crown className="h-5 w-5 text-white" />
                <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  Restaurant Tizimi
                </h1>
                <p className="text-xs text-white/80">Boshqaruv paneli</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-warm-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-2 px-3 py-6">
            {navigationItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>

          <div className="p-4 border-t border-warm-200">
            <div className="flex justify-center space-x-2 text-warm-400">
              <Pizza className="h-4 w-4" />
              <Coffee className="h-4 w-4" />
              <Wine className="h-4 w-4" />
              <Salad className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/95 backdrop-blur-sm border-r border-warm-200 shadow-xl">
          <div className="flex h-16 items-center px-4 bg-gradient-to-r from-primary-500 to-accent-500">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center mr-3 relative">
                <Crown className="h-5 w-5 text-white" />
                <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Gastranomics</h1>
                <p className="text-xs text-white/80">Boshqaruv paneli</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-2 px-3 py-6">
            {navigationItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>

          <div className="p-4 border-t border-warm-200">
            <div className="flex justify-center space-x-2 text-warm-400">
              <Pizza className="h-4 w-4" />
              <Coffee className="h-4 w-4" />
              <Wine className="h-4 w-4" />
              <Salad className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-warm-200 bg-white/90 backdrop-blur-sm px-4 shadow-lg sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-warm-700 hover:text-warm-900 lg:hidden transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="flex items-center gap-x-3">
                <div className="flex items-center gap-x-3 bg-warm-100 px-4 py-2 rounded-xl">
                  <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-warm-900">
                      {user?.name}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800">
                      {user?.role === "ADMIN"
                        ? "👨‍💼"
                        : user?.role === "SUPER_ADMIN"
                        ? "👑"
                        : user?.role === "CASHER"
                        ? "💰"
                        : user?.role === "WAITER"
                        ? "👨‍🍳"
                        : "👋"}{" "}
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-x-2 text-sm font-medium text-warm-700 hover:text-primary-600 transition-colors bg-warm-100 hover:bg-primary-100 px-3 py-2 rounded-xl"
              >
                <LogOut className="h-4 w-4" />
                Chiqish
              </button>
            </div>
          </div>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
