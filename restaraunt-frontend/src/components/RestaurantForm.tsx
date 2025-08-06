import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { regionAPI } from "../services/api";
import type {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  Region,
} from "../types";
import toast from "react-hot-toast";

interface RestaurantFormProps {
  onSubmit: (data: CreateRestaurantDto | UpdateRestaurantDto) => Promise<void>;
  initialData?: any;
  isEdit?: boolean;
  onCancel: () => void;
}

const RestaurantForm: React.FC<RestaurantFormProps> = ({
  onSubmit,
  initialData,
  isEdit = false,
  onCancel,
}) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateRestaurantDto>({
    defaultValues: initialData || {
      name: "",
      regionId: "",
      tip: 0,
      type: "RESTAURANT",
      address: "",
      phone: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await regionAPI.getAll();
        setRegions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching regions:", error);
        toast.error("Hududlarni yuklashda xatolik");
      }
    };

    fetchRegions();
  }, []);

  const onSubmitForm = async (data: CreateRestaurantDto) => {
    setIsLoading(true);
    try {
      const formData = {
        ...data,
        tip: typeof data.tip === "string" ? Number(data.tip) : data.tip,
        isActive: Boolean(data.isActive),
      };

      await onSubmit(formData);
      reset();
      toast.success(
        isEdit
          ? "Restaurant muvaffaqiyatli yangilandi"
          : "Restaurant muvaffaqiyatli yaratildi"
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomi *
          </label>
          <input
            type="text"
            {...register("name", { required: "Nomi kiritilishi shart" })}
            className="input w-full"
            placeholder="Restaurant nomi"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Region */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hudud *
          </label>
          <select
            {...register("regionId", { required: "Hudud tanlanishi shart" })}
            className="input w-full"
          >
            <option value="">Hududni tanlang</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          {errors.regionId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.regionId.message}
            </p>
          )}
        </div>

        {/* Tip */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tip (%) *
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            {...register("tip", {
              required: "Tip kiritilishi shart",
              min: { value: 0, message: "Tip 0 dan kam bo'lishi mumkin emas" },
              max: {
                value: 100,
                message: "Tip 100 dan ko'p bo'lishi mumkin emas",
              },
              valueAsNumber: true,
            })}
            className="input w-full"
            placeholder="0-100"
          />
          {errors.tip && (
            <p className="text-red-500 text-sm mt-1">{errors.tip.message}</p>
          )}
        </div>

        {/* Restaurant Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Restaurant turi *
          </label>
          <select
            {...register("type", {
              required: "Restaurant turi tanlanishi shart",
            })}
            className="input w-full"
          >
            <option value="RESTAURANT">Restaurant</option>
            <option value="FAST_FOOD">Fast Food</option>
            <option value="CAFE">Cafe</option>
            <option value="PIZZERIA">Pizzeria</option>
            <option value="SUSHI_BAR">Sushi Bar</option>
            <option value="OTHER">Boshqa</option>
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon *
          </label>
          <input
            type="tel"
            {...register("phone", {
              required: "Telefon raqami kiritilishi shart",
              pattern: {
                value: /^\+998[0-9]{9}$/,
                message:
                  "Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak",
              },
            })}
            className="input w-full"
            placeholder="+998901234567"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Manzil *
        </label>
        <textarea
          {...register("address", { required: "Manzil kiritilishi shart" })}
          className="input w-full"
          rows={3}
          placeholder="Restaurant manzili"
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
        )}
      </div>

      {/* Is Active */}
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

      {/* Buttons */}
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

export default RestaurantForm;
