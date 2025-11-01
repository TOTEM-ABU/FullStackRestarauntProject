import React from "react";
import { Eye, Edit, Trash2, Grid3X3, Store, Package } from "lucide-react";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    isActive: boolean;
    Restaurant?: { name: string };
    Products?: any[];
    createdAt: string;
  };
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = React.memo(
  ({ category, onView, onEdit, onDelete }) => {
    const getStatusBadgeColor = (isActive: boolean) =>
      isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {category.name}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Grid3X3 className="h-4 w-4 mr-1" />
              Kategoriya ID: {category.id}
            </div>
          </div>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
              category.isActive
            )}`}
          >
            {category.isActive ? "Faol" : "Faol emas"}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Restaurant:</span>
            <span className="font-medium flex items-center">
              <Store className="h-4 w-4 mr-1" />
              {category.Restaurant?.name || "-"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Mahsulotlar:</span>
            <span className="font-medium flex items-center">
              <Package className="h-4 w-4 mr-1" />
              {category.Products?.length || 0} ta
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={onView}
              className="text-primary-600 hover:text-primary-900"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-900"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-900"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(category.createdAt).toLocaleDateString("uz-UZ")}
          </div>
        </div>
      </div>
    );
  }
);

CategoryCard.displayName = "CategoryCard";

export default CategoryCard;
