import axios from "axios";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Restaurant,
  Product,
  Category,
  Order,
  Debt,
  Region,
  Withdraw,
  Brand,
  UserQuery,
  RestaurantQuery,
  ProductQuery,
  CategoryQuery,
  OrderQuery,
  DebtQuery,
  RegionQuery,
  CreateUserDto,
  UpdateUserDto,
  CreateRestaurantDto,
  UpdateRestaurantDto,
  CreateProductDto,
  UpdateProductDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateOrderDto,
  UpdateOrderDto,
  CreateDebtDto,
  UpdateDebtDto,
  CreateRegionDto,
  UpdateRegionDto,
  CreateWithdrawDto,
  UpdateWithdrawDto,
  CreateBrandDto,
  UpdateBrandDto,
} from "../types";

const API_BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const response = await api.post("/user/refresh-token", {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem("access_token", access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Only redirect to login if refresh token fails
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/user/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post("/user/register", data);
    return response.data;
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<{ access_token: string }> => {
    const response = await api.post("/user/refresh-token", {
      refresh_token: refreshToken,
    });
    return response.data;
  },
};

// User API
export const userAPI = {
  getAll: async (params?: UserQuery) => {
    const response = await api.get("/user", { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/user/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDto) => {
    const response = await api.patch(`/user/${id}`, data);
    return response.data;
  },

  updateRoleToAdmin: async (id: string) => {
    const response = await api.patch(`/user/${id}/role`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  },
};

// Restaurant API
export const restaurantAPI = {
  getAll: async (params?: RestaurantQuery) => {
    const response = await api.get("/restaraunt", { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/restaraunt/${id}`);
    return response.data;
  },

  create: async (data: CreateRestaurantDto) => {
    const response = await api.post("/restaraunt", data);
    return response.data;
  },

  update: async (id: string, data: UpdateRestaurantDto) => {
    const response = await api.patch(`/restaraunt/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/restaraunt/${id}`);
    return response.data;
  },
};

// Product API
export const productAPI = {
  getAll: async (params?: ProductQuery) => {
    const response = await api.get("/product", { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/product/${id}`);
    return response.data;
  },

  create: async (data: CreateProductDto) => {
    const response = await api.post("/product", data);
    return response.data;
  },

  update: async (id: string, data: UpdateProductDto) => {
    const response = await api.patch(`/product/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  },
};

// Category API
export const categoryAPI = {
  getAll: async (params?: CategoryQuery) => {
    const response = await api.get("/category", { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/category/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryDto) => {
    const response = await api.post("/category", data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryDto) => {
    const response = await api.patch(`/category/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/category/${id}`);
    return response.data;
  },
};

// Order API
export const orderAPI = {
  getAll: async (params?: OrderQuery) => {
    const response = await api.get("/order", { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/order/${id}`);
    return response.data;
  },

  create: async (data: CreateOrderDto) => {
    const response = await api.post("/order", data);
    return response.data;
  },

  update: async (id: string, data: UpdateOrderDto) => {
    const response = await api.patch(`/order/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/order/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Order delete API error:", error);
      throw error;
    }
  },
};

// Debt API
export const debtAPI = {
  getAll: async (params?: DebtQuery) => {
    const response = await api.get("/debt", { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/debt/${id}`);
    return response.data;
  },

  create: async (data: CreateDebtDto) => {
    const response = await api.post("/debt", data);
    return response.data;
  },

  update: async (id: string, data: UpdateDebtDto) => {
    const response = await api.patch(`/debt/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/debt/${id}`);
    return response.data;
  },
};

// Region API
export const regionAPI = {
  getAll: async (params?: RegionQuery) => {
    const response = await api.get("/region", { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/region/${id}`);
    return response.data;
  },

  create: async (data: CreateRegionDto) => {
    const response = await api.post("/region", data);
    return response.data;
  },

  update: async (id: string, data: UpdateRegionDto) => {
    const response = await api.patch(`/region/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/region/${id}`);
    return response.data;
  },
};

// Withdraw API
export const withdrawAPI = {
  getAll: async (params?: any) => {
    const response = await api.get("/withdraw", { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/withdraw/${id}`);
    return response.data;
  },

  create: async (data: CreateWithdrawDto) => {
    const response = await api.post("/withdraw", data);
    return response.data;
  },

  update: async (id: string, data: UpdateWithdrawDto) => {
    const response = await api.patch(`/withdraw/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/withdraw/${id}`);
    return response.data;
  },
};

// Brand API
export const brandAPI = {
  getAll: async () => {
    const response = await api.get("/brand");
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/brand/${id}`);
    return response.data;
  },

  create: async (data: CreateBrandDto) => {
    const response = await api.post("/brand", data);
    return response.data;
  },

  update: async (id: string, data: UpdateBrandDto) => {
    const response = await api.patch(`/brand/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/brand/${id}`);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },
};

export default api;
