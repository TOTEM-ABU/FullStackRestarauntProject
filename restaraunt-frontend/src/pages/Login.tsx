import React, { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { Store, Eye, Crown, Sparkles, ChefHat } from "lucide-react";
import FoodRain from "../components/FoodRain";
import { InputField } from "../components";

interface LoginForm {
  phone: string;
  password: string;
}

const Login: React.FC = React.memo(() => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    mode: "onChange",
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const onSubmit = useCallback(
    async (data: LoginForm) => {
      setIsLoading(true);
      try {
        await login(data.phone, data.password);
        navigate("/dashboard");
      } catch (error) {
        console.error("Login error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [login, navigate]
  );

  // Memoized UI texts
  const texts = useMemo(
    () => ({
      title: "Gastronomics",
      subtitle: "Restaurant Management System",
      prompt: "Tizimga kirish uchun ma'lumotlarni kiriting",
      noAccount: "Hisobingiz yo'qmi?",
      register: "Ro'yxatdan o'ting",
      login: "Tizimga kirish",
      loading: "Kirish...",
      copyright: "© 2025 Gastronomics. Barcha huquqlar himoyalangan.",
    }),
    []
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-50 via-accent-50 to-primary-50 relative overflow-hidden">
      <FoodRain />

      <div className="max-w-md w-full mx-4 relative z-10">
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
              label="Telefon raqam"
              icon={Store}
              name="phone"
              type="tel"
              placeholder="+998901234567"
              register={register("phone", {
                required: "Telefon kiritilishi shart",
                pattern: {
                  value: /^\+?[0-9]{12}$/,
                  message: "To'g'ri telefon raqam (12 ta raqam)",
                },
              })}
              errors={errors}
            />

            <InputField
              label="Parol"
              icon={Eye}
              name="password"
              type="password"
              placeholder="Parolingiz"
              showToggle
              register={register("password", {
                required: "Parol kiritilishi shart",
                minLength: { value: 6, message: "Kamida 6 ta belgi" },
              })}
              errors={errors}
              showPassword={showPassword}
              togglePassword={togglePassword}
            />

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
                texts.login
              )}
            </button>
          </form>

          <div className="text-center pt-6 border-t border-warm-200">
            <p className="text-warm-600 mb-3">{texts.noAccount}</p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <ChefHat className="h-5 w-5 mr-2" />
              {texts.register}
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

Login.displayName = "Login";
export default Login;
