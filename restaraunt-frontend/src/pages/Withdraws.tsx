import React, { useState, useEffect, useCallback } from "react";
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
  DollarSign,
  Filter,
  Store,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { FoodRain, Modal } from "../components";

const WITHDRAW_TYPES = {
  INCOME: "INCOME",
  OUTCOME: "OUTCOME",
} as const;

const TYPE_CONFIG = {
  [WITHDRAW_TYPES.INCOME]: {
    label: "Kirim",
    icon: TrendingUp,
    badgeClass: "bg-green-100 text-green-800",
    textClass: "text-green-600",
  },
  [WITHDRAW_TYPES.OUTCOME]: {
    label: "Chiqim",
    icon: TrendingDown,
    badgeClass: "bg-red-100 text-red-800",
    textClass: "text-red-600",
  },
};

const DESCRIPTION_MAP: Record<string, string> = {
  "Waiter salary for order": "Ofitsiant maoshi",
  "Product costs for order": "Mahsulot xarajatlari",
  "Other expenses (rent, utilities) for order": "Boshqa xarajatlar",
  "Net profit from order": "Sof foyda",
  "Ofitsiant maoshi": "Ofitsiant maoshi",
  "Mahsulot xarajatlari": "Mahsulot xarajatlari",
  "Boshqa xarajatlar": "Boshqa xarajatlar",
  "Sof foyda": "Sof foyda",
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
  }).format(amount);
};

const translateDescription = (description?: string): string => {
  if (!description) return "-";

  for (const [key, value] of Object.entries(DESCRIPTION_MAP)) {
    if (description.includes(key)) return value;
  }

  return description;
};

const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
  const Icon = config.icon;

  return (
    <div className="flex items-center">
      <Icon className="h-4 w-4 mr-2" />
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.badgeClass}`}
      >
        {config.label}
      </span>
    </div>
  );
};

const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div className="text-center py-8">
    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">
      Chiqimlar topilmadi
    </h3>
    <p className="mt-1 text-sm text-gray-500">Yangi chiqim qo'shing</p>
    <button onClick={onAdd} className="btn btn-primary mt-4">
      <Plus className="h-4 w-4 mr-2" />
      Yangi chiqim
    </button>
  </div>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
);

interface WithdrawFormProps {
  withdraw?: Withdraw | null;
  restaurants: Restaurant[];
  orders: Order[];
  onSubmit: (data: CreateWithdrawDto | UpdateWithdrawDto) => void;
  onCancel: () => void;
  isEditMode: boolean;
}

const WithdrawForm: React.FC<WithdrawFormProps> = ({
  withdraw,
  restaurants,
  orders,
  onSubmit,
  onCancel,
  isEditMode,
}) => {
  const [formData, setFormData] = useState({
    type: withdraw?.type || "",
    amount: withdraw?.amount?.toString() || "",
    restaurantId: withdraw?.restaurantId || "",
    orderId: withdraw?.orderId || "",
    description: withdraw?.description || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.type || !formData.amount || !formData.restaurantId) {
      toast.error("Turi, miqdori va restaurant kiritilishi shart");
      return;
    }

    const data: any = {
      type: formData.type as "INCOME" | "OUTCOME",
      amount: Number(formData.amount),
      restaurantId: formData.restaurantId,
    };

    if (formData.orderId) data.orderId = formData.orderId;
    if (formData.description) data.description = formData.description;

    onSubmit(data);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Turi *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="">Turi tanlang</option>
            <option value={WITHDRAW_TYPES.INCOME}>Kirim</option>
            <option value={WITHDRAW_TYPES.OUTCOME}>Chiqim</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Miqdori (so'm) *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            step="100"
            className="input w-full"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Restaurant *
          </label>
          <select
            name="restaurantId"
            value={formData.restaurantId}
            onChange={handleChange}
            className="input w-full"
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
            name="orderId"
            value={formData.orderId}
            onChange={handleChange}
            className="input w-full"
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
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input w-full"
          rows={3}
          placeholder="Izoh..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="btn btn-secondary">
          Bekor qilish
        </button>
        <button onClick={handleSubmit} className="btn btn-primary">
          {isEditMode ? "Yangilash" : "Yaratish"}
        </button>
      </div>
    </div>
  );
};

interface FilterBarProps {
  restaurants: Restaurant[];
  orders: Order[];
  filters: {
    restaurantId: string;
    orderId: string;
    type: string;
  };
  onFilterChange: (filters: any) => void;
  onSearch: () => void;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  restaurants,
  orders,
  filters,
  onFilterChange,
  onSearch,
  onReset,
}) => (
  <div className="card">
    <div className="flex flex-wrap gap-4 items-end">
      <div className="min-w-48">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Restaurant
        </label>
        <select
          value={filters.restaurantId}
          onChange={(e) =>
            onFilterChange({ ...filters, restaurantId: e.target.value })
          }
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
          value={filters.orderId}
          onChange={(e) =>
            onFilterChange({ ...filters, orderId: e.target.value })
          }
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
          value={filters.type}
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
          className="input"
        >
          <option value="">Barcha turlar</option>
          <option value={WITHDRAW_TYPES.INCOME}>Kirim</option>
          <option value={WITHDRAW_TYPES.OUTCOME}>Chiqim</option>
        </select>
      </div>

      <button
        onClick={onSearch}
        className="btn btn-secondary flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Filtrlash
      </button>

      <button
        onClick={onReset}
        className="btn btn-secondary flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Qayta boshlash
      </button>
    </div>
  </div>
);

const Withdraws: React.FC = () => {
  const [withdraws, setWithdraws] = useState<Withdraw[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    restaurantId: "",
    orderId: "",
    type: "",
  });
  const [modals, setModals] = useState({
    form: false,
    view: false,
  });
  const [selectedWithdraw, setSelectedWithdraw] = useState<Withdraw | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchWithdraws = useCallback(async () => {
    try {
      setLoading(true);
      const response = await withdrawAPI.getAll({
        orderId: filters.orderId || undefined,
        restaurantId: filters.restaurantId || undefined,
        type: filters.type || undefined,
      });
      setWithdraws(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error);
      toast.error("Chiqimlarni yuklashda xatolik");
      setWithdraws([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await restaurantAPI.getAll();
      setRestaurants(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Restaurants yuklashda xatolik:", error);
      setRestaurants([]);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await orderAPI.getAll();
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Orders yuklashda xatolik:", error);
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    fetchWithdraws();
    fetchRestaurants();
    fetchOrders();
  }, [fetchWithdraws, fetchRestaurants, fetchOrders]);

  const handleReset = () => {
    setFilters({ restaurantId: "", orderId: "", type: "" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Chiqimni o'chirishni xohlaysizmi?")) return;

    try {
      await withdrawAPI.delete(id);
      toast.success("Chiqim o'chirildi");
      fetchWithdraws();
    } catch (error) {
      console.log(error);
      toast.error("Chiqimni o'chirishda xatolik");
    }
  };

  const openFormModal = (withdraw?: Withdraw) => {
    setIsEditMode(!!withdraw);
    setSelectedWithdraw(withdraw || null);
    setModals({ ...modals, form: true });
  };

  const openViewModal = (withdraw: Withdraw) => {
    setSelectedWithdraw(withdraw);
    setModals({ ...modals, view: true });
  };

  const closeModals = () => {
    setModals({ form: false, view: false });
    setSelectedWithdraw(null);
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
      closeModals();
      fetchWithdraws();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="space-y-6">
      <FoodRain />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chiqimlar</h1>
          <p className="text-gray-600">
            Tizimdagi barcha chiqimlarni boshqaring
          </p>
        </div>
        <button
          onClick={() => openFormModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Yangi chiqim
        </button>
      </div>

      <FilterBar
        restaurants={restaurants}
        orders={orders}
        filters={filters}
        onFilterChange={setFilters}
        onSearch={fetchWithdraws}
        onReset={handleReset}
      />

      <div className="card">
        {loading ? (
          <LoadingSpinner />
        ) : withdraws.length === 0 ? (
          <EmptyState onAdd={() => openFormModal()} />
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
                  const config =
                    TYPE_CONFIG[withdraw.type as keyof typeof TYPE_CONFIG];
                  return (
                    <tr key={withdraw.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TypeBadge type={withdraw.type} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${config.textClass}`}
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
                        {translateDescription(withdraw.description)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(withdraw.createdAt).toLocaleDateString(
                          "uz-UZ"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openViewModal(withdraw)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Ko'rish"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openFormModal(withdraw)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Tahrirlash"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(withdraw.id)}
                            className="text-red-600 hover:text-red-900"
                            title="O'chirish"
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

      <Modal
        isOpen={modals.form}
        onClose={closeModals}
        title={isEditMode ? "Chiqimni tahrirlash" : "Yangi chiqim"}
        size="lg"
      >
        <WithdrawForm
          withdraw={selectedWithdraw}
          restaurants={restaurants}
          orders={orders}
          onSubmit={handleSubmit}
          onCancel={closeModals}
          isEditMode={isEditMode}
        />
      </Modal>

      <Modal
        isOpen={modals.view}
        onClose={closeModals}
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
                <TypeBadge type={selectedWithdraw.type} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Miqdori
                </label>
                <p
                  className={`text-gray-900 ${
                    TYPE_CONFIG[
                      selectedWithdraw.type as keyof typeof TYPE_CONFIG
                    ].textClass
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
                {translateDescription(selectedWithdraw.description)}
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
              <button onClick={closeModals} className="btn btn-secondary">
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
