import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  useMemo,
} from "react";
import { productAPI, restaurantAPI, categoryAPI } from "../services/api";
import type {
  Product,
  Restaurant,
  Category,
  CreateProductDto,
  UpdateProductDto,
} from "../types";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package as PackageIcon,
  Filter,
  Store,
  Grid3X3,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { FoodRain, Modal, ProductForm } from "../components";
import { useAuth } from "../contexts/AuthContext";

const STATUS_CONFIG = {
  true: {
    color: "bg-green-100 text-green-800",
    emoji: "Checkmark",
    label: "Faol",
  },
  false: {
    color: "bg-red-100 text-red-800",
    emoji: "Cross",
    label: "Faol emas",
  },
} as const;

interface FilterState {
  searchTerm: string;
  selectedRestaurant: string;
  selectedCategory: string;
  selectedStatus: string;
}

interface ModalState {
  isOpen: boolean;
  isEdit: boolean;
  product: Product | null;
}

interface ViewModalState {
  isOpen: boolean;
  product: Product | null;
}

interface State {
  filters: FilterState;
  modal: ModalState;
  viewModal: ViewModalState;
}

type Action =
  | { type: "SET_FILTER"; payload: { key: keyof FilterState; value: string } }
  | { type: "RESET_FILTERS" }
  | { type: "OPEN_MODAL"; payload: { isEdit: boolean; product?: Product } }
  | { type: "CLOSE_MODAL" }
  | { type: "OPEN_VIEW"; payload: Product }
  | { type: "CLOSE_VIEW" };

const initialState: State = {
  filters: {
    searchTerm: "",
    selectedRestaurant: "",
    selectedCategory: "",
    selectedStatus: "",
  },
  modal: { isOpen: false, isEdit: false, product: null },
  viewModal: { isOpen: false, product: null },
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
    case "OPEN_MODAL":
      return {
        ...state,
        modal: {
          isOpen: true,
          isEdit: action.payload.isEdit,
          product: action.payload.product || null,
        },
      };
    case "CLOSE_MODAL":
      return { ...state, modal: initialState.modal };
    case "OPEN_VIEW":
      return { ...state, viewModal: { isOpen: true, product: action.payload } };
    case "CLOSE_VIEW":
      return { ...state, viewModal: initialState.viewModal };
    default:
      return state;
  }
};

const useDebounce = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
};

const ProductCard = React.memo(
  ({
    product,
    onView,
    onEdit,
    onDelete,
    userRole,
  }: {
    product: Product;
    onView: (p: Product) => void;
    onEdit: (p: Product) => void;
    onDelete: (id: string) => void;
    userRole: string;
  }) => {
    const status =
      STATUS_CONFIG[product.isActive.toString() as keyof typeof STATUS_CONFIG];
    const formattedPrice = useMemo(
      () =>
        new Intl.NumberFormat("uz-UZ", {
          style: "currency",
          currency: "UZS",
        }).format(product.price),
      [product.price],
    );

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
              {product.name}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Store className="h-4 w-4 mr-1" />{" "}
              {product.Restaurant?.name || "-"}
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Grid3X3 className="h-4 w-4 mr-1" />{" "}
              {product.Category?.name || "-"}
            </div>
          </div>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}
          >
            {status.emoji} {status.label}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Narxi:</span>
            <span className="font-medium text-green-600">{formattedPrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Kategoriya:</span>
            <span className="font-medium">{product.Category?.name || "-"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Restaurant:</span>
            <span className="font-medium">
              {product.Restaurant?.name || "-"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => onView(product)}
              className="text-primary-600 hover:text-primary-900"
            >
              <Eye className="h-4 w-4" />
            </button>
            {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
              <>
                <button
                  onClick={() => onEdit(product)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(product.createdAt).toLocaleDateString("uz-UZ")}
          </div>
        </div>
      </div>
    );
  },
);

const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
    </div>
    <div className="flex justify-between pt-3 border-t">
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
);

const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, dispatch] = useReducer(reducer, initialState);

  const debouncedSearch = useDebounce(state.filters.searchTerm, 500);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        name: debouncedSearch || undefined,
        restaurantId: state.filters.selectedRestaurant || undefined,
        categoryId: state.filters.selectedCategory || undefined,
        isActive: state.filters.selectedStatus
          ? state.filters.selectedStatus === "true"
          : undefined,
        limit: 100,
        page: 1,
      };
      const response = await productAPI.getAll(params);
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error);
      toast.error("Mahsulotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, state.filters]);

  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await restaurantAPI.getAll({ limit: 100, page: 1 });
      setRestaurants(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Restaurants yuklashda xatolik:", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryAPI.getAll({ limit: 100, page: 1 });
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Categories yuklashda xatolik:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = useCallback(() => fetchProducts(), [fetchProducts]);

  const handleClearFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
    setTimeout(fetchProducts, 0);
  }, [fetchProducts]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Mahsulotni o'chirishni xohlaysizmi?")) return;
      try {
        await productAPI.delete(id);
        toast.success("Mahsulot o'chirildi");
        fetchProducts();
      } catch (error) {
        console.log(error);
        toast.error("Mahsulotni o'chirishda xatolik");
      }
    },
    [fetchProducts],
  );

  const handleSubmit = useCallback(
    async (data: CreateProductDto | UpdateProductDto) => {
      try {
        if (state.modal.isEdit && state.modal.product) {
          const updateData = {
            name: data.name,
            price: data.price,
            restaurantId: data.restaurantId,
            categoryId: data.categoryId,
            isActive: data.isActive,
          };
          await productAPI.update(
            state.modal.product.id,
            updateData as UpdateProductDto,
          );
          toast.success("Mahsulot muvaffaqiyatli yangilandi");
        } else {
          await productAPI.create(data as CreateProductDto);
          toast.success("Mahsulot muvaffaqiyatli yaratildi");
        }
        dispatch({ type: "CLOSE_MODAL" });
        await fetchProducts();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      }
    },
    [state.modal, fetchProducts],
  );

  return (
    <div className="space-y-6">
      <FoodRain />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mahsulotlar</h1>
          <p className="text-gray-600">
            Tizimdagi barcha mahsulotlarni boshqaring
          </p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
          <button
            onClick={() =>
              dispatch({ type: "OPEN_MODAL", payload: { isEdit: false } })
            }
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Yangi mahsulot
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
                placeholder="Mahsulot nomi bo'yicha qidirish..."
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
              <option value="">Barcha restaurantlar</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategoriya
            </label>
            <select
              value={state.filters.selectedCategory}
              onChange={(e) =>
                dispatch({
                  type: "SET_FILTER",
                  payload: { key: "selectedCategory", value: e.target.value },
                })
              }
              className="input"
            >
              <option value="">Barcha kategoriyalar</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Holat
            </label>
            <select
              value={state.filters.selectedStatus}
              onChange={(e) =>
                dispatch({
                  type: "SET_FILTER",
                  payload: { key: "selectedStatus", value: e.target.value },
                })
              }
              className="input"
            >
              <option value="">Barcha holatlar</option>
              <option value="true">Faol</option>
              <option value="false">Faol emas</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Filter className="h-4 w-4" /> Filtrlash
            </button>
            <button
              onClick={handleClearFilters}
              className="btn btn-outline flex items-center gap-2"
            >
              <X className="h-4 w-4" /> Tozalash
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Mahsulotlar topilmadi
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Yangi mahsulot qo'shing
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={(p) => dispatch({ type: "OPEN_VIEW", payload: p })}
                onEdit={(p) =>
                  dispatch({
                    type: "OPEN_MODAL",
                    payload: { isEdit: true, product: p },
                  })
                }
                onDelete={handleDelete}
                userRole={user?.role || ""}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={state.modal.isOpen}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        title={state.modal.isEdit ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
        size="lg"
      >
        <ProductForm
          onSubmit={handleSubmit}
          initialData={state.modal.product}
          isEdit={state.modal.isEdit}
          onCancel={() => dispatch({ type: "CLOSE_MODAL" })}
        />
      </Modal>

      <Modal
        isOpen={state.viewModal.isOpen}
        onClose={() => dispatch({ type: "CLOSE_VIEW" })}
        title="Mahsulot ma'lumotlari"
        size="lg"
      >
        {state.viewModal.product && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi
                </label>
                <p>{state.viewModal.product.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Narxi
                </label>
                <p>
                  {new Intl.NumberFormat("uz-UZ", {
                    style: "currency",
                    currency: "UZS",
                  }).format(state.viewModal.product.price)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant
                </label>
                <p>{state.viewModal.product.Restaurant?.name || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategoriya
                </label>
                <p>{state.viewModal.product.Category?.name || "-"}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holat
              </label>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  STATUS_CONFIG[
                    state.viewModal.product.isActive.toString() as keyof typeof STATUS_CONFIG
                  ].color
                }`}
              >
                {state.viewModal.product.isActive ? "Faol" : "Faol emas"}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yaratilgan sana
              </label>
              <p>
                {new Date(state.viewModal.product.createdAt).toLocaleDateString(
                  "uz-UZ",
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

export default Products;
