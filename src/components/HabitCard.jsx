import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Edit,
  Trash2,
  Calendar,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useHabitStore from "@/stores/habitStore";
import { calculateHabitStats, formatDisplayDate } from "@/lib/utils";
import { toISODate, getEntryForDate } from "@/utils/date"; // ← util novo

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
  const {
    entriesByHabit, // ← em vez de "entries"
    loadEntries, // ← para garantir dados
    toggleEntry, // ← em vez de "toggleHabitEntry"
    deleteHabit,
  } = useHabitStore();

  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const todayDate = new Date();
  const todayISO = toISODate(todayDate);

  const entries = entriesByHabit[habit.id] || [];

  useEffect(() => {
    if (!entries.length) loadEntries(habit.id);
  }, [habit.id]); // carregamento leve por cartão

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

  const freq = habit.targetFrequency === "weekly" ? "Semanal" : "Diário"; // fallback simples

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
        {/* Botão de completar hoje */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatDisplayDate(todayDate)}
            </span>
          </div>

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
        </div>

        {/* Estatísticas */}
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
      </CardContent>
    </Card>
  );
};

export default HabitCard;
