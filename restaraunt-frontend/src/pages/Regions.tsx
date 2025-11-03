import React, { useState, useEffect, useCallback, useReducer } from "react";
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
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { FoodRain, Modal, RegionForm } from "../components";

interface State {
  searchTerm: string;
  modal: { isOpen: boolean; isEdit: boolean; region: Region | null };
  viewModal: Region | null;
}

type Action =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "OPEN_MODAL"; payload: { isEdit: boolean; region?: Region } }
  | { type: "CLOSE_MODAL" }
  | { type: "OPEN_VIEW"; payload: Region }
  | { type: "CLOSE_VIEW" };

const initialState: State = {
  searchTerm: "",
  modal: { isOpen: false, isEdit: false, region: null },
  viewModal: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, searchTerm: action.payload };
    case "OPEN_MODAL":
      return {
        ...state,
        modal: {
          isOpen: true,
          isEdit: action.payload.isEdit,
          region: action.payload.region || null,
        },
      };
    case "CLOSE_MODAL":
      return {
        ...state,
        modal: { isOpen: false, isEdit: false, region: null },
      };
    case "OPEN_VIEW":
      return { ...state, viewModal: action.payload };
    case "CLOSE_VIEW":
      return { ...state, viewModal: null };
    default:
      return state;
  }
};

const RegionCard = React.memo(
  ({
    region,
    onView,
    onEdit,
    onDelete,
  }: {
    region: Region;
    onView: (r: Region) => void;
    onEdit: (r: Region) => void;
    onDelete: (id: string) => void;
  }) => {
    const restaurantCount = region._count?.restaurant || 0;
    const userCount = region.Users?.length || 0;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {region.name}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <MapPinIcon className="h-4 w-4 mr-1" /> ID: {region.id}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {restaurantCount}
            </div>
            <div className="text-xs text-gray-500">Rest.</div>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Restaurantlar:</span>
            <span className="font-medium flex items-center">
              <Store className="h-4 w-4 mr-1" /> {restaurantCount} ta
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Foydalanuvchilar:</span>
            <span className="font-medium flex items-center">
              <Users className="h-4 w-4 mr-1" /> {userCount} ta
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => onView(region)}
              className="text-primary-600 hover:text-primary-900"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(region)}
              className="text-blue-600 hover:text-blue-900"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(region.id)}
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
    );
  },
);

const useDebounce = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
};

const Regions: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, dispatch] = useReducer(reducer, initialState);

  const debouncedSearch = useDebounce(state.searchTerm, 500);

  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await regionAPI.getAll({
        search: debouncedSearch || undefined,
      });
      setRegions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error);
      toast.error("Hududlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Hududni o'chirishni xohlaysizmi?")) return;
      try {
        await regionAPI.delete(id);
        toast.success("Hudud o'chirildi");
        fetchRegions();
      } catch {
        toast.error("O'chirishda xatolik");
      }
    },
    [fetchRegions],
  );

  const handleSubmit = useCallback(
    async (data: CreateRegionDto | UpdateRegionDto) => {
      try {
        if (state.modal.isEdit && state.modal.region) {
          await regionAPI.update(
            state.modal.region.id,
            data as UpdateRegionDto,
          );
          toast.success("Hudud yangilandi");
        } else {
          await regionAPI.create(data as CreateRegionDto);
          toast.success("Hudud yaratildi");
        }
        dispatch({ type: "CLOSE_MODAL" });
        fetchRegions();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Xatolik");
      }
    },
    [state.modal, fetchRegions],
  );

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
      <div className="flex justify-between pt-4 border-t">
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <FoodRain />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hududlar</h1>
          <p className="text-gray-600">
            Tizimdagi barcha hududlarni boshqaring
          </p>
        </div>
        <button
          onClick={() =>
            dispatch({ type: "OPEN_MODAL", payload: { isEdit: false } })
          }
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Yangi hudud
        </button>
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
                placeholder="Nomi bo'yicha..."
                value={state.searchTerm}
                onChange={(e) =>
                  dispatch({ type: "SET_SEARCH", payload: e.target.value })
                }
                className="input pl-10"
              />
            </div>
          </div>
          <button
            onClick={fetchRegions}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Filter className="h-4 w-4" /> Filtrlash
          </button>
          <button
            onClick={() => dispatch({ type: "SET_SEARCH", payload: "" })}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Tozalash
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : regions.length === 0 ? (
          <div className="text-center py-8">
            <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Hudud topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region) => (
              <RegionCard
                key={region.id}
                region={region}
                onView={(r) => dispatch({ type: "OPEN_VIEW", payload: r })}
                onEdit={(r) =>
                  dispatch({
                    type: "OPEN_MODAL",
                    payload: { isEdit: true, region: r },
                  })
                }
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={state.modal.isOpen}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        title={state.modal.isEdit ? "Tahrirlash" : "Yangi hudud"}
        size="lg"
      >
        <RegionForm
          onSubmit={handleSubmit}
          initialData={state.modal.region}
          isEdit={state.modal.isEdit}
          onCancel={() => dispatch({ type: "CLOSE_MODAL" })}
        />
      </Modal>

      <Modal
        isOpen={!!state.viewModal}
        onClose={() => dispatch({ type: "CLOSE_VIEW" })}
        title="Hudud ma'lumotlari"
        size="lg"
      >
        {state.viewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Nomi:</strong> {state.viewModal.name}
              </div>
              <div>
                <strong>ID:</strong> {state.viewModal.id}
              </div>
            </div>
            <div>
              <strong>Restaurantlar:</strong>{" "}
              {state.viewModal._count?.restaurant || 0} ta
            </div>
            <div>
              <strong>Foydalanuvchilar:</strong>{" "}
              {state.viewModal.Users?.length || 0} ta
            </div>
            <div>
              <strong>Yaratilgan:</strong>{" "}
              {new Date(state.viewModal.createdAt).toLocaleDateString("uz-UZ")}
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => dispatch({ type: "CLOSE_VIEW" })}
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
