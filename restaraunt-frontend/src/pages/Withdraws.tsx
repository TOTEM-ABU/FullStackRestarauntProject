import React, { useState, useEffect } from "react";
import { withdrawAPI, restaurantAPI, orderAPI } from "../services/api";
import type {
  Withdraw,
  Restaurant,
  Order,
  CreateWithdrawDto,
  UpdateWithdrawDto,
} from "../types";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign as DollarIcon,
  Filter,
  Store,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";

const Withdraws: React.FC = () => {
  const [withdraws, setWithdraws] = useState<Withdraw[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedWithdraw, setSelectedWithdraw] = useState<Withdraw | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchWithdraws();
    fetchRestaurants();
    fetchOrders();
  }, []);

  const fetchWithdraws = async () => {
    try {
      setLoading(true);
      const response = await withdrawAPI.getAll({
        orderId: selectedOrder || undefined,
        restaurantId: selectedRestaurant || undefined,
        type: selectedType || undefined,
      });
      setWithdraws(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Chiqimlarni yuklashda xatolik");
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
    fetchWithdraws();
  };

  const handleReset = () => {
    setSelectedRestaurant("");
    setSelectedOrder("");
    setSelectedType("");
    fetchWithdraws();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Chiqimni o'chirishni xohlaysizmi?")) {
      try {
        await withdrawAPI.delete(id);
        toast.success("Chiqim o'chirildi");
        fetchWithdraws();
      } catch (error) {
        toast.error("Chiqimni o'chirishda xatolik");
      }
    }
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedWithdraw(null);
    setIsModalOpen(true);
  };

  const handleEdit = (withdraw: Withdraw) => {
    setIsEditMode(true);
    setSelectedWithdraw(withdraw);
    setIsModalOpen(true);
  };

  const handleView = (withdraw: Withdraw) => {
    setSelectedWithdraw(withdraw);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (data: CreateWithdrawDto | UpdateWithdrawDto) => {
    try {
      if (isEditMode && selectedWithdraw) {
        await withdrawAPI.update(
          selectedWithdraw.id,
          data as UpdateWithdrawDto
        );
        toast.success("Chiqim muvaffaqiyatli yangilandi");
      } else {
        await withdrawAPI.create(data as CreateWithdrawDto);
        toast.success("Chiqim muvaffaqiyatli yaratildi");
      }
      setIsModalOpen(false);
      setSelectedWithdraw(null);
      fetchWithdraws();
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

  const getTypeBadgeColor = (type: string) => {
    return type === "INCOME"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getTypeIcon = (type: string) => {
    return type === "INCOME" ? TrendingUp : TrendingDown;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chiqimlar</h1>
          <p className="text-gray-600">
            Tizimdagi barcha chiqimlarni boshqaring
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Yangi chiqim
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
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

          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Turi
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
            >
              <option value="">Barcha turlar</option>
              <option value="INCOME">Kirim</option>
              <option value="OUTCOME">Chiqim</option>
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
            Qayta boshlash
          </button>
        </div>
      </div>

      {/* Withdraws Table */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : withdraws.length === 0 ? (
          <div className="text-center py-8">
            <DollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Chiqimlar topilmadi
            </h3>
            <p className="mt-1 text-sm text-gray-500">Yangi chiqim qo'shing</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turi
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
                    Izoh
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
                {withdraws.map((withdraw) => {
                  const TypeIcon = getTypeIcon(withdraw.type);
                  return (
                    <tr key={withdraw.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TypeIcon className="h-4 w-4 mr-2" />
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(
                              withdraw.type
                            )}`}
                          >
                            {withdraw.type === "INCOME" ? "Kirim" : "Chiqim"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${
                            withdraw.type === "INCOME"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(withdraw.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Store className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {withdraw.Restaurant?.name || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ShoppingCart className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {withdraw.Order?.table || "-"}
                          </span>
                        </div>
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {withdraw.description?.includes("Waiter salary for order") ? "Ofitsiant maoshi" :
                          withdraw.description?.includes("Product costs for order") ? "Mahsulot xarajatlari" :
                          withdraw.description?.includes("Other expenses (rent, utilities) for order") ? "Boshqa xarajatlar" :
                          withdraw.description?.includes("Net profit from order") ? "Sof foyda" :
                          withdraw.description === "Ofitsiant maoshi" ? "Ofitsiant maoshi" :
                          withdraw.description === "Mahsulot xarajatlari" ? "Mahsulot xarajatlari" :
                          withdraw.description === "Boshqa xarajatlar" ? "Boshqa xarajatlar" :
                          withdraw.description === "Sof foyda" ? "Sof foyda" :
                          withdraw.description || "-"}
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(withdraw.createdAt).toLocaleDateString(
                          "uz-UZ"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(withdraw)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(withdraw)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(withdraw.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Chiqimni tahrirlash" : "Yangi chiqim"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Turi *
              </label>
              <select
                className="input w-full"
                id="type"
                defaultValue={selectedWithdraw?.type || ""}
              >
                <option value="">Turi tanlang</option>
                <option value="INCOME">Kirim</option>
                <option value="OUTCOME">Chiqim</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Miqdori (so'm) *
              </label>
              <input
                type="number"
                min="0"
                step="100"
                defaultValue={selectedWithdraw?.amount || ""}
                className="input w-full"
                placeholder="0"
                id="amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant *
              </label>
              <select
                className="input w-full"
                id="restaurantId"
                defaultValue={selectedWithdraw?.restaurantId || ""}
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
                defaultValue={selectedWithdraw?.orderId || ""}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Izoh
            </label>
            <textarea
              defaultValue={selectedWithdraw?.description || ""}
              className="input w-full"
              rows={3}
              placeholder="Izoh..."
              id="description"
            />
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
                const type = (
                  document.getElementById("type") as HTMLSelectElement
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
                const description = (
                  document.getElementById("description") as HTMLTextAreaElement
                )?.value;

                if (!type || !amount || !restaurantId) {
                  toast.error("Turi, miqdori va restaurant kiritilishi shart");
                  return;
                }

                const data = {
                  type: type as "INCOME" | "OUTCOME",
                  amount: Number(amount),
                  restaurantId,
                  ...(orderId && { orderId }),
                  ...(description && { description }),
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

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Chiqim ma'lumotlari"
        size="lg"
      >
        {selectedWithdraw && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turi
                </label>
                <div className="flex items-center">
                  {(() => {
                    const TypeIcon = getTypeIcon(selectedWithdraw.type);
                    return (
                      <>
                        <TypeIcon className="h-4 w-4 mr-2" />
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(
                            selectedWithdraw.type
                          )}`}
                        >
                          {selectedWithdraw.type === "INCOME"
                            ? "Kirim"
                            : "Chiqim"}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Miqdori
                </label>
                <p
                  className={`text-gray-900 ${
                    selectedWithdraw.type === "INCOME"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(selectedWithdraw.amount)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant
                </label>
                <p className="text-gray-900">
                  {selectedWithdraw.Restaurant?.name || "-"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buyurtma
                </label>
                <p className="text-gray-900">
                  {selectedWithdraw.Order?.table || "-"}
                </p>
              </div>
            </div>
                         <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Izoh
               </label>
               <p className="text-gray-900">
                 {selectedWithdraw.description?.includes("Waiter salary for order") ? "Ofitsiant maoshi" :
                  selectedWithdraw.description?.includes("Product costs for order") ? "Mahsulot xarajatlari" :
                  selectedWithdraw.description?.includes("Other expenses (rent, utilities) for order") ? "Boshqa xarajatlar" :
                  selectedWithdraw.description?.includes("Net profit from order") ? "Sof foyda" :
                  selectedWithdraw.description === "Ofitsiant maoshi" ? "Ofitsiant maoshi" :
                  selectedWithdraw.description === "Mahsulot xarajatlari" ? "Mahsulot xarajatlari" :
                  selectedWithdraw.description === "Boshqa xarajatlar" ? "Boshqa xarajatlar" :
                  selectedWithdraw.description === "Sof foyda" ? "Sof foyda" :
                  selectedWithdraw.description || "-"}
               </p>
             </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yaratilgan sana
              </label>
              <p className="text-gray-900">
                {new Date(selectedWithdraw.createdAt).toLocaleDateString(
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

export default Withdraws;
