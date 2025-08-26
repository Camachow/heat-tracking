import { create } from "zustand";
import { api } from "../lib/api";

const useMediaStore = create((set, get) => ({
  mediaItems: [],                   // evita "mediaItems is undefined"
  consumptionsByMedia: {},          // { [mediaId]: Consumption[] }
  loading: false,
  error: null,

  loadMedia: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const q = new URLSearchParams(filters).toString();
      const list = await api(`/media${q ? `?${q}` : ""}`);
      set({ mediaItems: list });
    } catch (e) { set({ error: e.message }); }
    finally { set({ loading: false }); }
  },

  createMedia: async (payload) => {
    const m = await api(`/media`, { method: "POST", body: payload });
    set((s) => ({ mediaItems: [m, ...s.mediaItems] }));
    return m;
  },
  updateMedia: async (id, payload) => {
    const m = await api(`/media/${id}`, { method: "PATCH", body: payload });
    set((s) => ({ mediaItems: s.mediaItems.map(x => x.id === id ? m : x) }));
    return m;
  },
  deleteMedia: async (id) => {
    await api(`/media/${id}`, { method: "DELETE" });
    set((s) => ({ mediaItems: s.mediaItems.filter(x => x.id !== id) }));
  },

  loadConsumptions: async (mediaId) => {
    const list = await api(`/media/${mediaId}/consumptions`);
    set((s) => ({ consumptionsByMedia: { ...s.consumptionsByMedia, [mediaId]: list } }));
    return list;
  },
  upsertConsumption: async (mediaId, payload) => {
    const c = await api(`/media/${mediaId}/consumptions`, { method: "POST", body: payload });
    set((s) => {
      const prev = s.consumptionsByMedia[mediaId] || [];
      const others = prev.filter(x => x.date !== c.date);
      return { consumptionsByMedia: { ...s.consumptionsByMedia, [mediaId]: [...others, c] }};
    });
    return c;
  },
  toggleConsumption: async (mediaId, dateISO) => {
    await api(`/media/${mediaId}/consumptions/toggle`, { method: "POST", body: { date: dateISO } });
    // re-carrega o dia
    const list = await api(`/media/${mediaId}/consumptions`);
    set((s) => ({ consumptionsByMedia: { ...s.consumptionsByMedia, [mediaId]: list }}));
  },
  deleteConsumption: async (mediaId, consumptionId) => {
    await api(`/media/consumptions/${consumptionId}`, { method: "DELETE" });
    set((s) => {
      const prev = s.consumptionsByMedia[mediaId] || [];
      return { consumptionsByMedia: { ...s.consumptionsByMedia, [mediaId]: prev.filter(c => c.id !== consumptionId) } };
    });
  },
}));

export default useMediaStore;
