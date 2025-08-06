export type RoleType = "ADMIN" | "SUPER_ADMIN" | "CASHER" | "WAITER" | "OWNER";
export type RestaurantType =
  | "FAST_FOOD"
  | "CAFE"
  | "RESTAURANT"
  | "PIZZERIA"
  | "SUSHI_BAR"
  | "OTHER";

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

export interface Restaurant {
  id: string;
  name: string;
  tip: number;
  type: RestaurantType;
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

export interface Region {
  id: string;
  name: string;
  createdAt: string;
  user?: User[];
  restaurant?: Restaurant[];
  Users?: User[];
  _count?: {
    Restaurants: number;
    restaurant: number;
  };
}

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  restaurantId?: string;
  createdAt: string;
  Products?: Product[];
  Restaurant?: Restaurant;
}

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

export interface Order {
  id: string;
  table: number;
  total: number;
  status: "PENDING" | "PAID" | "DEBT";
  restaurantId?: string;
  waiterId?: string;
  createdAt: string;
  OrderItems?: OrderItem[];
  Debts?: Debt[];
  Withdraws?: Withdraw[];
  Restaurant?: Restaurant;
  Waiter?: User;
}

export interface OrderItem {
  id: string;
  quantity: number;
  orderId: string;
  productId: string;
  product?: Product;
  createdAt: string;
}

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

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

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
  productId?: string;
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
  type: RestaurantType;
  address: string;
  phone: string;
  regionId?: string;
  isActive?: boolean;
}

export interface UpdateRestaurantDto {
  name?: string;
  tip?: number;
  type?: RestaurantType;
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
  isActive?: boolean;
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
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  isActive?: boolean;
  restaurantId?: string;
}

export interface CreateOrderDto {
  table: number;
  restaurantId?: string;
  waiterId: string;
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
