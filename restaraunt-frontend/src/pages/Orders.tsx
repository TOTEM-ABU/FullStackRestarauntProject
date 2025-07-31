import React, { useState, useEffect } from "react";
import { orderAPI, restaurantAPI, productAPI } from "../services/api";
import type { Order, Restaurant, Product } from "../types";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ShoppingCart as CartIcon,
  Filter,
  DollarSign,
  Store,
  Package,
  Calendar,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import Modal from "../components/Modal";

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchRestaurants();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll({
        restaurantId: selectedRestaurant || undefined,
        productId: selectedProduct || undefined,
      });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Buyurtmalarni yuklashda xatolik");
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

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Products yuklashda xatolik:", error);
    }
  };

  const handleSearch = () => {
    fetchOrders();
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedOrder(null);
    setIsModalOpen(true);
  };

  const handleEdit = (order: Order) => {
    setIsEditMode(true);
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (isEditMode && selectedOrder) {
        await orderAPI.update(selectedOrder.id, data);
        toast.success("Buyurtma muvaffaqiyatli yangilandi");
      } else {
        await orderAPI.create(data);
        toast.success("Buyurtma muvaffaqiyatli yaratildi");
      }
      setIsModalOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Buyurtmani o'chirishni xohlaysizmi?")) {
      try {
        await orderAPI.delete(id);
        toast.success("Buyurtma o'chirildi");
        fetchOrders();
      } catch (error) {
        toast.error("Buyurtmani o'chirishda xatolik");
      }
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <h1 className="text-2xl font-bold text-gray-900">Buyurtmalar</h1>
          <p className="text-gray-600">
            Tizimdagi barcha buyurtmalarni boshqaring
          </p>
        </div>
        {(user?.role === "ADMIN" ||
          user?.role === "SUPER_ADMIN" ||
          user?.role === "WAITER") && (
          <button 
            onClick={handleCreate}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Yangi buyurtma
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
                placeholder="Buyurtma ID bo'yicha qidirish..."
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
              Mahsulot
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="input"
            >
              <option value="">Barcha mahsulotlar</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
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
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <CartIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Buyurtmalar topilmadi
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Yangi buyurtma qo'shing
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyurtma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Summa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mahsulotlar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sana
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              #{order.id.slice(-4)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            Buyurtma #{order.id.slice(-6)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {order.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Store className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {order.Restaurant?.name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Stol {order.table}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        {order.OrderItems?.length || 0} ta mahsulot
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(order.createdAt).toLocaleDateString("uz-UZ")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleView(order)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {(user?.role === "ADMIN" ||
                          user?.role === "SUPER_ADMIN" ||
                          user?.role === "WAITER") && (
                          <>
                            <button 
                              onClick={() => handleEdit(order)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Buyurtmani tahrirlash" : "Yangi buyurtma"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stol raqami *
              </label>
              <input
                type="number"
                min="1"
                defaultValue={selectedOrder?.table || ""}
                className="input w-full"
                placeholder="Stol raqami"
                id="table"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant *
              </label>
              <select className="input w-full" id="restaurantId">
                <option value="">Restaurantni tanlang</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
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
                const table = (
                  document.getElementById("table") as HTMLInputElement
                )?.value;
                const restaurantId = (
                  document.getElementById("restaurantId") as HTMLSelectElement
                )?.value;

                if (!table || !restaurantId) {
                  toast.error("Stol raqami va restaurant kiritilishi shart");
                  return;
                }

                const data = {
                  table: Number(table),
                  restaurantId,
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
        title="Buyurtma ma'lumotlari"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buyurtma ID
                </label>
                <p className="text-gray-900">{selectedOrder.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stol raqami
                </label>
                <p className="text-gray-900">Stol {selectedOrder.table}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant
                </label>
                <p className="text-gray-900">
                  {selectedOrder.Restaurant?.name || "-"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jami summa
                </label>
                <p className="text-gray-900">
                  {formatCurrency(selectedOrder.total)}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yaratilgan sana
              </label>
              <p className="text-gray-900">
                {new Date(selectedOrder.createdAt).toLocaleDateString("uz-UZ")}
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

export default Orders;
