import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { CreateRegionDto, UpdateRegionDto } from '../types';
import toast from 'react-hot-toast';

interface RegionFormProps {
  onSubmit: (data: CreateRegionDto | UpdateRegionDto) => Promise<void>;
  initialData?: any;
  isEdit?: boolean;
  onCancel: () => void;
}

const RegionForm: React.FC<RegionFormProps> = ({ 
  onSubmit, 
  initialData, 
  isEdit = false, 
  onCancel 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateRegionDto>({
    defaultValues: initialData || {
      name: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmitForm = async (data: CreateRegionDto) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      reset();
      toast.success(isEdit ? 'Hudud muvaffaqiyatli yangilandi' : 'Hudud muvaffaqiyatli yaratildi');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nomi *
        </label>
        <input
          type="text"
          {...register('name', { required: 'Nomi kiritilishi shart' })}
          className="input w-full"
          placeholder="Hudud nomi"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
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

export default RegionForm; 