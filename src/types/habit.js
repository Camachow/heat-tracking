// Tipos para a aplicação de hábitos

/**
 * @typedef {Object} Habit
 * @property {string} id - Identificador único do hábito
 * @property {string} name - Nome do hábito
 * @property {string} [description] - Descrição opcional do hábito
 * @property {string} category - Categoria do hábito
 * @property {string} color - Cor associada ao hábito (hex)
 * @property {Date} createdAt - Data de criação
 * @property {'daily'|'weekly'} targetFrequency - Frequência alvo
 */

/**
 * @typedef {Object} HabitEntry
 * @property {string} id - Identificador único da entrada
 * @property {string} habitId - ID do hábito relacionado
 * @property {string} date - Data no formato YYYY-MM-DD
 * @property {boolean} completed - Se foi completado
 * @property {string} [notes] - Notas opcionais
 */

/**
 * @typedef {Object} HabitStats
 * @property {number} currentStreak - Sequência atual de dias
 * @property {number} longestStreak - Maior sequência
 * @property {number} completionRate - Taxa de completude (0-100)
 * @property {number} totalCompletions - Total de completudes
 */

export const HABIT_CATEGORIES = [
  'Saúde',
  'Exercício',
  'Estudo',
  'Trabalho',
  'Mindfulness',
  'Hobbies',
  'Social',
  'Outros'
];

export const HABIT_COLORS = [
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Amarelo
  '#EF4444', // Vermelho
  '#8B5CF6', // Roxo
  '#F97316', // Laranja
  '#06B6D4', // Ciano
  '#84CC16', // Lima
  '#EC4899', // Rosa
  '#6B7280'  // Cinza
];

