import React, { useState, useEffect } from "react";
import { categoryAPI, restaurantAPI } from "../services/api";
import type {
  Category,
  Restaurant,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../types";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Grid3X3 as GridIcon,
  Filter,
  Store,
  Package,
  X,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import CategoryForm from "../components/CategoryForm";

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchRestaurants();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll({
        name: searchTerm || undefined,
        restaurantId: selectedRestaurant || undefined,
        isActive: selectedStatus ? selectedStatus === "true" : undefined,
      });
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Kategoriyalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAll();
      setRestaurants(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Restaurants yuklashda xatolik:", error);
    }
  };

  const handleSearch = () => {
    fetchCategories();
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedRestaurant("");
    setSelectedStatus("");
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Kategoriyani o'chirishni xohlaysizmi?")) {
      try {
        await categoryAPI.delete(id);
        toast.success("Kategoriya o'chirildi");
        fetchCategories();
      } catch (error) {
        toast.error("Kategoriyani o'chirishda xatolik");
      }
    }
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setIsEditMode(true);
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    try {
      if (isEditMode && selectedCategory) {
        await categoryAPI.update(
          selectedCategory.id,
          data as UpdateCategoryDto
        );
      } else {
        await categoryAPI.create(data as CreateCategoryDto);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

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
          onClick={handleCreate}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Yangi kategoriya
        </button>
      </div>

      {/* Filters */}
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
                placeholder="Kategoriya nomi bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant
            </label>
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="input"
            >
              <option value="">Barcha restaurantlar</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Holat
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input"
            >
              <option value="">Barcha holatlar</option>
              <option value="true">Faol</option>
              <option value="false">Faol emas</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
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
            Qidirishni tozalash
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <GridIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Kategoriyalar topilmadi
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Yangi kategoriya qo'shing
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <GridIcon className="h-4 w-4 mr-1" />
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
                      onClick={() => handleView(category)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
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
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
        size="lg"
      >
        <CategoryForm
          onSubmit={handleSubmit}
          initialData={selectedCategory}
          isEdit={isEditMode}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Kategoriya ma'lumotlari"
        size="lg"
      >
        {selectedCategory && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi
                </label>
                <p className="text-gray-900">{selectedCategory.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant
                </label>
                <p className="text-gray-900">
                  {selectedCategory.Restaurant?.name || "-"}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holat
              </label>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                  selectedCategory.isActive
                )}`}
              >
                {selectedCategory.isActive ? "Faol" : "Faol emas"}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mahsulotlar soni
              </label>
              <p className="text-gray-900">
                {selectedCategory.Products?.length || 0} ta
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yaratilgan sana
              </label>
              <p className="text-gray-900">
                {new Date(selectedCategory.createdAt).toLocaleDateString(
                  "uz-UZ"
                )}
              </p>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setIsViewModalOpen(false)}
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

export default Categories;
