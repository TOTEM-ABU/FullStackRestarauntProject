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
  Settings,
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

    // Admin va Super Admin uchun barcha panel
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

    // CASHER uchun panel
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

    // WAITER uchun panel
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
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive(item.href)
            ? "bg-primary-100 text-primary-700"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <Icon className="mr-3 h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Restaurant System
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigationItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Restaurant System
            </h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigationItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* User info */}
              <div className="flex items-center gap-x-2">
                <div className="flex items-center gap-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
                Chiqish
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
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
