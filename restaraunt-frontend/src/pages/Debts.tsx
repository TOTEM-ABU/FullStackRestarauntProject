import React, { useState, useEffect } from "react";
import { debtAPI, restaurantAPI, orderAPI } from "../services/api";
import type {
  Debt,
  Restaurant,
  Order,
  CreateDebtDto,
  UpdateDebtDto,
} from "../types";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  DollarSign as DollarIcon,
  Filter,
  Store,
  ShoppingCart,
  User,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";

const Debts: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchDebts();
    fetchRestaurants();
    fetchOrders();
  }, []);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const response = await debtAPI.getAll({
        client: searchTerm || undefined,
        restaurantId: selectedRestaurant || undefined,
        orderId: selectedOrder || undefined,
      });
      setDebts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Qarzdorliklarni yuklashda xatolik");
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

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Orders yuklashda xatolik:", error);
    }
  };

  const handleSearch = () => {
    fetchDebts();
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedRestaurant("");
    setSelectedOrder("");
    fetchDebts();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Qarzdorlikni o'chirishni xohlaysizmi?")) {
      try {
        await debtAPI.delete(id);
        toast.success("Qarzdorlik o'chirildi");
        fetchDebts();
      } catch (error) {
        toast.error("Qarzdorlikni o'chirishda xatolik");
      }
    }
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedDebt(null);
    setIsModalOpen(true);
  };

  const handleEdit = (debt: Debt) => {
    setIsEditMode(true);
    setSelectedDebt(debt);
    setIsModalOpen(true);
  };

  const handleView = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (data: CreateDebtDto | UpdateDebtDto) => {
    try {
      if (isEditMode && selectedDebt) {
        await debtAPI.update(selectedDebt.id, data as UpdateDebtDto);
        toast.success("Qarzdorlik muvaffaqiyatli yangilandi");
      } else {
        await debtAPI.create(data as CreateDebtDto);
        toast.success("Qarzdorlik muvaffaqiyatli yaratildi");
      }
      setIsModalOpen(false);
      setSelectedDebt(null);

      const formElements = document.querySelectorAll(
        "#username, #amount, #restaurantId, #orderId"
      ) as NodeListOf<HTMLInputElement | HTMLSelectElement>;
      formElements.forEach((element) => {
        if (element instanceof HTMLInputElement) {
          element.value = "";
        } else if (element instanceof HTMLSelectElement) {
          element.value = "";
        }
      });
      fetchDebts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Qarzdorliklar</h1>
          <p className="text-gray-600">
            Tizimdagi barcha qarzdorliklarni boshqaring
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Yangi qarzdorlik
        </button>
      </div>

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
                placeholder="Mijoz nomi bo'yicha qidirish..."
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
              Buyurtma
            </label>
            <select
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              className="input"
            >
              <option value="">Barcha buyurtmalar</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.table} - {formatCurrency(order.total)}
                </option>
              ))}
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
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Qidirishni tozalash
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-8">
            <DollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Qarzdorliklar topilmadi
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Yangi qarzdorlik qo'shing
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mijoz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miqdori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyurtma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sana
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {debts.map((debt) => (
                  <tr key={debt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {debt.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-red-600">
                        {formatCurrency(debt.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Store className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {debt.Restaurant?.name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ShoppingCart className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {debt.Order?.table || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(debt.createdAt).toLocaleDateString("uz-UZ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(debt)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(debt)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(debt.id)}
                          className="text-red-600 hover:text-red-900"
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Qarzdorlikni tahrirlash" : "Yangi qarzdorlik"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mijoz nomi *
              </label>
              <input
                type="text"
                defaultValue={selectedDebt?.username || ""}
                className="input w-full"
                placeholder="Mijoz nomi"
                id="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Miqdori (so'm) *
              </label>
              <input
                type="number"
                min="0"
                step="100"
                defaultValue={selectedDebt?.amount || ""}
                className="input w-full"
                placeholder="0"
                id="amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant
              </label>
              <select
                className="input w-full"
                id="restaurantId"
                defaultValue={selectedDebt?.restaurantId || ""}
              >
                <option value="">Restaurantni tanlang</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buyurtma
              </label>
              <select
                className="input w-full"
                id="orderId"
                defaultValue={selectedDebt?.orderId || ""}
              >
                <option value="">Buyurtmani tanlang</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.table} - {formatCurrency(order.total)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Bekor qilish
            </button>
            <button
              onClick={() => {
                const username = (
                  document.getElementById("username") as HTMLInputElement
                )?.value;
                const amount = (
                  document.getElementById("amount") as HTMLInputElement
                )?.value;
                const restaurantId = (
                  document.getElementById("restaurantId") as HTMLSelectElement
                )?.value;
                const orderId = (
                  document.getElementById("orderId") as HTMLSelectElement
                )?.value;

                if (!username || !amount) {
                  toast.error("Mijoz nomi va miqdori kiritilishi shart");
                  return;
                }

                const data = {
                  username,
                  amount: Number(amount),
                  ...(restaurantId && { restaurantId }),
                  ...(orderId && { orderId }),
                };

                handleSubmit(data);
              }}
              className="btn btn-primary"
            >
              {isEditMode ? "Yangilash" : "Yaratish"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Qarzdorlik ma'lumotlari"
        size="lg"
      >
        {selectedDebt && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mijoz nomi
                </label>
                <p className="text-gray-900">{selectedDebt.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Miqdori
                </label>
                <p className="text-gray-900">
                  {formatCurrency(selectedDebt.amount)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant
                </label>
                <p className="text-gray-900">
                  {selectedDebt.Restaurant?.name || "-"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buyurtma
                </label>
                <p className="text-gray-900">
                  {selectedDebt.Order?.table || "-"}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yaratilgan sana
              </label>
              <p className="text-gray-900">
                {new Date(selectedDebt.createdAt).toLocaleDateString("uz-UZ")}
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

export default Debts;
