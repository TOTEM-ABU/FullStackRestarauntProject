import React, { useState, useEffect } from "react";
import { orderAPI, restaurantAPI, productAPI, userAPI } from "../services/api";
import type { Order, Restaurant, Product, User } from "../types";
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
  User as UserIcon,
  X,
  RefreshCw,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import Modal from "../components/Modal";

interface OrderItem {
  productId: string;
  quantity: number;
}

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [waiters, setWaiters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Order creation statecle
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedRestaurantForOrder, setSelectedRestaurantForOrder] =
    useState<string>("");

  const [tableNumber, setTableNumber] = useState<string>("");

  useEffect(() => {
    fetchOrders();
    fetchRestaurants();
    fetchProducts();
    fetchWaiters();
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
      const response = await restaurantAPI.getAll({
        limit: 100, // Barcha restaurantlarni olish uchun limit ni oshirdik
        page: 1,
      });
      setRestaurants(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Restaurants yuklashda xatolik:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll({
        limit: 100, // Barcha productlarni olish uchun limit ni oshirdik
        page: 1,
      });
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Products yuklashda xatolik:", error);
    }
  };

  const fetchWaiters = async () => {
    try {
      const response = await userAPI.getAll({
        role: "WAITER",
        limit: 100,
        page: 1,
      });
      setWaiters(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Waiters yuklashda xatolik:", error);
    }
  };

  const handleSearch = () => {
    fetchOrders();
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedRestaurant("");
    setSelectedProduct("");
    fetchOrders();
  };

  const handleCreate = () => {
    // Check if user can create orders
    if (user?.role !== "WAITER" && user?.role !== "CASHER") {
      toast.error("Siz buyurtma yarata olmaysiz!");
      return;
    }

    setIsEditMode(false);
    setSelectedOrder(null);
    setOrderItems([]);
    setSelectedRestaurantForOrder("");

    setTableNumber("");
    setIsModalOpen(true);
  };

  const handleEdit = (order: Order) => {
    // Check if user can edit orders
    if (user?.role !== "WAITER" && user?.role !== "CASHER") {
      toast.error("Siz buyurtmani tahrirlay olmaysiz!");
      return;
    }

    setIsEditMode(true);
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { productId: "", quantity: 1 }]);
  };

  const removeOrderItem = (index: number) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  const updateOrderItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const duplicateOrderItem = (index: number) => {
    const itemToDuplicate = orderItems[index];
    const newItems = [...orderItems];
    newItems.splice(index + 1, 0, { ...itemToDuplicate });
    setOrderItems(newItems);
  };

  const clearAllItems = () => {
    setOrderItems([]);
  };

  const addMultipleItems = () => {
    // Add 3 empty items at once
    const newItems = [...orderItems];
    for (let i = 0; i < 3; i++) {
      newItems.push({ productId: "", quantity: 1 });
    }
    setOrderItems(newItems);
  };

  const addQuickOrder = (productIds: string[]) => {
    const newItems = productIds.map((productId) => ({
      productId,
      quantity: 1,
    }));
    setOrderItems([...orderItems, ...newItems]);
  };

  const getPopularProducts = () => {
    // Get products that are most commonly ordered
    return products.slice(0, 5); // First 5 products as popular
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isModalOpen) return;

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "Enter":
            event.preventDefault();
            // Check if user can create orders
            if (user?.role !== "WAITER" && user?.role !== "CASHER") {
              toast.error("Siz buyurtma yarata olmaysiz!");
              return;
            }
            // Submit form
            if (
              tableNumber &&
              selectedRestaurantForOrder &&
              orderItems.length > 0
            ) {
              const validItems = orderItems.filter(
                (item) => item.productId && item.quantity > 0
              );
              if (validItems.length > 0) {
                const data = {
                  table: Number(tableNumber),
                  restaurantId: selectedRestaurantForOrder,
                  orderItems: validItems,
                };
                handleSubmit(data);
              }
            }
            break;
          case "n":
            event.preventDefault();
            addOrderItem();
            break;
          case "d":
            event.preventDefault();
            if (orderItems.length > 0) {
              duplicateOrderItem(orderItems.length - 1);
            }
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isModalOpen, tableNumber, selectedRestaurantForOrder, orderItems]);

  const handleSubmit = async (data: any) => {
    // Check if user can create/edit orders
    if (user?.role !== "WAITER" && user?.role !== "CASHER") {
      toast.error("Siz buyurtma yarata/tahrirlay olmaysiz!");
      return;
    }

    try {
      if (isEditMode && selectedOrder) {
        await orderAPI.update(selectedOrder.id, data);
        toast.success("Buyurtma muvaffaqiyatli yangilandi");
      } else {
        // Create new order with proper structure
        const orderData = {
          table: Number(tableNumber),
          restaurantId: selectedRestaurantForOrder,

          orderItems: orderItems.filter(
            (item) => item.productId && item.quantity > 0
          ),
        };

        if (orderData.orderItems.length === 0) {
          toast.error("Kamida bitta mahsulot qo'shish kerak");
          return;
        }

        await orderAPI.create(orderData);
        toast.success("Buyurtma muvaffaqiyatli yaratildi");
      }
      setIsModalOpen(false);
      setSelectedOrder(null);
      setOrderItems([]);
      setSelectedRestaurantForOrder("");

      setTableNumber("");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    // Check if user can delete orders
    if (user?.role !== "WAITER" && user?.role !== "CASHER") {
      toast.error("Siz buyurtmani o'chira olmaysiz!");
      return;
    }

    console.log("Attempting to delete order:", id);

    if (
      window.confirm(
        "Buyurtmani o'chirishni xohlaysizmi?\n\nBu amalni qaytarib bo'lmaydi!"
      )
    ) {
      try {
        console.log("Sending delete request for order:", id);
        await orderAPI.delete(id);
        console.log("Order deleted successfully:", id);
        toast.success("Buyurtma muvaffaqiyatli o'chirildi");
        fetchOrders();
      } catch (error: any) {
        console.error("Delete error:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Buyurtmani o'chirishda xatolik yuz berdi";
        toast.error(errorMessage);
      }
    } else {
      console.log("Delete cancelled by user");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
    }).format(amount);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
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
        {(user?.role === "WAITER" || user?.role === "CASHER") && (
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
          <button
            onClick={handleReset}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Qidirishni tozalash
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
                    Ofitsiant
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {order.Waiter?.name || "-"}
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
                        {(user?.role === "WAITER" ||
                          user?.role === "CASHER") && (
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
        size="xl"
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stol raqami *
              </label>
              <input
                type="number"
                min="1"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="input w-full"
                placeholder="Stol raqami"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant *
              </label>
              <select
                className="input w-full"
                value={selectedRestaurantForOrder}
                onChange={(e) => setSelectedRestaurantForOrder(e.target.value)}
              >
                <option value="">Restaurantni tanlang</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Actions */}
          {products.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Tezkor buyurtmalar
              </h3>
              <div className="flex flex-wrap gap-2">
                {getPopularProducts().map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addQuickOrder([product.id])}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    + {product.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addMultipleItems()}
                  className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                >
                  +3 Bo'sh mahsulot
                </button>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Mahsulotlar * ({orderItems.length} ta)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addMultipleItems}
                  className="btn btn-secondary btn-sm flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  +3 Mahsulot
                </button>
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="btn btn-secondary btn-sm flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  +1 Mahsulot
                </button>
                {orderItems.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllItems}
                    className="btn btn-danger btn-sm flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Tozalash
                  </button>
                )}
              </div>
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Mahsulot qo'shilmagan
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Buyurtma uchun mahsulot qo'shing
                </p>
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="btn btn-primary btn-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Birinchi mahsulotni qo'shish
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mahsulot #{index + 1}
                      </label>
                      <select
                        className="input w-full"
                        value={item.productId}
                        onChange={(e) =>
                          updateOrderItem(index, "productId", e.target.value)
                        }
                      >
                        <option value="">Mahsulotni tanlang</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {formatCurrency(product.price)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Miqdori
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateOrderItem(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        className="input w-full"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Narxi
                      </label>
                      <div className="text-sm font-semibold text-green-600">
                        {(() => {
                          const product = products.find(
                            (p) => p.id === item.productId
                          );
                          return product
                            ? formatCurrency(product.price * item.quantity)
                            : "-";
                        })()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 mt-6">
                      <button
                        type="button"
                        onClick={() => duplicateOrderItem(index)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Nusxalash"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeOrderItem(index)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="O'chirish"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            {orderItems.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Jami mahsulotlar:{" "}
                      {orderItems.filter((item) => item.productId).length} ta
                    </span>
                    <br />
                    <span className="text-sm text-gray-500">
                      Jami miqdor:{" "}
                      {orderItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      ta
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-700">
                      Jami summa:
                    </span>
                    <br />
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <div className="flex-1 text-left">
              <div className="text-xs text-gray-500">
                <strong>Keyboard shortcuts:</strong>
                <br />
                Ctrl+Enter: Buyurtmani yaratish
                <br />
                Ctrl+N: Yangi mahsulot qo'shish
                <br />
                Ctrl+D: Oxirgi mahsulotni nusxalash
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Bekor qilish
            </button>
            <button
              onClick={() => {
                // Check if user can create orders
                if (user?.role !== "WAITER" && user?.role !== "CASHER") {
                  toast.error("Siz buyurtma yarata olmaysiz!");
                  return;
                }

                if (!tableNumber || !selectedRestaurantForOrder) {
                  toast.error("Stol raqami va restaurant kiritilishi shart");
                  return;
                }

                if (orderItems.length === 0) {
                  toast.error("Kamida bitta mahsulot qo'shish kerak");
                  return;
                }

                const validItems = orderItems.filter(
                  (item) => item.productId && item.quantity > 0
                );
                if (validItems.length === 0) {
                  toast.error("To'g'ri mahsulot va miqdori kiritilishi shart");
                  return;
                }

                // Check for duplicate products
                const productIds = validItems.map((item) => item.productId);
                const uniqueProductIds = [...new Set(productIds)];
                if (productIds.length !== uniqueProductIds.length) {
                  toast.error(
                    "Bir xil mahsulot bir necha marta qo'shilgan. Iltimos, miqdorni o'zgartiring"
                  );
                  return;
                }

                const data = {
                  table: Number(tableNumber),
                  restaurantId: selectedRestaurantForOrder,
                  orderItems: validItems,
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
                  Ofitsiant
                </label>
                <p className="text-gray-900">
                  {selectedOrder.Waiter?.name || "-"}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sof foyda
                </label>
                <p className="text-green-600 font-semibold">
                  {formatCurrency(selectedOrder.total * 0.35)}{" "}
                  {/* 35% net profit */}
                </p>
              </div>
            </div>

            {/* Order Items */}
            {selectedOrder.OrderItems &&
              selectedOrder.OrderItems.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mahsulotlar
                  </label>
                  <div className="space-y-2">
                    {selectedOrder.OrderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-900">
                          {item.product?.name || "Noma'lum mahsulot"}
                        </span>
                        <span className="text-sm text-gray-600">
                          {item.quantity} ta -{" "}
                          {formatCurrency(
                            (item.product?.price || 0) * item.quantity
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
