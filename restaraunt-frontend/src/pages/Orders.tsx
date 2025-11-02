import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  useMemo,
} from "react";
import { orderAPI, restaurantAPI, productAPI } from "../services/api";
import type { Order, Restaurant, Product, CreateOrderDto } from "../types";
import {
  Plus,
  Search,
  Trash2,
  Eye,
  ShoppingCart as CartIcon,
  Filter,
  DollarSign,
  Store,
  Package,
  Calendar,
  User as UserIcon,
  X,
  RefreshCw,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { FoodRain, Modal } from "../components";

interface OrderItem {
  productId: string;
  quantity: number;
}

interface FilterState {
  searchTerm: string;
  selectedRestaurant: string;
  selectedProduct: string;
}

interface CreateModalState {
  isOpen: boolean;
  restaurantId: string;
  tableNumber: string;
  items: OrderItem[];
}

interface ViewModalState {
  isOpen: boolean;
  order: Order | null;
}

interface State {
  filters: FilterState;
  createModal: CreateModalState;
  viewModal: ViewModalState;
}

type Action =
  | { type: "SET_FILTER"; payload: { key: keyof FilterState; value: string } }
  | { type: "RESET_FILTERS" }
  | { type: "OPEN_CREATE_MODAL" }
  | { type: "CLOSE_CREATE_MODAL" }
  | {
      type: "SET_CREATE_FIELD";
      payload: { key: keyof Omit<CreateModalState, "items">; value: string };
    }
  | { type: "ADD_ITEM"; payload?: OrderItem }
  | {
      type: "UPDATE_ITEM";
      payload: {
        index: number;
        field: keyof OrderItem;
        value: string | number;
      };
    }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "DUPLICATE_ITEM"; payload: number }
  | { type: "CLEAR_ITEMS" }
  | { type: "OPEN_VIEW"; payload: Order }
  | { type: "CLOSE_VIEW" };

const initialState: State = {
  filters: { searchTerm: "", selectedRestaurant: "", selectedProduct: "" },
  createModal: { isOpen: false, restaurantId: "", tableNumber: "", items: [] },
  viewModal: { isOpen: false, order: null },
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_FILTER":
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };

    case "RESET_FILTERS":
      return { ...state, filters: initialState.filters };

    case "OPEN_CREATE_MODAL":
      return {
        ...state,
        createModal: { ...initialState.createModal, isOpen: true },
      };

    case "CLOSE_CREATE_MODAL":
      return { ...state, createModal: initialState.createModal };

    case "SET_CREATE_FIELD":
      return {
        ...state,
        createModal: {
          ...state.createModal,
          [action.payload.key]: action.payload.value,
        },
      };

    case "ADD_ITEM": {
      const newItem = action.payload || { productId: "", quantity: 1 };
      return {
        ...state,
        createModal: {
          ...state.createModal,
          items: [...state.createModal.items, newItem],
        },
      };
    }

    case "UPDATE_ITEM": {
      const items = [...state.createModal.items];
      items[action.payload.index] = {
        ...items[action.payload.index],
        [action.payload.field]: action.payload.value,
      };
      return { ...state, createModal: { ...state.createModal, items } };
    }

    case "REMOVE_ITEM": {
      const items = state.createModal.items.filter(
        (_, i) => i !== action.payload
      );
      return { ...state, createModal: { ...state.createModal, items } };
    }

    case "DUPLICATE_ITEM": {
      const item = state.createModal.items[action.payload];
      if (!item) return state;
      const newItems = [...state.createModal.items];
      newItems.splice(action.payload + 1, 0, { ...item });
      return {
        ...state,
        createModal: { ...state.createModal, items: newItems },
      };
    }

    case "CLEAR_ITEMS":
      return { ...state, createModal: { ...state.createModal, items: [] } };

    case "OPEN_VIEW":
      return { ...state, viewModal: { isOpen: true, order: action.payload } };

    case "CLOSE_VIEW":
      return { ...state, viewModal: initialState.viewModal };

    default:
      return state;
  }
};

// const useDebounce = (value: string, delay: number) => {
//   const [debounced, setDebounced] = useState(value);
//   useEffect(() => {
//     const handler = setTimeout(() => setDebounced(value), delay);
//     return () => clearTimeout(handler);
//   }, [value, delay]);
//   return debounced;
// };

const OrderRow = React.memo(
  ({
    order,
    onView,
    onDelete,
    userRole,
  }: {
    order: Order;
    onView: (o: Order) => void;
    onDelete: (id: string) => void;
    userRole: string;
  }) => {
    const formatCurrency = useMemo(
      () => (amount: number) =>
        new Intl.NumberFormat("uz-UZ", {
          style: "currency",
          currency: "UZS",
        }).format(amount),
      []
    );

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  #{order.id.slice(-4)}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                Buyurtma #{order.id.slice(-6)}
              </div>
              <div className="text-sm text-gray-500">ID: {order.id}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <Store className="h-4 w-4 mr-2 text-gray-400" />
            <span>{order.Restaurant?.name || "-"}</span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{order.Waiter?.name || "-"}</span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          Stol {order.table}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-green-500" />
            <span className="text-sm font-medium text-green-600">
              {formatCurrency(order.total)}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-1" />
            {(order.OrderItems || []).length} ta
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(order.createdAt).toLocaleDateString("uz-UZ")}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onView(order)}
              className="text-primary-600 hover:text-primary-900"
            >
              <Eye className="h-4 w-4" />
            </button>
            {(userRole === "WAITER" || userRole === "CASHER") && (
              <button
                onClick={() => onDelete(order.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(8)].map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
    ))}
  </tr>
);

const OrderItemRow = React.memo(
  ({
    item,
    index,
    products,
    dispatch,
  }: {
    item: OrderItem;
    index: number;
    products: Product[];
    dispatch: React.Dispatch<Action>;
  }) => {
    const product = products.find((p) => p.id === item.productId);
    const price = product ? product.price * item.quantity : 0;
    const formatCurrency = useMemo(
      () => (amount: number) =>
        new Intl.NumberFormat("uz-UZ", {
          style: "currency",
          currency: "UZS",
        }).format(amount),
      []
    );

    return (
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mahsulot #{index + 1}
          </label>
          <select
            className="input w-full"
            value={item.productId}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_ITEM",
                payload: { index, field: "productId", value: e.target.value },
              })
            }
          >
            <option value="">Mahsulotni tanlang</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - {formatCurrency(p.price)}
              </option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Miqdori
          </label>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_ITEM",
                payload: {
                  index,
                  field: "quantity",
                  value: Number(e.target.value) || 1,
                },
              })
            }
            className="input w-full"
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Narxi
          </label>
          <div className="text-sm font-semibold text-green-600">
            {formatCurrency(price)}
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-6">
          <button
            onClick={() => dispatch({ type: "DUPLICATE_ITEM", payload: index })}
            className="text-blue-600 hover:text-blue-900 p-1"
            title="Nusxalash"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => dispatch({ type: "REMOVE_ITEM", payload: index })}
            className="text-red-600 hover:text-red-900 p-1"
            title="O'chirish"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }
);

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll({
        restaurantId: state.filters.selectedRestaurant || undefined,
        productId: state.filters.selectedProduct || undefined,
      });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Orders yuklashda xatolik:", error);
      toast.error("Buyurtmalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, [state.filters.selectedRestaurant, state.filters.selectedProduct]);

  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await restaurantAPI.getAll({ limit: 100, page: 1 });
      setRestaurants(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Restaurants yuklashda xatolik:", error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await productAPI.getAll({ limit: 100, page: 1 });
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Products yuklashda xatolik:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = useCallback(() => fetchOrders(), [fetchOrders]);
  const handleReset = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
    fetchOrders();
  }, [fetchOrders]);

  const handleCreate = useCallback(() => {
    if (user?.role !== "WAITER" && user?.role !== "CASHER")
      return toast.error("Siz buyurtma yarata olmaysiz!");
    dispatch({ type: "OPEN_CREATE_MODAL" });
  }, [user?.role]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (user?.role !== "WAITER" && user?.role !== "CASHER")
        return toast.error("Siz buyurtmani o'chira olmaysiz!");
      if (
        !window.confirm(
          "Buyurtmani o'chirishni xohlaysizmi?\n\nBu amalni qaytarib bo'lmaydi!"
        )
      )
        return;
      try {
        await orderAPI.delete(id);
        toast.success("Buyurtma muvaffaqiyatli o'chirildi");
        fetchOrders();
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Buyurtmani o'chirishda xatolik"
        );
      }
    },
    [user?.role, fetchOrders]
  );

  const handleSubmit = useCallback(async () => {
    if (user?.role !== "WAITER" && user?.role !== "CASHER")
      return toast.error("Siz buyurtma yarata olmaysiz!");
    const { restaurantId, tableNumber, items } = state.createModal;
    if (!restaurantId || !tableNumber)
      return toast.error("Stol raqami va restaurant kiritilishi shart");
    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0)
      return toast.error("Kamida bitta mahsulot qo'shish kerak");

    const productIds = validItems.map((i) => i.productId);
    if (new Set(productIds).size !== productIds.length)
      return toast.error("Bir xil mahsulot bir necha marta qo'shilgan");

    const data: CreateOrderDto = {
      table: tableNumber,
      restaurantId,
      orderItems: validItems,
    };

    try {
      await orderAPI.create(data);
      toast.success("Buyurtma muvaffaqiyatli yaratildi");
      dispatch({ type: "CLOSE_CREATE_MODAL" });
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  }, [user?.role, state.createModal, fetchOrders]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!state.createModal.isOpen) return;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        switch (e.key) {
          case "Enter":
            handleSubmit();
            break;
          case "n":
            dispatch({ type: "ADD_ITEM" });
            break;
          case "d":
            if (state.createModal.items.length > 0) {
              dispatch({
                type: "DUPLICATE_ITEM",
                payload: state.createModal.items.length - 1,
              });
            }
            break;
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [state.createModal.isOpen, state.createModal.items.length, handleSubmit]);

  const formatCurrency = useMemo(
    () => (amount: number) =>
      new Intl.NumberFormat("uz-UZ", {
        style: "currency",
        currency: "UZS",
      }).format(amount),
    []
  );

  const total = useMemo(
    () =>
      state.createModal.items.reduce((sum, item) => {
        const p = products.find((p) => p.id === item.productId);
        return sum + (p?.price || 0) * item.quantity;
      }, 0),
    [state.createModal.items, products]
  );

  const popularProducts = useMemo(() => products.slice(0, 5), [products]);

  return (
    <div className="space-y-6">
      <FoodRain />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buyurtmalar</h1>
          <p className="text-gray-600">
            Tizimdagi barcha buyurtmalarni boshqaring
          </p>
        </div>
        {(user?.role === "WAITER" || user?.role === "CASHER") && (
          <button
            onClick={handleCreate}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Yangi buyurtma
          </button>
        )}
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qidirish
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buyurtma ID bo'yicha..."
                value={state.filters.searchTerm}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FILTER",
                    payload: { key: "searchTerm", value: e.target.value },
                  })
                }
                className="input pl-10"
              />
            </div>
          </div>
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant
            </label>
            <select
              value={state.filters.selectedRestaurant}
              onChange={(e) =>
                dispatch({
                  type: "SET_FILTER",
                  payload: { key: "selectedRestaurant", value: e.target.value },
                })
              }
              className="input"
            >
              <option value="">Barcha</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mahsulot
            </label>
            <select
              value={state.filters.selectedProduct}
              onChange={(e) =>
                dispatch({
                  type: "SET_FILTER",
                  payload: { key: "selectedProduct", value: e.target.value },
                })
              }
              className="input"
            >
              <option value="">Barcha</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Filter className="h-4 w-4" /> Filtrlash
          </button>
          <button
            onClick={handleReset}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Tozalash
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[...Array(8)].map((_, i) => (
                    <th
                      key={i}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      ...
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <CartIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Buyurtmalar topilmadi
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Yangi buyurtma qo'shing
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Buyurtma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ofitsiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Summa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mahsulotlar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sana
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onView={(o) => dispatch({ type: "OPEN_VIEW", payload: o })}
                    onDelete={handleDelete}
                    userRole={user?.role || ""}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={state.createModal.isOpen}
        onClose={() => dispatch({ type: "CLOSE_CREATE_MODAL" })}
        title="Yangi buyurtma"
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stol raqami *
              </label>
              <input
                type="text"
                value={state.createModal.tableNumber}
                onChange={(e) =>
                  dispatch({
                    type: "SET_CREATE_FIELD",
                    payload: { key: "tableNumber", value: e.target.value },
                  })
                }
                className="input w-full"
                placeholder="Stol raqami"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant *
              </label>
              <select
                className="input w-full"
                value={state.createModal.restaurantId}
                onChange={(e) =>
                  dispatch({
                    type: "SET_CREATE_FIELD",
                    payload: { key: "restaurantId", value: e.target.value },
                  })
                }
              >
                <option value="">Restaurantni tanlang</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {popularProducts.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Tezkor buyurtmalar
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() =>
                      dispatch({
                        type: "ADD_ITEM",
                        payload: { productId: p.id, quantity: 1 },
                      })
                    }
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                  >
                    + {p.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    for (let i = 0; i < 3; i++) dispatch({ type: "ADD_ITEM" });
                  }}
                  className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200"
                >
                  +3 Bo'sh
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Mahsulotlar * ({state.createModal.items.length} ta)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    for (let i = 0; i < 3; i++) dispatch({ type: "ADD_ITEM" });
                  }}
                  className="btn btn-secondary btn-sm flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> +3
                </button>
                <button
                  onClick={() => dispatch({ type: "ADD_ITEM" })}
                  className="btn btn-secondary btn-sm flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> +1
                </button>
                {state.createModal.items.length > 0 && (
                  <button
                    onClick={() => dispatch({ type: "CLEAR_ITEMS" })}
                    className="btn btn-danger btn-sm flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Tozalash
                  </button>
                )}
              </div>
            </div>

            {state.createModal.items.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Mahsulot qo'shilmagan
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Buyurtma uchun mahsulot qo'shing
                </p>
                <button
                  onClick={() => dispatch({ type: "ADD_ITEM" })}
                  className="btn btn-primary btn-sm"
                >
                  <Plus className="h-4 w-4 mr-2" /> Birinchi mahsulot
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {state.createModal.items.map((item, i) => (
                  <OrderItemRow
                    key={i}
                    item={item}
                    index={i}
                    products={products}
                    dispatch={dispatch}
                  />
                ))}
              </div>
            )}

            {state.createModal.items.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Jami:{" "}
                      {
                        state.createModal.items.filter((i) => i.productId)
                          .length
                      }{" "}
                      ta
                    </span>
                    <br />
                    <span className="text-sm text-gray-500">
                      Miqdor:{" "}
                      {state.createModal.items.reduce(
                        (s, i) => s + i.quantity,
                        0
                      )}{" "}
                      ta
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-700">
                      Jami summa:
                    </span>
                    <br />
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <div className="flex-1 text-left text-xs text-gray-500">
              <strong>Keyboard:</strong>
              <br />
              Ctrl+Enter: Yaratish
              <br />
              Ctrl+N: +1 mahsulot
              <br />
              Ctrl+D: Oxirgisini nusxalash
            </div>
            <button
              onClick={() => dispatch({ type: "CLOSE_CREATE_MODAL" })}
              className="btn btn-secondary"
            >
              Bekor qilish
            </button>
            <button onClick={handleSubmit} className="btn btn-primary">
              Yaratish
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={state.viewModal.isOpen}
        onClose={() => dispatch({ type: "CLOSE_VIEW" })}
        title="Buyurtma ma'lumotlari"
        size="lg"
      >
        {state.viewModal.order && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID
                </label>
                <p>{state.viewModal.order.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stol
                </label>
                <p>Stol {state.viewModal.order.table}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant
                </label>
                <p>{state.viewModal.order.Restaurant?.name || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ofitsiant
                </label>
                <p>{state.viewModal.order.Waiter?.name || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jami
                </label>
                <p>{formatCurrency(state.viewModal.order.total)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foyda
                </label>
                <p className="text-green-600 font-semibold">
                  {formatCurrency(state.viewModal.order.total * 0.35)}
                </p>
              </div>
            </div>
            {(state.viewModal.order.OrderItems || []).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mahsulotlar
                </label>
                <div className="space-y-2">
                  {state.viewModal.order.OrderItems!.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>{item.product?.name || "Noma'lum"}</span>
                      <span>
                        {item.quantity} ta -{" "}
                        {formatCurrency(
                          (item.product?.price || 0) * item.quantity
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sana
              </label>
              <p>
                {new Date(state.viewModal.order.createdAt).toLocaleDateString(
                  "uz-UZ"
                )}
              </p>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => dispatch({ type: "CLOSE_VIEW" })}
                className="btn btn-secondary"
              >
                Yopish
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
