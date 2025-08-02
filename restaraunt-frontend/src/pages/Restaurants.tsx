import React, { useState, useEffect } from "react";
import { restaurantAPI, regionAPI } from "../services/api";
import type {
  Restaurant,
  Region,
  CreateRestaurantDto,
  UpdateRestaurantDto,
} from "../types";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Store as StoreIcon,
  Filter,
  MapPin,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import RestaurantForm from "../components/RestaurantForm";

const Restaurants: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchRestaurants();
    fetchRegions();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getAll({
        name: searchTerm || undefined,
        regionId: selectedRegion || undefined,
        tip: selectedType ? Number(selectedType) : undefined,
        isActive: selectedStatus ? selectedStatus === "true" : undefined,
      });
      setRestaurants(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Restaurantlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await regionAPI.getAll();
      setRegions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Regions yuklashda xatolik:", error);
    }
  };

  const handleSearch = () => {
    fetchRestaurants();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Restaurantni o'chirishni xohlaysizmi?")) {
      try {
        await restaurantAPI.delete(id);
        toast.success("Restaurant o'chirildi");
        fetchRestaurants();
      } catch (error) {
        toast.error("Restaurantni o'chirishda xatolik");
      }
    }
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedRestaurant(null);
    setIsModalOpen(true);
  };

  const handleEdit = (restaurant: Restaurant) => {
    setIsEditMode(true);
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const handleView = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (
    data: CreateRestaurantDto | UpdateRestaurantDto
  ) => {
    try {
      if (isEditMode && selectedRestaurant) {
        // Filter out only the allowed fields for update
        const updateData = {
          name: data.name,
          regionId: data.regionId,
          tip: data.tip,
          address: data.address,
          phone: data.phone,
          isActive: data.isActive,
        };
        await restaurantAPI.update(
          selectedRestaurant.id,
          updateData as UpdateRestaurantDto
        );
        toast.success("Restaurant muvaffaqiyatli yangilandi");
      } else {
        await restaurantAPI.create(data as CreateRestaurantDto);
        toast.success("Restaurant muvaffaqiyatli yaratildi");
      }
      setIsModalOpen(false);
      setSelectedRestaurant(null);
      fetchRestaurants();
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



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurantlar</h1>
          <p className="text-gray-600">
            Tizimdagi barcha restaurantlarni boshqaring
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Yangi restaurant
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
                placeholder="Restaurant nomi bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hudud
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="input"
            >
              <option value="">Barcha hududlar</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tip
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
            >
              <option value="">Barcha tiplar</option>
              <option value="1">Fast Food</option>
              <option value="2">Restaurant</option>
              <option value="3">Cafe</option>
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
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-8">
            <StoreIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Restaurantlar topilmadi
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Yangi restaurant qo'shing
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {restaurant.address}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Phone className="h-4 w-4 mr-1" />
                      {restaurant.phone}
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                      restaurant.isActive
                    )}`}
                  >
                    {getStatusEmoji(restaurant.isActive)}{" "}
                    {restaurant.isActive ? "Faol" : "Faol emas"}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hudud:</span>
                    <span className="font-medium">
                      {restaurant.Region?.name || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tip:</span>
                    <span className="font-medium">{restaurant.tip}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Mahsulotlar:</span>
                    <span className="font-medium">
                      {restaurant.Products?.length || 0} ta
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(restaurant)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(restaurant)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(restaurant.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(restaurant.createdAt).toLocaleDateString("uz-UZ")}
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
        title={isEditMode ? "Restaurantni tahrirlash" : "Yangi restaurant"}
        size="lg"
      >
        <RestaurantForm
          onSubmit={handleSubmit}
          initialData={selectedRestaurant}
          isEdit={isEditMode}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Restaurant ma'lumotlari"
        size="lg"
      >
        {selectedRestaurant && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi
                </label>
                <p className="text-gray-900">{selectedRestaurant.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <p className="text-gray-900">{selectedRestaurant.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hudud
                </label>
                <p className="text-gray-900">
                  {selectedRestaurant.Region?.name || "-"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tip
                </label>
                <p className="text-gray-900">{selectedRestaurant.tip}%</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manzil
              </label>
              <p className="text-gray-900">{selectedRestaurant.address}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holat
              </label>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                  selectedRestaurant.isActive
                )}`}
              >
                {selectedRestaurant.isActive ? "Faol" : "Faol emas"}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yaratilgan sana
              </label>
              <p className="text-gray-900">
                {new Date(selectedRestaurant.createdAt).toLocaleDateString(
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

export default Restaurants;
