import React, { useState, useEffect } from "react";
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
import Modal from "../components/Modal";
import ProductForm from "../components/ProductForm";
import { useAuth } from "../contexts/AuthContext";

const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchRestaurants();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        name: searchTerm || undefined,
        restaurantId: selectedRestaurant || undefined,
        categoryId: selectedCategory || undefined,
        isActive: selectedStatus ? selectedStatus === "true" : undefined,
        limit: 100,
        page: 1,
      };
      const response = await productAPI.getAll(params);

      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Mahsulotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAll({
        limit: 100,
        page: 1,
      });

      setRestaurants(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Restaurants yuklashda xatolik:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll({
        limit: 100,
        page: 1,
      });
      console.log("Categories response:", response);
      
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Categories yuklashda xatolik:", error);
    }
  };

  const handleSearch = () => {
    console.log("Search clicked with filters:", {
      searchTerm,
      selectedRestaurant,
      selectedCategory,
      selectedStatus,
    });
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedRestaurant("");
    setSelectedCategory("");
    setSelectedStatus("");
    
    setTimeout(() => {
      fetchProducts();
    }, 0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Mahsulotni o'chirishni xohlaysizmi?")) {
      try {
        await productAPI.delete(id);
        toast.success("Mahsulot o'chirildi");
        fetchProducts();
      } catch (error) {
        toast.error("Mahsulotni o'chirishda xatolik");
      }
    }
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setIsEditMode(true);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (data: CreateProductDto | UpdateProductDto) => {
    try {
      if (isEditMode && selectedProduct) {

        const updateData = {
          name: data.name,
          price: data.price,
          restaurantId: data.restaurantId,
          categoryId: data.categoryId,
          isActive: data.isActive,
        };
        await productAPI.update(
          selectedProduct.id,
          updateData as UpdateProductDto
        );
        toast.success("Mahsulot muvaffaqiyatli yangilandi");
      } else {
        await productAPI.create(data as CreateProductDto);
        toast.success("Mahsulot muvaffaqiyatli yaratildi");
      }
      setIsModalOpen(false);
      setSelectedProduct(null);
      setIsEditMode(false);
      
      await fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getStatusEmoji = (isActive: boolean) => {
    return isActive ? "✅" : "❌";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mahsulotlar</h1>
          <p className="text-gray-600">
            Tizimdagi barcha mahsulotlarni boshqaring
          </p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
          <button
            onClick={handleCreate}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Yangi mahsulot
          </button>
        )}
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
                placeholder="Mahsulot nomi bo'yicha qidirish..."
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
              Kategoriya
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="">Barcha kategoriyalar</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
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

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtrlash
            </button>
            <button
              onClick={handleClearFilters}
              className="btn btn-outline flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Tozalash
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
              <div
                key={product.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Store className="h-4 w-4 mr-1" />
                      {product.Restaurant?.name || "-"}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Grid3X3 className="h-4 w-4 mr-1" />
                      {product.Category?.name || "-"}
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                      product.isActive
                    )}`}
                  >
                    {getStatusEmoji(product.isActive)}{" "}
                    {product.isActive ? "Faol" : "Faol emas"}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Narxi:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Kategoriya:</span>
                    <span className="font-medium">
                      {product.Category?.name || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Restaurant:</span>
                    <span className="font-medium">
                      {product.Restaurant?.name || "-"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(product)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {(user?.role === "ADMIN" ||
                      user?.role === "SUPER_ADMIN") && (
                      <>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
        size="lg"
      >
        <ProductForm
          onSubmit={handleSubmit}
          initialData={selectedProduct}
          isEdit={isEditMode}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Mahsulot ma'lumotlari"
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi
                </label>
                <p className="text-gray-900">{selectedProduct.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Narxi
                </label>
                <p className="text-gray-900">
                  {formatCurrency(selectedProduct.price)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant
                </label>
                <p className="text-gray-900">
                  {selectedProduct.Restaurant?.name || "-"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategoriya
                </label>
                <p className="text-gray-900">
                  {selectedProduct.Category?.name || "-"}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holat
              </label>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                  selectedProduct.isActive
                )}`}
              >
                {selectedProduct.isActive ? "Faol" : "Faol emas"}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yaratilgan sana
              </label>
              <p className="text-gray-900">
                {new Date(selectedProduct.createdAt).toLocaleDateString(
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

export default Products;
