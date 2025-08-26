import React, { useState, useEffect, useMemo } from "react";
import {
  Film,
  Gamepad2,
  Book,
  Calendar,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import StarRating from "./StarRating";
import useMediaStore from "../stores/mediaStore"; // ← store nova
import { MEDIA_TYPES, MEDIA_STATUS, MEDIA_STATUS_LABELS } from "../types/media";
import { toast } from "react-hot-toast";
import { toISODate } from "@/utils/date"; // ← util ISO yyyy-mm-dd

const MediaCard = ({
  mediaItem,
  onEdit,
  onDelete,
  showConsumptionButton = true,
}) => {
  const {
    consumptionsByMedia,
    loadConsumptions,
    toggleConsumption,
    updateMedia,
  } = useMediaStore();

  const [isToggling, setIsToggling] = useState(false);

  // carregar histórico desse item
  useEffect(() => {
    if (!consumptionsByMedia[mediaItem.id]) {
      loadConsumptions(mediaItem.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaItem.id]);

  const todayKey = toISODate(new Date());
  const list = consumptionsByMedia[mediaItem.id] || [];

  const hasConsumedToday = useMemo(
    () => list.some((c) => c.date === todayKey),
    [list, todayKey]
  );
  const totalConsumptions = list.length;

  const getTypeIcon = (type) => {
    switch (type) {
      case MEDIA_TYPES.MOVIE:
        return <Film className="w-4 h-4" />;
      case MEDIA_TYPES.GAME:
        return <Gamepad2 className="w-4 h-4" />;
      case MEDIA_TYPES.BOOK:
        return <Book className="w-4 h-4" />;
      default:
        return <Film className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case MEDIA_STATUS.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case MEDIA_STATUS.DROPPED:
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case MEDIA_STATUS.COMPLETED:
        return "bg-green-100 text-green-800 border-green-200";
      case MEDIA_STATUS.DROPPED:
        return "bg-red-100 text-red-800 border-red-200";
      case MEDIA_STATUS.WATCHING:
      case MEDIA_STATUS.PLAYING:
      case MEDIA_STATUS.READING:
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleToggleConsumption = async () => {
    if (isToggling) return;
    setIsToggling(true);
    const wasConsumed = hasConsumedToday;
    try {
      await toggleConsumption(mediaItem.id, todayKey);
      toast.success(
        wasConsumed ? "Consumo removido para hoje" : "Consumo marcado para hoje"
      );
    } catch (error) {
      console.error("Erro ao alternar consumo:", error);
      toast.error("Erro ao marcar consumo");
    } finally {
      setIsToggling(false);
    }
  };

  const handleQuickStatusChange = async (newStatus) => {
    try {
      const updates = { status: newStatus };
      if (newStatus === MEDIA_STATUS.COMPLETED && !mediaItem.rating) {
        updates.rating = 0;
      }
      await updateMedia(mediaItem.id, updates);
      toast.success(`Status alterado para: ${MEDIA_STATUS_LABELS[newStatus]}`);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR");
    // se vier ISO "YYYY-MM-DD", new Date() funciona em UTC; ajuste caso precise de TZ local
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon(mediaItem.type)}
              <h3 className="font-semibold text-lg truncate">
                {mediaItem.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={getStatusColor(mediaItem.status)}
              >
                <div className="flex items-center gap-1">
                  {getStatusIcon(mediaItem.status)}
                  {MEDIA_STATUS_LABELS[mediaItem.status]}
                </div>
              </Badge>

              {mediaItem.category && (
                <Badge variant="secondary">{mediaItem.category}</Badge>
              )}
            </div>

            {mediaItem.rating > 0 && (
              <div className="mb-2">
                <StarRating rating={mediaItem.rating} readonly size="sm" />
              </div>
            )}
          </div>

          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(mediaItem)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(mediaItem)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Notas */}
        {mediaItem.notes && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {mediaItem.notes}
          </p>
        )}

        {/* Datas */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Iniciado: {formatDate(mediaItem.startDate)}</span>
            </div>
            {mediaItem.completedAt && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Concluído: {formatDate(mediaItem.completedAt)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-3">
          <span>Total de dias consumidos: {totalConsumptions}</span>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          {showConsumptionButton &&
            mediaItem.status !== MEDIA_STATUS.COMPLETED && (
              <Button
                variant={hasConsumedToday ? "default" : "outline"}
                size="sm"
                onClick={handleToggleConsumption}
                disabled={isToggling}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                {hasConsumedToday ? "Consumido Hoje" : "Marcar Consumo"}
              </Button>
            )}

          {mediaItem.status !== MEDIA_STATUS.COMPLETED && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickStatusChange(MEDIA_STATUS.COMPLETED)}
              className="text-green-600 hover:text-green-700"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}

          {mediaItem.status !== MEDIA_STATUS.DROPPED && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickStatusChange(MEDIA_STATUS.DROPPED)}
              className="text-red-600 hover:text-red-700"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaCard;
