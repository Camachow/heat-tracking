// src/components/HabitForm.jsx
import React, { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HABIT_CATEGORIES, HABIT_COLORS } from "@/types/habit";
import useHabitStore from "@/stores/habitStore";
import toast from "react-hot-toast";

const HabitForm = ({ habit = null, onClose, onSuccess }) => {
  // ⬇️ use os nomes da store nova
  const { createHabit, updateHabit } = useHabitStore();
  const isEditing = !!habit;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Outros",
    color: HABIT_COLORS[0],
    targetFrequency: "daily", // 'daily' | 'weekly'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name ?? habit.title ?? "",
        description: habit.description ?? "",
        category: habit.category || "Outros",
        color: habit.color || HABIT_COLORS[0],
        targetFrequency: habit.targetFrequency || "daily",
      });
    }
  }, [habit]);

  // Mapeia dados do form → payload do backend
  const toBackendPayload = (data) => {
    const payload = {
      title: data.name.trim(), // <— backend espera 'title'
      category: data.category || undefined,
      color: data.color || undefined,
      // Se você adicionou esses campos no backend, eles persistem:
      description: data.description?.trim() || undefined,
      targetFrequency: data.targetFrequency, // 'daily' | 'weekly'
    };

    // Remova chaves vazias/undefined
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "" || payload[k] === undefined) delete payload[k];
    });
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nome do hábito é obrigatório");
      return;
    }

    setIsSubmitting(true);
    const payload = toBackendPayload(formData);

    try {
      if (isEditing) {
        await updateHabit(habit.id, payload);
        toast.success("Hábito atualizado com sucesso!");
      } else {
        await createHabit(payload);
        toast.success("Hábito criado com sucesso!");
      }
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar hábito");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{isEditing ? "Editar Hábito" : "Novo Hábito"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Hábito *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: Exercitar-se, Ler, Meditar..."
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Descreva seu hábito..."
                rows={3}
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <div className="flex flex-wrap gap-2">
                {HABIT_CATEGORIES.map((category) => (
                  <Badge
                    key={category}
                    variant={
                      formData.category === category ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => handleInputChange("category", category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Frequência */}
            <div className="space-y-2">
              <Label>Frequência Alvo</Label>
              <div className="flex gap-2">
                <Badge
                  variant={
                    formData.targetFrequency === "daily" ? "default" : "outline"
                  }
                  className="cursor-pointer flex-1 justify-center py-2"
                  onClick={() => handleInputChange("targetFrequency", "daily")}
                >
                  Diário
                </Badge>
                <Badge
                  variant={
                    formData.targetFrequency === "weekly"
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer flex-1 justify-center py-2"
                  onClick={() => handleInputChange("targetFrequency", "weekly")}
                >
                  Semanal
                </Badge>
              </div>
            </div>

            {/* Cor */}
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {HABIT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color
                        ? "border-foreground scale-110"
                        : "border-border hover:scale-105"
                    } transition-transform`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleInputChange("color", color)}
                    aria-label={`Selecionar cor ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitForm;
