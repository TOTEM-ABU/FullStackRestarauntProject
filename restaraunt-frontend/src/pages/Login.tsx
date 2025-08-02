import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Store, ChefHat, Crown, Sparkles } from "lucide-react";

interface LoginForm {
  phone: string;
  password: string;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      await login(data.phone, data.password);
      navigate("/dashboard");
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-50 via-accent-50 to-primary-50 bg-restaurant-pattern relative overflow-hidden">
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

      <div className="max-w-md w-full mx-4 relative z-10">
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
            Tizimga kirish uchun ma'lumotlaringizni kiriting
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-warm-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      message: "To'g'ri telefon raqam kiriting",
                    },
                  })}
                  id="phone"
                  type="tel"
                  className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="+998901234567"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Store className="h-5 w-5 text-warm-400" />
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
                  placeholder="Parolingizni kiriting"
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
                    Kirish...
                  </div>
                ) : (
                  "Tizimga kirish"
                )}
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="text-center pt-6 border-t border-warm-200">
            <p className="text-warm-600 mb-3">Hisobingiz yo'qmi?</p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <ChefHat className="h-5 w-5 mr-2" />
              Ro'yxatdan o'ting
            </Link>
          </div>
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

export default Login;
