import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { User } from "../types";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (
    name: string,
    phone: string,
    password: string,
    role: string,
    regionId?: string,
    restaurantId?: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ phone, password });

      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setUser(response.user);
      toast.success("Muvaffaqiyatli kirildi!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Kirishda xatolik yuz berdi"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    phone: string,
    password: string,
    role: string,
    regionId?: string,
    restaurantId?: string
  ) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register({
        name,
        phone,
        password,
        role,
        regionId,
        restaurantId,
      });

      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setUser(response.user);
      toast.success("Muvaffaqiyatli ro'yxatdan o'tildi!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Ro'yxatdan o'tishda xatolik yuz berdi"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Tizimdan chiqildi");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
