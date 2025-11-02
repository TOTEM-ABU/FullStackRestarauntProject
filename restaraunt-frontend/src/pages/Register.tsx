import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import {
  User,
  Phone,
  Eye,
  ChefHat,
  MapPin,
  Building,
  Crown,
  Sparkles,
} from "lucide-react";
import { regionAPI, restaurantAPI } from "../services/api";
import type { Region, Restaurant } from "../types";
import { InputField, SelectField, FoodRain } from "../components";

interface RegisterForm {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: "SUPER_ADMIN" | "CASHER" | "WAITER";
  regionId?: string;
  restaurantId?: string;
}

const Register: React.FC = React.memo(() => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    mode: "onChange",
    defaultValues: { role: "CASHER" },
  });

  const password = watch("password");

  const togglePassword = useCallback(
    (field: "password" | "confirmPassword") => {
      setShowPassword((prev) => (field === "password" ? !prev : prev));
      setShowConfirmPassword((prev) =>
        field === "confirmPassword" ? !prev : prev
      );
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

  const onSubmit = useCallback(
    async (data: RegisterForm) => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    },
    [registerUser, navigate]
  );

  const texts = useMemo(
    () => ({
      title: "Gastronomics",
      subtitle: "Restaurant Management System",
      prompt: "Tizimga qo'shilish uchun ma'lumotlarni kiriting",
      hasAccount: "Hisobingiz bormi?",
      login: "Tizimga kirish",
      submit: "Ro'yxatdan o'tish",
      loading: "Yuklanmoqda...",
      copyright: "© 2025 Gastronomics. Barcha huquqlar himoyalangan.",
    }),
    []
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-50 via-accent-50 to-primary-50 py-8 relative overflow-hidden">
      <FoodRain />

      <div className="max-w-lg w-full mx-4 relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg relative">
            <Crown className="h-10 w-10 text-white" />
            <Sparkles className="h-5 w-5 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h1 className="mt-6 text-4xl font-bold text-warm-900 mb-2">
            {texts.title}
          </h1>
          <p className="text-warm-600 text-lg mb-1">{texts.subtitle}</p>
          <p className="text-warm-500 text-sm">{texts.prompt}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-warm-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InputField
              label="Ism"
              icon={User}
              name="name"
              placeholder="Ismingiz"
              register={register("name", {
                required: "Ism shart",
                minLength: { value: 2, message: "Kamida 2 belgi" },
              })}
              errors={errors}
            />

            <InputField
              label="Telefon"
              icon={Phone}
              name="phone"
              type="tel"
              placeholder="+998901234567"
              register={register("phone", {
                required: "Telefon shart",
                pattern: {
                  value: /^\+?[0-9]{12}$/,
                  message: "Noto'g'ri format",
                },
              })}
              errors={errors}
            />

            <InputField
              label="Parol"
              icon={Eye}
              name="password"
              type="password"
              placeholder="Parol"
              showToggle
              register={register("password", {
                required: "Parol shart",
                minLength: { value: 6, message: "Kamida 6 belgi" },
              })}
              errors={errors}
              showPassword={showPassword}
              togglePassword={() => togglePassword("password")}
            />

            <InputField
              label="Parolni tasdiqlang"
              icon={Eye}
              name="confirmPassword"
              type="password"
              placeholder="Qayta kiriting"
              showToggle
              register={register("confirmPassword", {
                required: "Tasdiqlash shart",
                validate: (v) => v === password || "Parollar mos emas",
              })}
              errors={errors}
              showPassword={showConfirmPassword}
              togglePassword={() => togglePassword("confirmPassword")}
            />

            <SelectField
              label="Rol"
              icon={ChefHat}
              name="role"
              register={register("role")}
              errors={errors}
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
              register={register("regionId")}
              errors={errors}
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
              register={register("restaurantId")}
              errors={errors}
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
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {texts.loading}
                </div>
              ) : (
                texts.submit
              )}
            </button>
          </form>

          <div className="text-center pt-6 border-t border-warm-200">
            <p className="text-warm-600 mb-3">{texts.hasAccount}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <User className="h-5 w-5 mr-2" /> {texts.login}
            </Link>
          </div>
        </div>

        <p className="text-center mt-8 text-warm-500 text-sm">
          {texts.copyright}
        </p>
      </div>
    </div>
  );
});

Register.displayName = "Register";
export default Register;
