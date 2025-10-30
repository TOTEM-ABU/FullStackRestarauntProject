import React, { useState, useEffect, useCallback } from "react";
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
  role: "SUPER_ADMIN" | "CASHER" | "WAITER";
  regionId?: string;
  restaurantId?: string;
}

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [ui, setUi] = useState({
    showPassword: false,
    showConfirmPassword: false,
    isLoading: false,
  });

  const [regions, setRegions] = useState<Region[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: { role: "CASHER" },
  });

  const password = watch("password");

  const togglePassword = useCallback(
    (field: "password" | "confirmPassword") => {
      setUi((prev) => ({
        ...prev,
        [field === "password" ? "showPassword" : "showConfirmPassword"]:
          !prev[field === "password" ? "showPassword" : "showConfirmPassword"],
      }));
    },
    []
  );

  const fetchRegions = useCallback(async () => {
    try {
      const { data } = await regionAPI.getAll();
      setRegions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Hududlar yuklanmadi:", error);
      setRegions([]);
    }
  }, []);

  const fetchRestaurants = useCallback(async () => {
    if (!selectedRegion) {
      setRestaurants([]);
      return;
    }
    try {
      const { data } = await restaurantAPI.getAll({ regionId: selectedRegion });
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Restoranlar yuklanmadi:", error);
      setRestaurants([]);
    }
  }, [selectedRegion]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const onSubmit = async (data: RegisterForm) => {
    setUi((prev) => ({ ...prev, isLoading: true }));
    try {
      await registerUser(
        data.name,
        data.phone,
        data.password,
        data.role,
        data.regionId,
        data.restaurantId
      );
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Ro'yxatdan o'tish xatosi:", error);
    } finally {
      setUi((prev) => ({ ...prev, isLoading: false }));
    }
  };

  interface InputFieldProps {
    label: string;
    icon: React.ElementType;
    type?: string;
    name: keyof RegisterForm;
    placeholder: string;
    showToggle?: boolean;
    required?: string | { value: number; message: string };
    minLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    validate?: (value: string) => string | true;
  }

  const InputField: React.FC<InputFieldProps> = ({
    label,
    icon: Icon,
    type = "text",
    name,
    placeholder,
    showToggle,
    ...validation
  }) => {
    const isPasswordField = name === "password" || name === "confirmPassword";
    const show = isPasswordField
      ? name === "password"
        ? ui.showPassword
        : ui.showConfirmPassword
      : false;

    return (
      <div>
        <label className="block text-sm font-semibold text-warm-700 mb-2">
          {label}
        </label>
        <div className="relative">
          <input
            type={showToggle && show ? "text" : type}
            {...register(name, validation)}
            className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white/50"
            placeholder={placeholder}
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-warm-400" />
          </div>
          {showToggle && (
            <button
              type="button"
              onClick={() =>
                togglePassword(name as "password" | "confirmPassword")
              }
              className="absolute inset-y-0 right-10 flex items-center text-warm-400 hover:text-warm-600"
            >
              {show ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        {errors[name] && (
          <p className="mt-2 text-sm text-primary-600 flex items-center">
            Warning: {(errors[name] as any)?.message}
          </p>
        )}
      </div>
    );
  };

  interface SelectFieldProps {
    label: string;
    icon: React.ElementType;
    name: keyof RegisterForm;
    children: React.ReactNode;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  }

  const SelectField: React.FC<SelectFieldProps> = ({
    label,
    icon: Icon,
    name,
    children,
    disabled,
    onChange,
  }) => (
    <div>
      <label className="block text-sm font-semibold text-warm-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          {...register(name)}
          disabled={disabled}
          onChange={(e) => {
            register(name).onChange(e);
            onChange?.(e);
          }}
          className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl text-warm-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white/50 appearance-none disabled:opacity-50"
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-warm-400" />
        </div>
      </div>
    </div>
  );

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
      "🍮",
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-50 via-accent-50 to-primary-50 py-8 relative overflow-hidden">
      <FoodRain />

      <div className="max-w-lg w-full mx-4 relative z-10">
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
            Tizimga qo'shilish uchun ma'lumotlarni kiriting
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-warm-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InputField
              label="Ism"
              icon={User}
              name="name"
              placeholder="Ismingiz"
              required="Ism shart"
              minLength={{ value: 2, message: "Kamida 2 belgi" }}
            />
            <InputField
              label="Telefon"
              icon={Phone}
              name="phone"
              type="tel"
              placeholder="+998901234567"
              required="Telefon shart"
              pattern={{ value: /^\+?[0-9]{12}$/, message: "Noto'g'ri format" }}
            />
            <InputField
              label="Parol"
              icon={Eye}
              name="password"
              type="password"
              placeholder="Parol"
              showToggle
              required="Parol shart"
              minLength={{ value: 6, message: "Kamida 6 belgi" }}
            />
            <InputField
              label="Parolni tasdiqlang"
              icon={Eye}
              name="confirmPassword"
              type="password"
              placeholder="Qayta kiriting"
              showToggle
              required="Tasdiqlash shart"
              validate={(v) => v === password || "Parollar mos emas"}
            />
            <SelectField
              label="Rol"
              icon={ChefHat}
              name="role"
              required="Rol tanlang"
            >
              <option value="">Tanlang</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="CASHER">Kassir</option>
              <option value="WAITER">Ofitsiant</option>
            </SelectField>
            <SelectField
              label={`Hudud (ixtiyoriy) (${regions.length} ta)`}
              icon={MapPin}
              name="regionId"
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="">Tanlang</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Restoran (ixtiyoriy)"
              icon={Building}
              name="restaurantId"
              disabled={!selectedRegion}
            >
              <option value="">
                {selectedRegion ? "Tanlang" : "Avval hudud tanlang"}
              </option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </SelectField>

            <button
              type="submit"
              disabled={ui.isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ui.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Yuklanmoqda...
                </div>
              ) : (
                "Ro'yxatdan o'tish"
              )}
            </button>
          </form>

          <div className="text-center pt-6 border-t border-warm-200">
            <p className="text-warm-600 mb-3">Hisobingiz bormi?</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              <User className="h-5 w-5 mr-2" /> Tizimga kirish
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

export default Register;
