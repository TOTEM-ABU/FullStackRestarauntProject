import React, { useState, useEffect } from "react";
import { regionAPI } from "../services/api";
import type { Region, CreateRegionDto, UpdateRegionDto } from "../types";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin as MapPinIcon,
  Filter,
  Store,
  Users,
  X,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import RegionForm from "../components/RegionForm";

const Regions: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const response = await regionAPI.getAll({
        search: searchTerm || undefined,
      });
      setRegions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Hududlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRegions();
  };

  const handleReset = () => {
    setSearchTerm("");
    fetchRegions();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Hududni o'chirishni xohlaysizmi?")) {
      try {
        await regionAPI.delete(id);
        toast.success("Hudud o'chirildi");
        fetchRegions();
      } catch (error) {
        toast.error("Hududni o'chirishda xatolik");
      }
    }
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedRegion(null);
    setIsModalOpen(true);
  };

  const handleEdit = (region: Region) => {
    setIsEditMode(true);
    setSelectedRegion(region);
    setIsModalOpen(true);
  };

  const handleView = (region: Region) => {
    setSelectedRegion(region);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (data: CreateRegionDto | UpdateRegionDto) => {
    try {
      if (isEditMode && selectedRegion) {
        await regionAPI.update(selectedRegion.id, data as UpdateRegionDto);
      } else {
        await regionAPI.create(data as CreateRegionDto);
      }
      setIsModalOpen(false);
      fetchRegions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hududlar</h1>
          <p className="text-gray-600">
            Tizimdagi barcha hududlarni boshqaring
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Yangi hudud
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
                placeholder="Hudud nomi bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
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
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Qidirishni tozalash
          </button>
        </div>
      </div>

      {/* Regions Grid */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : regions.length === 0 ? (
          <div className="text-center py-8">
            <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Hududlar topilmadi
            </h3>
            <p className="mt-1 text-sm text-gray-500">Yangi hudud qo'shing</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region) => (
              <div
                key={region.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {region.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      Hudud ID: {region.id}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        {region._count?.restaurant || 0}
                      </div>
                      <div className="text-xs text-gray-500">Restaurant</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Restaurantlar:</span>
                    <span className="font-medium flex items-center">
                      <Store className="h-4 w-4 mr-1" />
                      {region._count?.restaurant || 0} ta
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Foydalanuvchilar:</span>
                    <span className="font-medium flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {region.Users?.length || 0} ta
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(region)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(region)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(region.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(region.createdAt).toLocaleDateString("uz-UZ")}
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
        title={isEditMode ? "Hududni tahrirlash" : "Yangi hudud"}
        size="lg"
      >
        <RegionForm
          onSubmit={handleSubmit}
          initialData={selectedRegion}
          isEdit={isEditMode}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Hudud ma'lumotlari"
        size="lg"
      >
        {selectedRegion && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi
                </label>
                <p className="text-gray-900">{selectedRegion.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID
                </label>
                <p className="text-gray-900">{selectedRegion.id}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurantlar soni
              </label>
              <p className="text-gray-900">
                {selectedRegion._count?.restaurant || 0} ta
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foydalanuvchilar soni
              </label>
              <p className="text-gray-900">
                {selectedRegion.Users?.length || 0} ta
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yaratilgan sana
              </label>
              <p className="text-gray-900">
                {new Date(selectedRegion.createdAt).toLocaleDateString("uz-UZ")}
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

export default Regions;
