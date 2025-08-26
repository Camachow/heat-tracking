import { clsx } from 'clsx';
import { format, parseISO, startOfDay, differenceInDays, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Combina classes CSS condicionalmente
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Formata uma data para string YYYY-MM-DD
 */
export function formatDateKey(date) {
  return format(startOfDay(date), 'yyyy-MM-dd');
}

/**
 * Converte string de data para objeto Date
 */
export function parseDateKey(dateKey) {
  return parseISO(dateKey);
}

/**
 * Formata data para exibição amigável
 */
export function formatDisplayDate(date) {
  if (isToday(date)) return 'Hoje';
  if (isYesterday(date)) return 'Ontem';
  
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Gera um ID único simples
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Calcula a sequência atual de dias consecutivos
 */
export function calculateCurrentStreak(entries, habitId) {
  const habitEntries = entries
    .filter(entry => entry.habitId === habitId && entry.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (habitEntries.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  
  // Verifica se completou hoje
  const todayKey = formatDateKey(currentDate);
  const hasToday = habitEntries.some(entry => entry.date === todayKey);
  
  if (!hasToday) {
    // Se não completou hoje, verifica ontem
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Conta dias consecutivos para trás
  for (let i = 0; i < habitEntries.length; i++) {
    const entryDate = formatDateKey(currentDate);
    const hasEntry = habitEntries.some(entry => entry.date === entryDate);
    
    if (hasEntry) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calcula estatísticas de um hábito
 */

const toDate = (v) => (v instanceof Date ? v : parseISO(String(v)));

export function calculateHabitStats(entries, habitId, habit) {
  const habitEntries = entries.filter(entry => entry.habitId === habitId);
  const completedEntries = habitEntries.filter(entry => entry.completed);
  
  const currentStreak = calculateCurrentStreak(entries, habitId);
  
  // Calcula a maior sequência
  let longestStreak = 0;
  let tempStreak = 0;
  
  const sortedEntries = habitEntries
    .sort((a, b) => new Date(a.date) - new Date(b.date));
    
  for (let i = 0; i < sortedEntries.length; i++) {
    if (sortedEntries[i].completed) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  // Taxa de completude desde a criação
  const daysSinceCreation = differenceInDays(new Date(), toDate(habit.createdAt)) + 1;
  const completionRate = daysSinceCreation > 0 
    ? Math.round((completedEntries.length / daysSinceCreation) * 100)
    : 0;

  return {
    currentStreak,
    longestStreak,
    completionRate,
    totalCompletions: completedEntries.length
  };
}

