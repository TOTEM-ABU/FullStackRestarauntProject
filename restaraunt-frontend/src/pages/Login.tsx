import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Store, ChefHat, Crown, Sparkles } from "lucide-react";

interface LoginForm {
  phone: string;
  password: string;
}

const FoodRain = () => {
  const foods = [
    "🍕", // Pizza
    "☕", // Coffee
    "🍷", // Wine Glass
    "🥗", // Salad
    "🍔", // Burger
    "🍰", // Cake
    "🍝", // Spaghetti
    "🍣", // Sushi
    "🍜", // Ramen
    "🥩", // Steak
    "🥐", // Croissant
    "🍩", // Donut
    "🍪", // Cookie
    "🍦", // Ice Cream
    "🍧", // Shaved Ice
    "🍨", // Ice Cream Cone
    "🍫", // Chocolate
    "🍬", // Candy
    "🍭", // Lollipop
    "🍮", // Custard
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden perspective-1000">
      {[...Array(25)].map((_, i) => {
        const food = foods[Math.floor(Math.random() * foods.length)];
        const delay = Math.random() * 8;
        const duration = 10 + Math.random() * 10;
        const left = Math.random() * 100;
        const size = 25 + Math.random() * 35;
        const depth = Math.random() * 300 - 150;
        const rotateX = Math.random() * 30 - 15;
        const rotateY = Math.random() * 360;
        const blur = Math.random() * 1.5;

        return (
          <div
            key={i}
            className="absolute animate-fall-3d"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              fontSize: `${size}px`,
              transform: `translateZ(${depth}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              filter: `blur(${blur}px) drop-shadow(0 0 12px rgba(255,215,0,0.7))`,
              opacity: 0.7 + Math.random() * 0.3,
            }}
          >
            {food}
          </div>
        );
      })}
    </div>
  );
};

interface InputFieldProps {
  label: string;
  icon: React.ElementType;
  name: keyof LoginForm;
  type?: string;
  placeholder: string;
  showToggle?: boolean;
  register: any;
  errors: any;
  showPassword?: boolean;
  togglePassword?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  icon: Icon,
  name,
  type = "text",
  placeholder,
  showToggle,
  register,
  errors,
  showPassword,
  togglePassword,
}) => (
  <div>
    <label className="block text-sm font-semibold text-warm-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <input
        type={showToggle && showPassword ? "text" : type}
        {...register(name, {
          required: `${label} kiritilishi shart`,
          ...(name === "phone" && {
            pattern: {
              value: /^\+?[0-9]{12}$/,
              message: "To'g'ri telefon raqam",
            },
          }),
          ...(name === "password" && {
            minLength: { value: 6, message: "Kamida 6 ta belgi" },
          }),
        })}
        className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white/50"
        placeholder={placeholder}
      />
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-warm-400" />
      </div>
      {showToggle && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute inset-y-0 right-10 flex items-center text-warm-400 hover:text-warm-600"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
    {errors[name] && (
      <p className="mt-2 text-sm text-primary-600 flex items-center">
        Warning: {errors[name]?.message}
      </p>
    )}
  </div>
);

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [ui, setUi] = useState({ showPassword: false, isLoading: false });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const togglePassword = useCallback(() => {
    setUi((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  const onSubmit = async (data: LoginForm) => {
    setUi((prev) => ({ ...prev, isLoading: true }));
    try {
      await login(data.phone, data.password);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
    } finally {
      setUi((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-50 via-accent-50 to-primary-50 relative overflow-hidden">
      <FoodRain />

      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg relative">
            <Crown className="h-10 w-10 text-white" />
            <Sparkles className="h-5 w-5 text-yellow-300 absolute -top-2 -right-2" />
          </div>
          <h1 className="mt-6 text-4xl font-bold text-warm-900 mb-2">
            Gastronomics
          </h1>
          <p className="text-warm-600 text-lg mb-1">
            Restaurant Management System
          </p>
          <p className="text-warm-500 text-sm">
            Tizimga kirish uchun ma'lumotlarni kiriting
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-warm-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InputField
              label="Telefon raqam"
              icon={Store}
              name="phone"
              type="tel"
              placeholder="+998901234567"
              register={register}
              errors={errors}
            />
            <InputField
              label="Parol"
              icon={Eye}
              name="password"
              type="password"
              placeholder="Parolingiz"
              showToggle
              register={register}
              errors={errors}
              showPassword={ui.showPassword}
              togglePassword={togglePassword}
            />

            <button
              type="submit"
              disabled={ui.isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ui.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Kirish...
                </div>
              ) : (
                "Tizimga kirish"
              )}
            </button>
          </form>

          <div className="text-center pt-6 border-t border-warm-200">
            <p className="text-warm-600 mb-3">Hisobingiz yo'qmi?</p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              <ChefHat className="h-5 w-5 mr-2" />
              Ro'yxatdan o'ting
            </Link>
          </div>
        </div>

        <p className="text-center mt-8 text-warm-500 text-sm">
          © 2025 Gastronomica. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  );
};

export default Login;
