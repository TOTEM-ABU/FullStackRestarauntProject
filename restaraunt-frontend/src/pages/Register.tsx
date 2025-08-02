import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  User,
  Phone,
  ChefHat,
  MapPin,
  Building,
  Crown,
  Sparkles,
} from "lucide-react";
import { regionAPI, restaurantAPI } from "../services/api";
import type { Region, Restaurant } from "../types";

interface RegisterForm {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: "ADMIN" | "SUPER_ADMIN" | "CASHER" | "WAITER";
  regionId?: string;
  restaurantId?: string;
}

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch("password");

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        console.log("Fetching regions...");
        const response = await regionAPI.getAll();
        console.log("Regions response:", response);
        // Support both array and {data: array} formats
        const regionsArr = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];
        console.log("Processed regions:", regionsArr);
        setRegions(regionsArr);
      } catch (error) {
        console.error("Error fetching regions:", error);
        setRegions([]);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (selectedRegion) {
        try {
          const response = await restaurantAPI.getAll({
            regionId: selectedRegion,
          });
          const restArr = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
            ? response.data
            : [];
          setRestaurants(restArr);
        } catch (error) {
          setRestaurants([]);
        }
      } else {
        setRestaurants([]);
      }
    };
    fetchRestaurants();
  }, [selectedRegion]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      console.log("Registration data:", data);
      setIsLoading(true);
      await registerUser(
        data.name,
        data.phone,
        data.password,
        data.role,
        data.regionId || undefined,
        data.restaurantId || undefined
      );
      console.log("Registration successful");
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-50 via-accent-50 to-primary-50 bg-restaurant-pattern py-8 relative overflow-hidden">
      {/* Food Rain Animation */}
      <div className="food-rain">
        <div className="food-item">🍕</div>
        <div className="food-item">☕</div>
        <div className="food-item">🍷</div>
        <div className="food-item">🥗</div>
        <div className="food-item">🍔</div>
        <div className="food-item">🍰</div>
        <div className="food-item">🍝</div>
        <div className="food-item">🍣</div>
        <div className="food-item">🍜</div>
        <div className="food-item">🍖</div>
        <div className="food-item">🥐</div>
        <div className="food-item">🍩</div>
        <div className="food-item">🍪</div>
        <div className="food-item">🍦</div>
        <div className="food-item">🍧</div>
        <div className="food-item">🍨</div>
        <div className="food-item">🍫</div>
        <div className="food-item">🍬</div>
        <div className="food-item">🍭</div>
        <div className="food-item">🍮</div>
      </div>

      <div className="max-w-lg w-full mx-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg relative">
              <Crown className="h-10 w-10 text-white" />
              <Sparkles className="h-5 w-5 text-yellow-300 absolute -top-2 -right-2" />
            </div>
          </div>
          <h1 className="mt-6 text-4xl font-bold text-warm-900 mb-2">
            Gastronomica
          </h1>
          <p className="text-warm-600 text-lg mb-1">
            Restaurant Management System
          </p>
          <p className="text-warm-500 text-sm">
            Gastronomica tizimiga qo'shilish uchun ma'lumotlaringizni kiriting
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-warm-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-warm-700 mb-2"
              >
                Ism
              </label>
              <div className="relative">
                <input
                  {...register("name", {
                    required: "Ism kiritilishi shart",
                    minLength: {
                      value: 2,
                      message: "Ism kamida 2 ta belgidan iborat bo'lishi kerak",
                    },
                  })}
                  id="name"
                  type="text"
                  className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="Ismingizni kiriting"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-warm-400" />
                </div>
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-primary-600 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-warm-700 mb-2"
              >
                Telefon raqam
              </label>
              <div className="relative">
                <input
                  {...register("phone", {
                    required: "Telefon raqam kiritilishi shart",
                    pattern: {
                      value: /^\+?[0-9]{12}$/,
                      message: "To'g'ri telefon raqam kiriting (+998901234567)",
                    },
                  })}
                  id="phone"
                  type="tel"
                  className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="+998901234567"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-warm-400" />
                </div>
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-primary-600 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-warm-700 mb-2"
              >
                Parol
              </label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Parol kiritilishi shart",
                    minLength: {
                      value: 6,
                      message:
                        "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
                    },
                  })}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="Parol"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-warm-400 hover:text-warm-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-primary-600 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-warm-700 mb-2"
              >
                Parolni tasdiqlang
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword", {
                    required: "Parolni tasdiqlash shart",
                    validate: (value) =>
                      value === password || "Parollar mos kelmadi",
                  })}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="Parolni qayta kiriting"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-warm-400 hover:text-warm-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-primary-600 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-semibold text-warm-700 mb-2"
              >
                Rol
              </label>
              <div className="relative">
                <select
                  {...register("role", {
                    required: "Rol tanlanishi shart",
                  })}
                  id="role"
                  className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl text-warm-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 appearance-none"
                >
                  <option value="">Rol tanlang</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="CASHER">Kassir</option>
                  <option value="WAITER">Ofitsiant</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChefHat className="h-5 w-5 text-warm-400" />
                </div>
              </div>
              {errors.role && (
                <p className="mt-2 text-sm text-primary-600 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Region Field */}
            <div>
              <label
                htmlFor="regionId"
                className="block text-sm font-semibold text-warm-700 mb-2"
              >
                Hudud (ixtiyoriy)
              </label>
              <div className="relative">
                <select
                  {...register("regionId")}
                  id="regionId"
                  className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl text-warm-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 appearance-none"
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="">Hudud tanlang (ixtiyoriy)</option>
                  {Array.isArray(regions) &&
                    regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-warm-400" />
                </div>
              </div>
            </div>

            {/* Restaurant Field */}
            <div>
              <label
                htmlFor="restaurantId"
                className="block text-sm font-semibold text-warm-700 mb-2"
              >
                Restoran (ixtiyoriy)
              </label>
              <div className="relative">
                <select
                  {...register("restaurantId")}
                  id="restaurantId"
                  className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl text-warm-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 appearance-none disabled:opacity-50"
                  disabled={!selectedRegion}
                >
                  <option value="">
                    {selectedRegion
                      ? "Restoran tanlang (ixtiyoriy)"
                      : "Avval hudud tanlang"}
                  </option>
                  {Array.isArray(restaurants) &&
                    restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-warm-400" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Ro'yxatdan o'tish...
                  </div>
                ) : (
                  "Ro'yxatdan o'tish"
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-warm-200">
              <p className="text-warm-600 mb-3">Hisobingiz bormi?</p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <User className="h-5 w-5 mr-2" />
                Tizimga kiring
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-warm-500 text-sm">
            © 2024 Gastronomica. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
