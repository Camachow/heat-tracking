import React, { useEffect, useState, useMemo } from "react";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import HabitCard from "./components/HabitCard";
import HabitForm from "./components/HabitForm";
import HeatmapView from "./components/HeatmapView";
import MediaTracking from "./components/MediaTracking";
import useHabitStore from "./stores/habitStore";
import useMediaStore from "./stores/mediaStore"; // ← NOVO: store de mídia
import { Button } from "@/components/ui/button";
// import { formatDateKey } from "@/lib/utils";                // ← removido (usaremos toISODate)
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Target, TrendingUp, Calendar, Award } from "lucide-react";
import "./App.css";
import { toISODate } from "@/utils/date"; // ← util de data ISO

function App() {
  const { habits = [], entriesByHabit = {}, loadHabits } = useHabitStore(); // ← entriesByHabit
  const { loadMedia } = useMediaStore(); // ← mídias

  const [currentView, setCurrentView] = useState("dashboard");
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Carrega listas iniciais
  useEffect(() => {
    loadHabits?.();
    loadMedia?.();
  }, []);

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === "add-habit") {
      setShowHabitForm(true);
      setEditingHabit(null);
    }
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setShowHabitForm(true);
  };

  const handleCloseForm = () => {
    setShowHabitForm(false);
    setEditingHabit(null);
  };

  const handleFormSuccess = () => {
    setCurrentView("habits");
  };

  // -------- Estatísticas gerais (adaptadas ao entriesByHabit) --------
  const todayISO = toISODate(new Date());

  // Se há uma entrada com date === hoje (e done !== false), conta como concluído
  const isHabitDoneToday = (habitId) => {
    const list = entriesByHabit[habitId] || [];
    return list.some((e) => e.date === todayISO && (e.done ?? true));
  };

  const totalHabits = habits.length;
  const completedToday = useMemo(
    () => habits.filter((h) => isHabitDoneToday(h.id)).length,
    [habits, entriesByHabit, todayISO]
  );
  const completionRate =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // “Sequências ativas” (simplificado): hábitos que possuem ao menos 1 entrada
  const activeStreaksCount = useMemo(
    () => habits.filter((h) => (entriesByHabit[h.id] || []).length > 0).length,
    [habits, entriesByHabit]
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <Button onClick={() => setCurrentView("add-habit")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Hábito
        </Button>
      </div>

      {/* Estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Hábitos
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalHabits}
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Concluídos Hoje
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {completedToday}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Taxa de Hoje
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {completionRate}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sequências Ativas
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {activeStreaksCount}
                </p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hábitos recentes */}
      {habits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Seus Hábitos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.slice(0, 6).map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onEdit={handleEditHabit}
                showStats={true}
              />
            ))}
          </div>
          {habits.length > 6 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => setCurrentView("habits")}
              >
                Ver Todos os Hábitos
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Estado vazio */}
      {habits.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum hábito ainda
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro hábito para começar a acompanhar seu
              progresso.
            </p>
            <Button onClick={() => setCurrentView("add-habit")}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Hábito
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderHabits = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Meus Hábitos</h2>
        <Button onClick={() => setCurrentView("add-habit")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Hábito
        </Button>
      </div>

      {habits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={handleEditHabit}
              showStats={true}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum hábito criado
            </h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro hábito para começar a acompanhar seu progresso.
            </p>
            <Button onClick={() => setCurrentView("add-habit")}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Hábito
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCalendar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Calendário</h2>
        <Button onClick={() => setCurrentView("add-habit")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Hábito
        </Button>
      </div>
      <HeatmapView />
    </div>
  );

  const renderMedia = () => <MediaTracking />;

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return renderDashboard();
      case "habits":
        return renderHabits();
      case "media":
        return renderMedia();
      case "calendar":
        return renderCalendar();
      default:
        return renderDashboard();
    }
  };

  return (
    <>
      <Layout currentView={currentView} onViewChange={handleViewChange}>
        {renderContent()}
      </Layout>

      {showHabitForm && (
        <HabitForm
          habit={editingHabit}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "hsl(var(--card))",
            color: "hsl(var(--card-foreground))",
            border: "1px solid hsl(var(--border))",
          },
        }}
      />
    </>
  );
}

export default App;
