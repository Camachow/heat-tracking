import React from "react";
import useHabitStore from "../stores/habitStore";
import HabitCard from "./HabitCard";

export default function HabitList() {
  const { habits, loadHabits, loading, error } = useHabitStore();

  React.useEffect(() => {
    loadHabits();
  }, []);

  if (loading) return <div>Carregando…</div>;
  if (error) return <div className="text-red-500">Erro: {error}</div>;

  return (
    <div className="grid gap-3">
      {(habits || []).map((h) => (
        <HabitCard key={h.id} habit={h} />
      ))}
      {(!habits || habits.length === 0) && (
        <div className="text-sm text-muted-foreground">
          Nenhum hábito criado.
        </div>
      )}
    </div>
  );
}
