export const toISODate = (d = new Date()) => new Date(d).toISOString().slice(0,10);

export const getEntryForDate = (entries = [], dateISO) =>
  (entries || []).find((e) => e.date === dateISO);
