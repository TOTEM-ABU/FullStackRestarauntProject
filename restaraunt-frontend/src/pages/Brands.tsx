import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Filter, RefreshCw } from "lucide-react";
import { brandAPI } from "../services/api";
import type { Brand } from "../types";
import Modal from "../components/Modal";
import BrandForm from "../components/BrandForm";
import toast from "react-hot-toast";

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const response = await brandAPI.getAll();
      const brandsData = Array.isArray(response) ? response : [];
      setBrands(brandsData);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Brandlarni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: { name: string; icon?: string }) => {
    try {
      await brandAPI.create(data);
      toast.success("Brand muvaffaqiyatli qo'shildi!");
      setIsModalOpen(false);
      fetchBrands();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Brand qo'shishda xatolik yuz berdi"
      );
    }
  };

  const handleUpdate = async (data: {
    name?: string;
    icon?: string;
    isActive?: boolean;
  }) => {
    if (!editingBrand) return;

    try {
      await brandAPI.update(editingBrand.id, data);
      toast.success("Brand muvaffaqiyatli yangilandi!");
      setIsModalOpen(false);
      setEditingBrand(null);
      fetchBrands();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Brand yangilashda xatolik yuz berdi"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu brandni o'chirishni xohlaysizmi?")) return;

    try {
      await brandAPI.delete(id);
      toast.success("Brand muvaffaqiyatli o'chirildi!");
      fetchBrands();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Brand o'chirishda xatolik yuz berdi"
      );
    }
  };

  const openCreateModal = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  const filteredBrands = brands.filter((brand) => {
    const matchesSearch = brand.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterActive === null || brand.isActive === filterActive;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Brandlar</h1>
          <p className="text-warm-600">Tizim brandlarini boshqarish</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          Yangi Brand
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-400" />
            <input
              type="text"
              placeholder="Brand nomi bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterActive === null ? "" : filterActive.toString()}
              onChange={(e) =>
                setFilterActive(
                  e.target.value === "" ? null : e.target.value === "true"
                )
              }
              className="px-4 py-2 border-2 border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Barcha</option>
              <option value="true">Faol</option>
              <option value="false">Faol emas</option>
            </select>
            <button
              onClick={fetchBrands}
              className="flex items-center gap-2 px-4 py-2 bg-warm-100 text-warm-700 rounded-lg hover:bg-warm-200 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Brands List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredBrands.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-warm-400 text-6xl mb-4">🏪</div>
            <h3 className="text-lg font-semibold text-warm-700 mb-2">
              Brandlar topilmadi
            </h3>
            <p className="text-warm-500">
              {searchTerm || filterActive !== null
                ? "Qidiruv natijalariga mos brandlar yo'q"
                : "Hali hech qanday brand qo'shilmagan"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-warm-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warm-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warm-500 uppercase tracking-wider">
                    Icon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warm-500 uppercase tracking-wider">
                    Holat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warm-500 uppercase tracking-wider">
                    Yaratilgan
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-warm-500 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-warm-200">
                {filteredBrands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="hover:bg-warm-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-warm-900">
                        {brand.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-warm-500">
                        {brand.icon ? (
                          <span className="text-2xl">{brand.icon}</span>
                        ) : (
                          <span className="text-warm-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          brand.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {brand.isActive ? "Faol" : "Faol emas"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-warm-500">
                      {new Date(brand.createdAt).toLocaleDateString("uz-UZ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(brand)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBrand ? "Brandni tahrirlash" : "Yangi brand qo'shish"}
      >
        <BrandForm
          brand={editingBrand}
          onSubmit={editingBrand ? handleUpdate : handleCreate}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default Brands;
