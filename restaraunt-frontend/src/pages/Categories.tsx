import React, { useReducer, useEffect, useCallback, useMemo } from "react";
import { categoryAPI, restaurantAPI } from "../services/api";
import type {
  Category,
  Restaurant,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../types";
import { Plus, Filter, RefreshCw, Grid3X3, Search, Store } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import {
  InputField,
  SelectField,
  CategoryCard,
  CategoryForm,
} from "../components";
import { useDebounce } from "use-debounce";

interface CategoriesState {
  categories: Category[];
  restaurants: Restaurant[];
  loading: boolean;
  searchTerm: string;
  selectedRestaurant: string;
  selectedStatus: string;
  isModalOpen: boolean;
  isViewModalOpen: boolean;
  selectedCategory: Category | null;
  isEditMode: boolean;
}

const initialState: CategoriesState = {
  categories: [],
  restaurants: [],
  loading: true,
  searchTerm: "",
  selectedRestaurant: "",
  selectedStatus: "",
  isModalOpen: false,
  isViewModalOpen: false,
  selectedCategory: null,
  isEditMode: false,
};

type CategoriesAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CATEGORIES"; payload: Category[] }
  | { type: "SET_RESTAURANTS"; payload: Restaurant[] }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_RESTAURANT"; payload: string }
  | { type: "SET_STATUS"; payload: string }
  | { type: "OPEN_CREATE_MODAL" }
  | { type: "OPEN_EDIT_MODAL"; payload: Category }
  | { type: "OPEN_VIEW_MODAL"; payload: Category }
  | { type: "CLOSE_MODAL" }
  | { type: "RESET_FILTERS" };

const categoriesReducer = (
  state: CategoriesState,
  action: CategoriesAction
): CategoriesState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    case "SET_RESTAURANTS":
      return { ...state, restaurants: action.payload };
    case "SET_SEARCH":
      return { ...state, searchTerm: action.payload };
    case "SET_RESTAURANT":
      return { ...state, selectedRestaurant: action.payload };
    case "SET_STATUS":
      return { ...state, selectedStatus: action.payload };
    case "OPEN_CREATE_MODAL":
      return {
        ...state,
        isModalOpen: true,
        isEditMode: false,
        selectedCategory: null,
      };
    case "OPEN_EDIT_MODAL":
      return {
        ...state,
        isModalOpen: true,
        isEditMode: true,
        selectedCategory: action.payload,
      };
    case "OPEN_VIEW_MODAL":
      return {
        ...state,
        isViewModalOpen: true,
        selectedCategory: action.payload,
      };
    case "CLOSE_MODAL":
      return { ...state, isModalOpen: false, isViewModalOpen: false };
    case "RESET_FILTERS":
      return {
        ...state,
        searchTerm: "",
        selectedRestaurant: "",
        selectedStatus: "",
      };
    default:
      return state;
  }
};

const Categories: React.FC = React.memo(() => {
  const [state, dispatch] = useReducer(categoriesReducer, initialState);
  const [debouncedSearch] = useDebounce(state.searchTerm, 500);

  const fetchCategories = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await categoryAPI.getAll({
        name: debouncedSearch || undefined,
        restaurantId: state.selectedRestaurant || undefined,
        isActive: state.selectedStatus
          ? state.selectedStatus === "true"
          : undefined,
      });
      dispatch({
        type: "SET_CATEGORIES",
        payload: Array.isArray(response.data) ? response.data : [],
      });
    } catch (error) {
      console.log(error);
      toast.error("Kategoriyalarni yuklashda xatolik");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [debouncedSearch, state.selectedRestaurant, state.selectedStatus]);

  const fetchRestaurants = useCallback(async () => {
    try {
      const { data } = await restaurantAPI.getAll();
      dispatch({
        type: "SET_RESTAURANTS",
        payload: Array.isArray(data) ? data : [],
      });
    } catch (error) {
      console.error("Restaurants yuklashda xatolik:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchRestaurants();
  }, [fetchCategories, fetchRestaurants]);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Kategoriyani o'chirishni xohlaysizmi?")) return;
      try {
        await categoryAPI.delete(id);
        toast.success("Kategoriya o'chirildi");
        fetchCategories();
      } catch (error) {
        console.log(error);
        toast.error("Kategoriyani o'chirishda xatolik");
      }
    },
    [fetchCategories]
  );

  const handleSubmit = useCallback(
    async (data: CreateCategoryDto | UpdateCategoryDto) => {
      try {
        if (state.isEditMode && state.selectedCategory) {
          await categoryAPI.update(
            state.selectedCategory.id,
            data as UpdateCategoryDto
          );
          toast.success("Kategoriya yangilandi");
        } else {
          await categoryAPI.create(data as CreateCategoryDto);
          toast.success("Kategoriya yaratildi");
        }
        dispatch({ type: "CLOSE_MODAL" });
        fetchCategories();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      }
    },
    [state.isEditMode, state.selectedCategory, fetchCategories]
  );

  const categoryCards = useMemo(() => {
    return state.categories.map((category) => (
      <CategoryCard
        key={category.id}
        category={category}
        onView={() => dispatch({ type: "OPEN_VIEW_MODAL", payload: category })}
        onEdit={() => dispatch({ type: "OPEN_EDIT_MODAL", payload: category })}
        onDelete={() => handleDelete(category.id)}
      />
    ));
  }, [state.categories, handleDelete]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategoriyalar</h1>
          <p className="text-gray-600">
            Tizimdagi barcha kategoriyalarni boshqaring
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: "OPEN_CREATE_MODAL" })}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Yangi kategoriya
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-64">
            <InputField
              label="Qidirish"
              icon={Search}
              name="search"
              type="text"
              placeholder="Kategoriya nomi bo'yicha qidirish..."
              value={state.searchTerm}
              onChange={(e) =>
                dispatch({ type: "SET_SEARCH", payload: e.target.value })
              }
            />
          </div>

          <div className="min-w-48">
            <SelectField
              label="Restaurant"
              icon={Store}
              name="restaurant"
              value={state.selectedRestaurant}
              onChange={(e) =>
                dispatch({ type: "SET_RESTAURANT", payload: e.target.value })
              }
            >
              <option value="">Barcha restaurantlar</option>
              {state.restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="min-w-48">
            <SelectField
              label="Holat"
              icon={Grid3X3}
              name="status"
              value={state.selectedStatus}
              onChange={(e) =>
                dispatch({ type: "SET_STATUS", payload: e.target.value })
              }
            >
              <option value="">Barcha holatlar</option>
              <option value="true">Faol</option>
              <option value="false">Faol emas</option>
            </SelectField>
          </div>

          <button
            onClick={fetchCategories}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtrlash
          </button>
          <button
            onClick={handleReset}
            className="btn btn-outline-secondary flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Tozalash
          </button>
        </div>
      </div>

      <div className="card">
        {state.loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : state.categories.length === 0 ? (
          <div className="text-center py-8">
            <Grid3X3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Kategoriyalar topilmadi
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Yangi kategoriya qo'shing
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryCards}
          </div>
        )}
      </div>

      <Modal
        isOpen={state.isModalOpen}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        title={
          state.isEditMode ? "Kategoriyani tahrirlash" : "Yangi kategoriya"
        }
        size="lg"
      >
        <CategoryForm
          onSubmit={handleSubmit}
          initialData={state.selectedCategory}
          isEdit={state.isEditMode}
          onCancel={() => dispatch({ type: "CLOSE_MODAL" })}
          restaurants={state.restaurants}
        />
      </Modal>

      <Modal
        isOpen={state.isViewModalOpen}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        title="Kategoriya ma'lumotlari"
        size="lg"
      >
        {state.selectedCategory && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi
                </label>
                <p className="text-gray-900">{state.selectedCategory.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant
                </label>
                <p className="text-gray-900">
                  {state.selectedCategory.Restaurant?.name || "-"}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holat
              </label>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  state.selectedCategory.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {state.selectedCategory.isActive ? "Faol" : "Faol emas"}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mahsulotlar soni
              </label>
              <p className="text-gray-900">
                {state.selectedCategory.Products?.length || 0} ta
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yaratilgan sana
              </label>
              <p className="text-gray-900">
                {new Date(state.selectedCategory.createdAt).toLocaleDateString(
                  "uz-UZ"
                )}
              </p>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => dispatch({ type: "CLOSE_MODAL" })}
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
});

Categories.displayName = "Categories";

export default Categories;
