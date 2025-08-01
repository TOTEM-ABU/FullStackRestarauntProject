// Role Types
export type RoleType = "ADMIN" | "SUPER_ADMIN" | "CASHER" | "WAITER" | "OWNER";

// Brand Types
export interface Brand {
  id: string;
  name: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  phone: string;
  role: RoleType;
  balans: number;
  regionId?: string;
  restaurantId?: string;
  createdAt: string;
  Region?: Region;
  Restaurant?: Restaurant;
}

// Restaurant Types
export interface Restaurant {
  id: string;
  name: string;
  tip: number;
  address: string;
  phone: string;
  isActive: boolean;
  balance: number;
  regionId?: string;
  createdAt: string;
  Region?: Region;
  Products?: Product[];
  Categories?: Category[];
  Orders?: Order[];
  Withdraws?: Withdraw[];
  Debts?: Debt[];
  Users?: User[];
}

// Region Types
export interface Region {
  id: string;
  name: string;
  createdAt: string;
  user?: User[];
  restaurant?: Restaurant[];
  _count?: {
    Restaurants: number;
  };
}

// Category Types
export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  restaurantId?: string;
  createdAt: string;
  Products?: Product[];
  Restaurant?: Restaurant;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  restaurantId?: string;
  categoryId?: string;
  createdAt: string;
  OrderItem?: OrderItem[];
  Restaurant?: Restaurant;
  Category?: Category;
}

// Order Types
export interface Order {
  id: string;
  table: string;
  total: number;
  status: "PENDING" | "PAID" | "DEBT";
  restaurantId?: string;
  createdAt: string;
  OrderItems?: OrderItem[];
  Debts?: Debt[];
  Withdraws?: Withdraw[];
  Restaurant?: Restaurant;
}

export interface OrderItem {
  id: string;
  quantity: number;
  orderId: string;
  productId: string;
  product?: Product;
  createdAt: string;
}

// Debt Types
export interface Debt {
  id: string;
  username: string;
  amount: number;
  restaurantId?: string;
  orderId?: string;
  createdAt: string;
  Restaurant?: Restaurant;
  Order?: Order;
}

// Withdraw Types
export interface Withdraw {
  id: string;
  type: "INCOME" | "OUTCOME";
  amount: number;
  description?: string;
  restaurantId?: string;
  orderId?: string;
  createdAt: string;
  Restaurant?: Restaurant;
  Order?: Order;
}

// Auth Types
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  password: string;
  role: string;
  regionId?: string;
  restaurantId?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Query Types
export interface UserQuery {
  name?: string;
  phone?: string;
  restaurantId?: string;
  regionId?: string;
  role?: "ADMIN" | "SUPER_ADMIN" | "CASHER" | "WAITER";
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
}

export interface RestaurantQuery {
  name?: string;
  regionId?: string;
  tip?: number;
  address?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductQuery {
  name?: string;
  restaurantId?: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
}

export interface CategoryQuery {
  name?: string;
  restaurantId?: string;
  isActive?: boolean;
  sort?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface OrderQuery {
  table?: string;
  status?: "PENDING" | "PAID" | "DEBT";
  restaurantId?: string;
  page?: number;
  limit?: number;
}

export interface DebtQuery {
  orderId?: string;
  restaurantId?: string;
  client?: string;
  minAmount?: number;
  maxAmount?: number;
  sortByAmount?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface RegionQuery {
  search?: string;
  sort?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// DTO Types
export interface CreateUserDto {
  name: string;
  phone: string;
  password: string;
  role?: string;
  regionId?: string;
  restaurantId?: string;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  password?: string;
  role?: string;
  regionId?: string;
  restaurantId?: string;
}

export interface CreateRestaurantDto {
  name: string;
  tip: number;
  address: string;
  phone: string;
  regionId?: string;
}

export interface UpdateRestaurantDto {
  name?: string;
  tip?: number;
  address?: string;
  phone?: string;
  isActive?: boolean;
  regionId?: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  restaurantId?: string;
  categoryId?: string;
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
  isActive?: boolean;
  restaurantId?: string;
  categoryId?: string;
}

export interface CreateCategoryDto {
  name: string;
  restaurantId?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  isActive?: boolean;
  restaurantId?: string;
}

export interface CreateOrderDto {
  table: string;
  restaurantId?: string;
  OrderItems?: OrderItemDto[];
}

export interface OrderItemDto {
  productId: string;
  quantity: number;
}

export interface UpdateOrderDto {
  table?: string;
  total?: number;
  status?: "PENDING" | "PAID" | "DEBT";
  restaurantId?: string;
}

export interface CreateDebtDto {
  username: string;
  amount: number;
  restaurantId?: string;
  orderId?: string;
}

export interface UpdateDebtDto {
  username?: string;
  amount?: number;
  restaurantId?: string;
  orderId?: string;
}

export interface CreateRegionDto {
  name: string;
}

export interface UpdateRegionDto {
  name?: string;
}

export interface CreateWithdrawDto {
  type: "INCOME" | "OUTCOME";
  amount: number;
  restaurantId: string;
  orderId?: string;
  description?: string;
}

export interface UpdateWithdrawDto {
  orderId?: string;
  restaurantId?: string;
  amount?: number;
  type?: "INCOME" | "OUTCOME";
  description?: string;
}

export interface CreateBrandDto {
  name: string;
  icon?: string;
}

export interface UpdateBrandDto {
  name?: string;
  icon?: string;
  isActive?: boolean;
}
