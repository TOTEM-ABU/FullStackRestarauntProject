import React, { useState, useEffect, useCallback } from "react";
import { userAPI, regionAPI } from "../services/api";
import type { User, Region } from "../types";
import {
  // Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users as UsersIcon,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { FoodRain } from "../components";

const ROLE_CONFIG = {
  ADMIN: { color: "bg-red-100 text-red-800", emoji: "Office Worker" },
  SUPER_ADMIN: { color: "bg-purple-100 text-purple-800", emoji: "Bean" },
  CASHER: { color: "bg-green-100 text-green-800", emoji: "Money Bag" },
  WAITER: { color: "bg-blue-100 text-blue-800", emoji: "Chef" },
  OWNER: { color: "bg-orange-100 text-orange-800", emoji: "Bean" },
} as const;

const DEFAULT_ROLE = {
  color: "bg-gray-100 text-gray-800",
  emoji: "Waving Hand",
};

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll({
        name: searchTerm || undefined,
        role: selectedRole || undefined,
        regionId: selectedRegion || undefined,
      });
      setUsers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.log(error);
      toast.error("Foydalanuvchilarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedRole, selectedRegion]);

  const fetchRegions = useCallback(async () => {
    try {
      const response = await regionAPI.getAll();
      setRegions(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Hududlarni yuklashda xatolik:", error);
    }
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Foydalanuvchini o'chirishni xohlaysizmi?")) return;

      try {
        await userAPI.delete(id);
        toast.success("Foydalanuvchi o'chirildi");
        fetchUsers();
      } catch (error) {
        console.log(error);
        toast.error("O'chirishda xatolik");
      }
    },
    [fetchUsers],
  );

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
    }).format(amount);
  }, []);

  const getRoleStyle = useCallback((role: string) => {
    return ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] || DEFAULT_ROLE;
  }, []);

  const UserRow = React.memo(({ user }: { user: User }) => {
    const roleStyle = getRoleStyle(user.role);

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {user.name}
              </div>
              <div className="text-sm text-gray-500">{user.phone}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleStyle.color}`}
          >
            {roleStyle.emoji} {user.role}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatCurrency(user.balans)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {user.Region?.name || "-"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {new Date(user.createdAt).toLocaleDateString("uz-UZ")}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2">
            <button className="text-primary-600 hover:text-primary-900">
              <Eye className="h-4 w-4" />
            </button>
            <button className="text-blue-600 hover:text-blue-900">
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(user.id)}
              className="text-red-600 hover:text-red-900"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  });

  return (
    <div className="space-y-6">
      <FoodRain />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Foydalanuvchilar</h1>
          <p className="text-gray-600">
            Tizimdagi barcha foydalanuvchilarni boshqaring
          </p>
        </div>
        {/* <button className="btn btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Yangi foydalanuvchi
        </button> */}
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qidirish
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ism yoki telefon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                onKeyPress={(e) => e.key === "Enter" && fetchUsers()}
              />
            </div>
          </div>

          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input"
            >
              <option value="">Barcha rollar</option>
              {Object.keys(ROLE_CONFIG).map((role) => (
                <option key={role} value={role}>
                  {role.replace("_", " ")}
                </option>
              ))}
            </select>
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

          <button
            onClick={fetchUsers}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Filter className="h-4 w-4" /> Filtrlash
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Foydalanuvchilar topilmadi
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Yangi foydalanuvchi qo'shing
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Foydalanuvchi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balans
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hudud
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yaratilgan sana
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
