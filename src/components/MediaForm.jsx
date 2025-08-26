// src/components/MediaForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import useMediaStore from "../stores/mediaStore"; // ← usar store de mídias
import {
  MEDIA_TYPES,
  MEDIA_STATUS,
  MEDIA_TYPE_LABELS,
  MEDIA_STATUS_LABELS,
} from "../types/media";
import { toast } from "react-hot-toast";

const STATUS_BY_TYPE = {
  [MEDIA_TYPES.MOVIE]: [
    MEDIA_STATUS.WATCHING,
    MEDIA_STATUS.COMPLETED,
    MEDIA_STATUS.DROPPED,
  ],
  [MEDIA_TYPES.GAME]: [
    MEDIA_STATUS.PLAYING,
    MEDIA_STATUS.COMPLETED,
    MEDIA_STATUS.DROPPED,
  ],
  [MEDIA_TYPES.BOOK]: [
    MEDIA_STATUS.READING,
    MEDIA_STATUS.COMPLETED,
    MEDIA_STATUS.DROPPED,
  ],
};

export default function MediaForm({ mediaItem, onClose, onSave }) {
  const { createMedia, updateMedia } = useMediaStore(); // ← métodos corretos

  const initialType = mediaItem?.type || MEDIA_TYPES.MOVIE;
  const initialStatus = mediaItem?.status || STATUS_BY_TYPE[initialType][0];

  const [title, setTitle] = useState(mediaItem?.title || "");
  const [type, setType] = useState(initialType);
  const [category, setCategory] = useState(mediaItem?.category || "");
  const [status, setStatus] = useState(initialStatus);
  const [rating, setRating] = useState(
    mediaItem?.rating !== undefined && mediaItem?.rating !== null
      ? String(mediaItem.rating)
      : "0"
  );
  const [notes, setNotes] = useState(mediaItem?.notes || "");

  // sempre que trocar o type, ajusta status para um permitido
  useEffect(() => {
    if (!STATUS_BY_TYPE[type].includes(status)) {
      setStatus(STATUS_BY_TYPE[type][0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const statusOptions = useMemo(() => STATUS_BY_TYPE[type], [type]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const parsedRating = Number.parseInt(rating, 10);
    const safeRating = Number.isFinite(parsedRating) ? parsedRating : 0; // 0..5
    const safeStatus = STATUS_BY_TYPE[type].includes(status)
      ? status
      : STATUS_BY_TYPE[type][0];

    const payload = {
      type, // 'movie'|'game'|'book'
      title: title.trim(),
      category: category.trim() || undefined,
      status: safeStatus,
      rating: Math.max(0, Math.min(5, safeRating)),
      notes: notes.trim() || undefined,
    };

    if (!payload.title) {
      toast.error("Informe um título");
      return;
    }

    try {
      if (mediaItem) {
        await updateMedia(mediaItem.id, payload);
        toast.success("Mídia atualizada");
      } else {
        await createMedia(payload);
        toast.success("Mídia criada");
      }
      onSave?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      try {
        const msg = JSON.parse(err.message)?.message || err.message;
        if (Array.isArray(msg)) toast.error(msg.join(" • "));
        else toast.error(String(msg));
      } catch {
        toast.error(err.message || "Erro ao salvar");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded-lg w-full max-w-lg p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">
          {mediaItem ? "Editar Mídia" : "Nova Mídia"}
        </h2>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm mb-1">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Tipo</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MEDIA_TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm mb-1">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {MEDIA_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Categoria</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex.: Sci-Fi"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Nota (0 a 5)</label>
            <Input
              type="number"
              min={0}
              max={5}
              step={1}
              inputMode="numeric"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm mb-1">Notas</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onClose?.()}>
              Cancelar
            </Button>
            <Button type="submit">{mediaItem ? "Salvar" : "Adicionar"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
