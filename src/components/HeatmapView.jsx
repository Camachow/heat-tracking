import { useEffect, useMemo, useRef, useState } from "react";
import CalHeatmap from "cal-heatmap";
import "cal-heatmap/cal-heatmap.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import useHabitStore from "@/stores/habitStore";
import {
  format,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";

const HeatmapView = ({ habitId = null }) => {
  const { habits = [], entriesByHabit = {}, loadEntries } = useHabitStore();
  const [selectedHabit, setSelectedHabit] = useState(habitId);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const calRef = useRef(null);
  const heatmapRef = useRef(null);

  // quando prop mudar, refletir no estado interno
  useEffect(() => {
    setSelectedHabit(habitId);
  }, [habitId]);

  // hábito selecionado (sem getHabitById)
  const habit = useMemo(
    () =>
      selectedHabit ? habits.find((h) => h.id === selectedHabit) ?? null : null,
    [habits, selectedHabit]
  );

  // carregar entradas do ano atual para o hábito selecionado
  useEffect(() => {
    if (!selectedHabit) return;
    const from = format(startOfYear(new Date(currentYear, 0, 1)), "yyyy-MM-dd");
    const to = format(endOfYear(new Date(currentYear, 11, 31)), "yyyy-MM-dd");
    loadEntries(selectedHabit, from, to);
  }, [selectedHabit, currentYear, loadEntries]);

  // preparar dados para o heatmap
  const prepareHeatmapData = () => {
    if (!selectedHabit) return [];
    const list = entriesByHabit[selectedHabit] || [];
    // só dias "feitos" (done !== false) e do ano atual
    return list
      .filter(
        (e) =>
          (e.done ?? true) && parseISO(e.date).getFullYear() === currentYear
      )
      .map((e) => ({
        date: format(parseISO(e.date), "yyyy-MM-dd"),
        value: 1,
      }));
  };

  // inicializar / repintar heatmap
  useEffect(() => {
    if (!selectedHabit || !calRef.current) return;

    // destruir instância anterior
    if (heatmapRef.current) {
      heatmapRef.current.destroy();
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
      range: 12, // 12 meses
      scale: {
        color: {
          type: "threshold",
          range: ["#ebedf0", habit?.color || "#10B981"],
          domain: [1],
        },
      },
      domain: {
        type: "month",
        gutter: 4,
        label: {
          text: "MMM",
          textAlign: "start",
          position: "top",
        },
      },
      subDomain: {
        type: "ghDay", // mantém compatível com seu código
        radius: 2,
        width: 11,
        height: 11,
        gutter: 2,
      },
      itemName: {
        singular: "dia",
        plural: "dias",
      },
      tooltip: {
        text: function (date, value) {
          const dateStr = format(date, "dd/MM/yyyy", { locale: ptBR });
          return `${dateStr}: ${value || 0} ${value === 1 ? "dia" : "dias"}`;
        },
      },
    });

    return () => {
      if (heatmapRef.current) heatmapRef.current.destroy();
    };
  }, [selectedHabit, currentYear, entriesByHabit, habit]);

  // estatísticas do ano
  const calculateYearStats = () => {
    if (!selectedHabit) return { total: 0, percentage: 0 };

    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const yearEnd = endOfYear(new Date(currentYear, 11, 31));
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

    const list = entriesByHabit[selectedHabit] || [];
    const doneThisYear = list.filter(
      (e) => (e.done ?? true) && parseISO(e.date).getFullYear() === currentYear
    );

    const total = doneThisYear.length;
    const percentage = Math.round((total / allDays.length) * 100);
    return { total, percentage };
  };

  const yearStats = calculateYearStats();

  const handlePreviousYear = () => setCurrentYear((y) => y - 1);
  const handleNextYear = () => setCurrentYear((y) => y + 1);
  const handleCurrentYear = () => setCurrentYear(new Date().getFullYear());

  return (
    <div className="space-y-6">
      {/* Seletor de hábito */}
      {!habitId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Selecionar Hábito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {habits.map((h) => (
                <Badge
                  key={h.id}
                  variant={selectedHabit === h.id ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2"
                  style={{
                    backgroundColor:
                      selectedHabit === h.id
                        ? h.color || "#10B981"
                        : "transparent",
                    borderColor: h.color || "#10B981",
                    color:
                      selectedHabit === h.id ? "white" : h.color || "#10B981",
                  }}
                  onClick={() => setSelectedHabit(h.id)}
                >
                  {h.title ?? h.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Heatmap */}
      {selectedHabit && habit && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: habit.color || "#10B981" }}
                />
                {habit.title ?? habit.name} - {currentYear}
              </CardTitle>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousYear}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleCurrentYear}>
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
          </CardHeader>

          <CardContent>
            {/* Estatísticas do ano */}
            <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
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
              style={{ minHeight: "200px" }}
            />

            {/* Legenda */}
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
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
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {!selectedHabit && habits.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum hábito para visualizar
            </h3>
            <p className="text-muted-foreground">
              Crie alguns hábitos primeiro para ver o heatmap de progresso.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HeatmapView;
