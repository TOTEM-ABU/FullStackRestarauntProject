import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Store, User, Phone } from "lucide-react";
import { regionAPI, restaurantAPI } from "../services/api";
import type { Region, Restaurant } from "../types";

interface RegisterForm {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: "ADMIN" | "SUPER_ADMIN" | "CASHER" | "WAITER";
  regionId: string;
  restaurantId: string;
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
        const response = await regionAPI.getAll();
        // Support both array and {data: array} formats
        const regionsArr = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];
        setRegions(regionsArr);
      } catch (error) {
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
      setIsLoading(true);
      await registerUser(
        data.name,
        data.phone,
        data.password,
        data.role,
        data.regionId,
        data.restaurantId
      );
      navigate("/dashboard");
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Store className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Restaurant System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Yangi hisob yaratish
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Ism
              </label>
              <div className="mt-1 relative">
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
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Ismingizni kiriting"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Telefon raqam
              </label>
              <div className="mt-1 relative">
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
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="+998901234567"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Parol
              </label>
              <div className="mt-1 relative">
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
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Parol"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Parolni tasdiqlang
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("confirmPassword", {
                    required: "Parolni tasdiqlash shart",
                    validate: (value) =>
                      value === password || "Parollar mos kelmadi",
                  })}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Parolni qayta kiriting"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Rol
              </label>
              <select
                {...register("role", {
                  required: "Rol tanlanishi shart",
                })}
                id="role"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Rol tanlang</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="CASHER">Kassir</option>
                <option value="WAITER">Ofitsiant</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Region Field */}
            <div>
              <label
                htmlFor="regionId"
                className="block text-sm font-medium text-gray-700"
              >
                Hudud
              </label>
              <select
                {...register("regionId", {
                  required: "Hudud tanlanishi shart",
                })}
                id="regionId"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <option value="">Hudud tanlang</option>
                {Array.isArray(regions) &&
                  regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
              </select>
              {errors.regionId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.regionId.message}
                </p>
              )}
            </div>

            {/* Restaurant Field */}
            <div>
              <label
                htmlFor="restaurantId"
                className="block text-sm font-medium text-gray-700"
              >
                Restoran
              </label>
              <select
                {...register("restaurantId", {
                  required: "Restoran tanlanishi shart",
                })}
                id="restaurantId"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                disabled={!selectedRegion}
              >
                <option value="">
                  {selectedRegion ? "Restoran tanlang" : "Avval hudud tanlang"}
                </option>
                {Array.isArray(restaurants) &&
                  restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
              </select>
              {errors.restaurantId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.restaurantId.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Ro'yxatdan o'tish"
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Hisobingiz bormi? Tizimga kiring
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
