import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Filter,
  RefreshCw,
  DollarSign,
  User,
  Store,
  ShoppingCart,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import { FoodRain, InputField, SelectField } from "../components";
import { useForm } from "react-hook-form";
import { useDebounce } from "use-debounce";

interface DebtForm {
  username: string;
  amount: string;
  restaurantId?: string;
  orderId?: string;
}

const Debts: React.FC = React.memo(() => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DebtForm>();

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await debtAPI.getAll({
        client: debouncedSearch || undefined,
        restaurantId: selectedRestaurant || undefined,
        orderId: selectedOrder || undefined,
      });
      setDebts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error);
      toast.error("Qarzdorliklarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedRestaurant, selectedOrder]);

  const fetchRestaurants = useCallback(async () => {
    try {
      const { data } = await restaurantAPI.getAll();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Restaurants yuklashda xatolik:", error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await orderAPI.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Orders yuklashda xatolik:", error);
    }
  }, []);

  useEffect(() => {
    fetchDebts();
    fetchRestaurants();
    fetchOrders();
  }, [fetchDebts, fetchRestaurants, fetchOrders]);

  const handleReset = useCallback(() => {
    setSearchTerm("");
    setSelectedRestaurant("");
    setSelectedOrder("");
    fetchDebts();
  }, [fetchDebts]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Qarzdorlikni o'chirishni xohlaysizmi?")) return;
      try {
        await debtAPI.delete(id);
        toast.success("Qarzdorlik o'chirildi");
        fetchDebts();
      } catch (error) {
        console.log(error);
        toast.error("Qarzdorlikni o'chirishda xatolik");
      }
    },
    [fetchDebts],
  );

  const handleCreate = useCallback(() => {
    setIsEditMode(false);
    setSelectedDebt(null);
    reset({ username: "", amount: "", restaurantId: "", orderId: "" });
    setIsModalOpen(true);
  }, [reset]);

  const handleEdit = useCallback(
    (debt: Debt) => {
      setIsEditMode(true);
      setSelectedDebt(debt);
      setValue("username", debt.username);
      setValue("amount", debt.amount.toString());
      setValue("restaurantId", debt.restaurantId || "");
      setValue("orderId", debt.orderId || "");
      setIsModalOpen(true);
    },
    [setValue],
  );

  const handleView = useCallback((debt: Debt) => {
    setSelectedDebt(debt);
    setIsViewModalOpen(true);
  }, []);

  const onSubmit = useCallback(
    async (data: DebtForm) => {
      try {
        const payload = {
          username: data.username,
          amount: Number(data.amount),
          ...(data.restaurantId && { restaurantId: data.restaurantId }),
          ...(data.orderId && { orderId: data.orderId }),
        };

        if (isEditMode && selectedDebt) {
          await debtAPI.update(selectedDebt.id, payload as UpdateDebtDto);
          toast.success("Qarzdorlik muvaffaqiyatli yangilandi");
        } else {
          await debtAPI.create(payload as CreateDebtDto);
          toast.success("Qarzdorlik muvaffaqiyatli yaratildi");
        }

        setIsModalOpen(false);
        reset();
        fetchDebts();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      }
    },
    [isEditMode, selectedDebt, reset, fetchDebts],
  );

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
    }).format(amount);
  }, []);

  const tableRows = useMemo(() => {
    return debts.map((debt) => (
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
    ));
  }, [debts, formatCurrency, handleView, handleEdit, handleDelete]);

  return (
    <div className="space-y-6">
      <FoodRain />
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
            <InputField
              label="Qidirish"
              icon={Search}
              name="search"
              type="text"
              placeholder="Mijoz nomi bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="min-w-48">
            <SelectField
              label="Restaurant"
              icon={Store}
              name="restaurant"
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
            >
              <option value="">Barcha restaurantlar</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="min-w-48">
            <SelectField
              label="Buyurtma"
              icon={ShoppingCart}
              name="order"
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
            >
              <option value="">Barcha buyurtmalar</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.table} - {formatCurrency(o.total)}
                </option>
              ))}
            </SelectField>
          </div>

          <button
            onClick={fetchDebts}
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
            Tozalash
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
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
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
                {tableRows}
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Mijoz nomi *"
              icon={User}
              name="username"
              placeholder="Mijoz nomi"
              register={register("username", { required: "Mijoz nomi shart" })}
              errors={errors}
            />
            <InputField
              label="Miqdori (so'm) *"
              icon={DollarSign}
              name="amount"
              type="number"
              min="0"
              step="100"
              placeholder="0"
              register={register("amount", {
                required: "Miqdor shart",
                min: { value: 1, message: "Miqdor 0 dan katta bo'lishi kerak" },
              })}
              errors={errors}
            />
            <SelectField
              label="Restaurant"
              icon={Store}
              name="restaurantId"
              register={register("restaurantId")}
              errors={errors}
            >
              <option value="">Tanlang</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Buyurtma"
              icon={ShoppingCart}
              name="orderId"
              register={register("orderId")}
              errors={errors}
            >
              <option value="">Tanlang</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.table} - {formatCurrency(o.total)}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Bekor qilish
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? "Yangilash" : "Yaratish"}
            </button>
          </div>
        </form>
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
});

Debts.displayName = "Debts";
export default Debts;
