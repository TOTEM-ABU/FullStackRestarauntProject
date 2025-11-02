import React from "react";
import { useForm } from "react-hook-form";
import InputField from "./InputField";
import SelectField from "./SelectField";
import { Grid3X3, Store } from "lucide-react";

interface CategoryFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit: boolean;
  onCancel: () => void;
  restaurants: { id: string; name: string }[];
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  onSubmit,
  initialData,
  isEdit,
  onCancel,
  restaurants,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      name: "",
      restaurantId: "",
      isActive: true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField
        label="Kategoriya nomi *"
        icon={Grid3X3}
        name="name"
        placeholder="Masalan: Ichimliklar"
        register={register("name", { required: "Nomi shart" })}
        errors={errors}
      />
      <SelectField
        label="Restaurant *"
        icon={Store}
        name="restaurantId"
        register={register("restaurantId", {
          required: "Restaurant tanlash shart",
        })}
        errors={errors}
      >
        <option value="">Restaurant tanlang</option>
        {restaurants.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </SelectField>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          {...register("isActive")}
          className="h-4 w-4 text-primary-600 rounded border-gray-300"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Faol
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Bekor qilish
        </button>
        <button type="submit" className="btn btn-primary">
          {isEdit ? "Yangilash" : "Yaratish"}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
