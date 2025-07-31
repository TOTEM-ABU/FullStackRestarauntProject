import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { restaurantAPI } from '../services/api';
import type { CreateCategoryDto, UpdateCategoryDto, Restaurant } from '../types';
import toast from 'react-hot-toast';

interface CategoryFormProps {
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
  initialData?: any;
  isEdit?: boolean;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ 
  onSubmit, 
  initialData, 
  isEdit = false, 
  onCancel 
}) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCategoryDto>({
    defaultValues: initialData || {
      name: '',
      restaurantId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await restaurantAPI.getAll();
        setRestaurants(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        toast.error('Restaurantlarni yuklashda xatolik');
      }
    };

    fetchRestaurants();
  }, []);

  const onSubmitForm = async (data: CreateCategoryDto) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      reset();
      toast.success(isEdit ? 'Kategoriya muvaffaqiyatli yangilandi' : 'Kategoriya muvaffaqiyatli yaratildi');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
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
            {...register('name', { required: 'Nomi kiritilishi shart' })}
            className="input w-full"
            placeholder="Kategoriya nomi"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Restaurant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Restaurant *
          </label>
          <select
            {...register('restaurantId', { required: 'Restaurant tanlanishi shart' })}
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
            <p className="text-red-500 text-sm mt-1">{errors.restaurantId.message}</p>
          )}
        </div>
      </div>

      {/* Is Active */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          {...register('isActive')}
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
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saqlanmoqda...' : (isEdit ? 'Yangilash' : 'Yaratish')}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm; 