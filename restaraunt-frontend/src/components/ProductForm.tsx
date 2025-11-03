import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { restaurantAPI, categoryAPI } from "../services/api";
import type {
  CreateProductDto,
  UpdateProductDto,
  Restaurant,
  Category,
} from "../types";
import toast from "react-hot-toast";

interface ProductFormProps {
  onSubmit: (data: CreateProductDto | UpdateProductDto) => Promise<void>;
  initialData?: any;
  isEdit?: boolean;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  initialData,
  isEdit = false,
  onCancel,
}) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateProductDto>({
    defaultValues: initialData || {
      name: "",
      price: 0,
      restaurantId: "",
      categoryId: "",
      isActive: true,
    },
  });

  const selectedRestaurantId = watch("restaurantId");

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantsResponse, categoriesResponse] = await Promise.all([
          restaurantAPI.getAll(),
          categoryAPI.getAll(),
        ]);
        setRestaurants(
          Array.isArray(restaurantsResponse.data)
            ? restaurantsResponse.data
            : [],
        );
        setCategories(
          Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [],
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Ma'lumotlarni yuklashda xatolik");
      }
    };

    fetchData();
  }, []);

  const onSubmitForm = async (data: CreateProductDto) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      reset();
      toast.success(
        isEdit
          ? "Mahsulot muvaffaqiyatli yangilandi"
          : "Mahsulot muvaffaqiyatli yaratildi",
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      !selectedRestaurantId || category.restaurantId === selectedRestaurantId,
  );

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomi *
          </label>
          <input
            type="text"
            {...register("name", { required: "Nomi kiritilishi shart" })}
            className="input w-full"
            placeholder="Mahsulot nomi"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Narxi (so'm) *
          </label>
          <input
            type="number"
            min="0"
            step="100"
            {...register("price", {
              required: "Narxi kiritilishi shart",
              min: {
                value: 0,
                message: "Narxi 0 dan kam bo'lishi mumkin emas",
              },
            })}
            className="input w-full"
            placeholder="0"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Restaurant *
          </label>
          <select
            {...register("restaurantId", {
              required: "Restaurant tanlanishi shart",
            })}
            className="input w-full"
          >
            <option value="">Restaurantni tanlang</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
          {errors.restaurantId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.restaurantId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategoriya *
          </label>
          <select
            {...register("categoryId", {
              required: "Kategoriya tanlanishi shart",
            })}
            className="input w-full"
            disabled={!selectedRestaurantId}
          >
            <option value="">
              {selectedRestaurantId
                ? "Kategoriyani tanlang"
                : "Avval restaurantni tanlang"}
            </option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.categoryId.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          {...register("isActive")}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Faol
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          Bekor qilish
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Saqlanmoqda..." : isEdit ? "Yangilash" : "Yaratish"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
