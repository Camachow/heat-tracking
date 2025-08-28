import React, { useEffect, useMemo, useRef, useState } from "react";
import CalHeatmap from "cal-heatmap";
import "cal-heatmap/cal-heatmap.css";
import {
  Check,
  Edit,
  Trash2,
  Calendar as CalIcon,
  Target,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useHabitStore from "@/stores/habitStore";
import { calculateHabitStats, formatDisplayDate } from "@/lib/utils";
import { toISODate, getEntryForDate } from "@/utils/date";
import {
  format,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const HabitCard = ({ habit, onEdit, showStats = true }) => {
  const { entriesByHabit, loadEntries, toggleEntry, deleteHabit } =
    useHabitStore();

  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---- Heatmap state/refs ----
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const calRef = useRef(null);
  const heatmapRef = useRef(null);

  const todayDate = new Date();
  const todayISO = toISODate(todayDate);

  const entries = entriesByHabit[habit.id] || [];

  // Carrega entradas do ano atual quando abrir/ano mudar
  useEffect(() => {
    if (!showHeatmap) return;
    const from = format(startOfYear(new Date(currentYear, 0, 1)), "yyyy-MM-dd");
    const to = format(endOfYear(new Date(currentYear, 11, 31)), "yyyy-MM-dd");
    loadEntries(habit.id, from, to);
  }, [showHeatmap, currentYear, habit.id, loadEntries]);

  // Hoje
  const todayEntry = useMemo(
    () => getEntryForDate(entries, todayISO),
    [entries, todayISO]
  );
  const isCompletedToday = todayEntry
    ? todayEntry.done === undefined
      ? true
      : !!todayEntry.done
    : false;

  const stats = showStats
    ? calculateHabitStats(entries, habit.id, habit)
    : null;

  const handleToggleToday = async () => {
    setIsToggling(true);
    try {
      await toggleEntry(habit.id, todayISO);
    } finally {
      setIsToggling(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteHabit(habit.id);
    } finally {
      setIsDeleting(false);
    }
  };

  // ---- Heatmap helpers ----
  const prepareHeatmapData = () => {
    // Só dias marcados no ano corrente
    return entries
      .filter(
        (e) =>
          (e.done ?? true) && parseISO(e.date).getFullYear() === currentYear
      )
      .map((e) => ({
        date: format(parseISO(e.date), "yyyy-MM-dd"),
        value: 1,
      }));
  };

  // Estatísticas do ano (com base no ano corrente)
  const yearStats = useMemo(() => {
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const yearEnd = endOfYear(new Date(currentYear, 11, 31));
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
    const doneThisYear = entries.filter(
      (e) => (e.done ?? true) && parseISO(e.date).getFullYear() === currentYear
    );
    const total = doneThisYear.length;
    const percentage = Math.round((total / allDays.length) * 100);
    return { total, percentage };
  }, [entries, currentYear]);

  const handlePrevYear = () => setCurrentYear((y) => y - 1);
  const handleNextYear = () =>
    setCurrentYear((y) => Math.min(y + 1, new Date().getFullYear()));
  const handleThisYear = () => setCurrentYear(new Date().getFullYear());

  // Pintar/repintar heatmap quando dados mudarem (com clique habilitado)
  useEffect(() => {
    if (!showHeatmap || !calRef.current) return;

    // destruir instância anterior
    if (heatmapRef.current) {
      heatmapRef.current.destroy();
      heatmapRef.current = null;
    }

    const data = prepareHeatmapData();
    const cal = new CalHeatmap();
    heatmapRef.current = cal;

    cal.paint({
      itemSelector: calRef.current,
      data: {
        source: data,
        type: "json",
        x: "date",
        y: "value",
      },
      date: {
        start: new Date(currentYear, 0, 1),
        max: new Date(currentYear, 11, 31),
      },
      range: 12,
      scale: {
        color: {
          type: "threshold",
          // 0 = vazio (muted), >=1 = cor do hábito
          range: ["#ebedf0", habit?.color || "#10B981"],
          domain: [1],
        },
      },
      domain: {
        type: "month",
        gutter: 4,
        label: { text: "MMM", textAlign: "start", position: "top" },
      },
      subDomain: {
        type: "ghDay",
        radius: 2,
        width: 11,
        height: 11,
        gutter: 2,
      },
      itemName: { singular: "dia", plural: "dias" },
      tooltip: {
        text: function (date, value) {
          const dateStr = format(date, "dd/MM/yyyy", { locale: ptBR });
          return `${dateStr}: ${value || 0} ${value === 1 ? "dia" : "dias"}`;
        },
      },
    });

    // ✅ Clique para alternar o dia (ignora datas futuras)
    cal.on("click", async (date /* Date */, value /* number */) => {
      if (date > new Date()) return;
      const iso = toISODate(date); // "YYYY-MM-DD"
      await toggleEntry(habit.id, iso); // atualiza store/backend
      // O efeito repinta o heatmap quando "entries" mudar
    });

    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.destroy();
        heatmapRef.current = null;
      }
    };
  }, [showHeatmap, entries, currentYear, habit?.color, toggleEntry, habit?.id]);

  const freq = habit.targetFrequency === "weekly" ? "Semanal" : "Diário";

  return (
    <Card className="relative overflow-hidden">
      {/* Barra colorida */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: habit.color }}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground mb-1 truncate">
              {habit.title ?? habit.name}
            </h3>

            {habit.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {habit.description}
              </p>
            )}

            <div className="flex items-center gap-2">
              {habit.category && (
                <Badge variant="secondary" className="text-xs">
                  {habit.category}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {freq}
              </Badge>
            </div>
          </div>

          {/* Ações: Editar + Excluir */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(habit)}
              aria-label="Editar hábito"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Excluir hábito"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Excluir “{habit.title ?? habit.name}”?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso removerá o hábito e seus registros no servidor. Não é
                    possível desfazer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Excluindo..." : "Excluir"}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Linha: Hoje + ações */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatDisplayDate(todayDate)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isCompletedToday ? "default" : "outline"}
              size="sm"
              onClick={handleToggleToday}
              disabled={isToggling}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {isCompletedToday ? "Concluído" : "Marcar"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHeatmap((s) => !s)}
              className="flex items-center gap-2"
            >
              <CalIcon className="h-4 w-4" />
              {showHeatmap ? "Ocultar Heatmap" : "Mostrar Heatmap"}
            </Button>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        {showStats && stats && (
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                {stats.currentStreak}
              </p>
              <p className="text-xs text-muted-foreground">Sequência</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                {stats.completionRate}%
              </p>
              <p className="text-xs text-muted-foreground">Taxa</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Check className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                {stats.totalCompletions}
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        )}

        {/* Heatmap dentro do card */}
        {showHeatmap && (
          <div className="mt-6">
            {/* Cabeçalho do heatmap: ano + navegação */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: habit.color || "#10B981" }}
                />
                <span className="text-sm font-medium text-foreground">
                  {habit.title ?? habit.name} — {currentYear}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevYear}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleThisYear}>
                  Hoje
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextYear}
                  disabled={currentYear >= new Date().getFullYear()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Estatísticas do ano */}
            <div className="flex items-center gap-6 mb-4 text-xs text-muted-foreground">
              <span>
                <strong className="text-foreground">{yearStats.total}</strong>{" "}
                dias completados
              </span>
              <span>
                <strong className="text-foreground">
                  {yearStats.percentage}%
                </strong>{" "}
                do ano
              </span>
            </div>

            {/* Container do heatmap */}
            <div
              ref={calRef}
              className="w-full overflow-x-auto"
              style={{ minHeight: 200 }}
            />

            {/* Legenda */}
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>Menos</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-muted" />
                <div
                  className="w-2 h-2 rounded-sm"
                  style={{
                    backgroundColor: habit.color || "#10B981",
                    opacity: 0.3,
                  }}
                />
                <div
                  className="w-2 h-2 rounded-sm"
                  style={{
                    backgroundColor: habit.color || "#10B981",
                    opacity: 0.6,
                  }}
                />
                <div
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: habit.color || "#10B981" }}
                />
              </div>
              <span>Mais</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HabitCard;
