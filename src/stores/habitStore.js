// src/stores/habitStore.js
import { create } from "zustand";
import { api } from "../lib/api";

const todayISO = () => new Date().toISOString().slice(0, 10);

const useHabitStore = create((set, get) => ({
  // STATE
  habits: [],
  entriesByHabit: {}, // { [habitId]: Entry[] }
  loading: false,
  error: null,

  // ------- LISTA DE HÁBITOS -------
  loadHabits: async (search) => {
    set({ loading: true, error: null });
    try {
      const qs = search ? `?search=${encodeURIComponent(search)}` : "";
      const habits = await api(`/habits${qs}`);
      set({ habits });
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  createHabit: async (payload) => {
    const h = await api("/habits", { method: "POST", body: payload });
    set((s) => ({ habits: [h, ...s.habits] }));
    return h;
  },

  updateHabit: async (id, payload) => {
    const h = await api(`/habits/${id}`, { method: "PATCH", body: payload });
    set((s) => ({ habits: s.habits.map((x) => (x.id === id ? h : x)) }));
    return h;
  },

  deleteHabit: async (id) => {
    await api(`/habits/${id}`, { method: "DELETE" });
    set((s) => {
      const { [id]: _removed, ...rest } = s.entriesByHabit;
      return { habits: s.habits.filter((x) => x.id !== id), entriesByHabit: rest };
    });
  },

  // ------- ENTRIES -------
  // Mescla o resultado com o que já existe (por data)
  loadEntries: async (habitId, from, to) => {
    const qs = from && to ? `?from=${from}&to=${to}` : "";
    const list = await api(`/habits/${habitId}/entries${qs}`);
    set((s) => {
      const prev = s.entriesByHabit[habitId] || [];
      const byDate = new Map(prev.map((e) => [e.date, e]));
      for (const e of list) byDate.set(e.date, e);
      return {
        entriesByHabit: { ...s.entriesByHabit, [habitId]: Array.from(byDate.values()).sort((a,b)=> a.date.localeCompare(b.date)) },
      };
    });
    return list;
  },

  // Toggle otimista: aplica local, chama API, depois sincroniza só o dia
  toggleEntry: async (habitId, date = todayISO()) => {
    const before = get().entriesByHabit[habitId] || [];
    const exists = before.some((e) => e.date === date);

    // aplica otimista
    set((s) => {
      const current = s.entriesByHabit[habitId] || [];
      const next = exists ? current.filter((e) => e.date !== date) : [...current, { id: `temp-${date}`, date, done: true }];
      return { entriesByHabit: { ...s.entriesByHabit, [habitId]: next } };
    });

    try {
      await api(`/habits/${habitId}/entries/toggle`, {
        method: "POST",
        body: { date },
      });

      // sincroniza apenas o dia
      const oneDay = await api(`/habits/${habitId}/entries?from=${date}&to=${date}`);
      set((s) => {
        const prev = s.entriesByHabit[habitId] || [];
        const others = prev.filter((e) => e.date !== date);
        return {
          entriesByHabit: {
            ...s.entriesByHabit,
            [habitId]: [...others, ...oneDay].sort((a,b)=> a.date.localeCompare(b.date)),
          },
        };
      });

      return { toggled: exists ? "off" : "on" };
    } catch (e) {
      // rollback
      set((s) => ({ entriesByHabit: { ...s.entriesByHabit, [habitId]: before } }));
      throw e;
    }
  },

  upsertEntry: async (habitId, payload) => {
    const e = await api(`/habits/${habitId}/entries`, { method: "POST", body: payload });
    set((s) => {
      const prev = s.entriesByHabit[habitId] || [];
      const others = prev.filter((x) => x.date !== e.date);
      return {
        entriesByHabit: {
          ...s.entriesByHabit,
          [habitId]: [...others, e].sort((a,b)=> a.date.localeCompare(b.date)),
        },
      };
    });
    return e;
  },

  deleteEntry: async (habitId, entryId) => {
    await api(`/habits/entries/${entryId}`, { method: "DELETE" });
    set((s) => {
      const prev = s.entriesByHabit[habitId] || [];
      return {
        entriesByHabit: {
          ...s.entriesByHabit,
          [habitId]: prev.filter((e) => e.id !== entryId),
        },
      };
    });
  },

  // ------- SELETORES -------
  getHabitById: (id) => get().habits.find((h) => h.id === id),
  getEntries: (habitId) => get().entriesByHabit[habitId] || [],
  hasEntryOn: (habitId, dateISO) =>
    (get().entriesByHabit[habitId] || []).some((e) => e.date === dateISO && (e.done ?? true)),
}));

export default useHabitStore;
