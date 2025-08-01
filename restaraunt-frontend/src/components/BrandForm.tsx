import React, { useState } from "react";
import { useForm } from "react-hook-form";
import type { Brand } from "../types";

interface BrandFormProps {
  brand?: Brand | null;
  onSubmit: (data: {
    name?: string;
    icon?: string;
    isActive?: boolean;
  }) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  icon: string;
  isActive: boolean;
}

const BrandForm: React.FC<BrandFormProps> = ({ brand, onSubmit, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: brand?.name || "",
      icon: brand?.icon || "",
      isActive: brand?.isActive ?? true,
    },
  });

  const handleFormSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Brand Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-warm-700 mb-2"
        >
          Brand nomi
        </label>
        <input
          {...register("name", {
            required: "Brand nomi kiritilishi shart",
            minLength: {
              value: 2,
              message: "Brand nomi kamida 2 ta belgidan iborat bo'lishi kerak",
            },
          })}
          id="name"
          type="text"
          className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          placeholder="Brand nomini kiriting"
        />
        {errors.name && (
          <p className="mt-2 text-sm text-primary-600 flex items-center">
            <span className="mr-1">⚠</span>
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Brand Icon */}
      <div>
        <label
          htmlFor="icon"
          className="block text-sm font-semibold text-warm-700 mb-2"
        >
          Brand ikoni (emoji)
        </label>
        <input
          {...register("icon")}
          id="icon"
          type="text"
          className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          placeholder="🏪 (ixtiyoriy)"
        />
        <p className="mt-2 text-sm text-warm-500">
          Emoji yoki belgi kiriting (masalan: 🏪, 🍕, ☕)
        </p>
      </div>

      {/* Active Status (only for editing) */}
      {brand && (
        <div>
          <label className="flex items-center space-x-3">
            <input
              {...register("isActive")}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-warm-300 rounded"
            />
            <span className="text-sm font-semibold text-warm-700">
              Brand faol
            </span>
          </label>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {brand ? "Yangilanmoqda..." : "Qo'shilmoqda..."}
            </div>
          ) : brand ? (
            "Yangilash"
          ) : (
            "Qo'shish"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-warm-100 text-warm-700 font-semibold py-3 px-6 rounded-xl hover:bg-warm-200 transition-all duration-200"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  );
};

export default BrandForm;
