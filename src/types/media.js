// Tipos de mídia disponíveis
export const MEDIA_TYPES = {
  MOVIE: 'movie',
  GAME: 'game',
  BOOK: 'book'
};

// Status possíveis para itens de mídia
export const MEDIA_STATUS = {
  WATCHING: 'watching',
  PLAYING: 'playing',
  READING: 'reading',
  COMPLETED: 'completed',
  DROPPED: 'dropped'
};

// Categorias por tipo de mídia
export const MEDIA_CATEGORIES = {
  [MEDIA_TYPES.MOVIE]: [
    'Ação',
    'Aventura',
    'Comédia',
    'Drama',
    'Ficção Científica',
    'Terror',
    'Romance',
    'Thriller',
    'Documentário',
    'Animação',
    'Fantasia',
    'Crime',
    'Mistério',
    'Guerra',
    'Musical',
    'Biografia',
    'História',
    'Família',
    'Esporte',
    'Western'
  ],
  [MEDIA_TYPES.GAME]: [
    'Ação',
    'Aventura',
    'RPG',
    'Estratégia',
    'Simulação',
    'Esporte',
    'Corrida',
    'Luta',
    'Plataforma',
    'Puzzle',
    'Tiro',
    'MMORPG',
    'Indie',
    'Casual',
    'Survival',
    'Battle Royale',
    'MOBA',
    'RTS',
    'Turn-based',
    'Roguelike'
  ],
  [MEDIA_TYPES.BOOK]: [
    'Ficção',
    'Não-ficção',
    'Romance',
    'Mistério',
    'Thriller',
    'Ficção Científica',
    'Fantasia',
    'Terror',
    'Biografia',
    'História',
    'Autoajuda',
    'Negócios',
    'Ciência',
    'Filosofia',
    'Religião',
    'Poesia',
    'Drama',
    'Aventura',
    'Jovem Adulto',
    'Infantil'
  ]
};

// Labels para exibição dos tipos
export const MEDIA_TYPE_LABELS = {
  [MEDIA_TYPES.MOVIE]: 'Filme',
  [MEDIA_TYPES.GAME]: 'Videogame',
  [MEDIA_TYPES.BOOK]: 'Livro'
};

// Labels para exibição dos status
export const MEDIA_STATUS_LABELS = {
  [MEDIA_STATUS.WATCHING]: 'Assistindo',
  [MEDIA_STATUS.PLAYING]: 'Jogando',
  [MEDIA_STATUS.READING]: 'Lendo',
  [MEDIA_STATUS.COMPLETED]: 'Concluído',
  [MEDIA_STATUS.DROPPED]: 'Abandonado'
};

// Função para obter o status apropriado baseado no tipo de mídia
export const getStatusForMediaType = (mediaType) => {
  switch (mediaType) {
    case MEDIA_TYPES.MOVIE:
      return MEDIA_STATUS.WATCHING;
    case MEDIA_TYPES.GAME:
      return MEDIA_STATUS.PLAYING;
    case MEDIA_TYPES.BOOK:
      return MEDIA_STATUS.READING;
    default:
      return MEDIA_STATUS.WATCHING;
  }
};

// Função para obter todos os status possíveis para um tipo de mídia
export const getAvailableStatusForMediaType = (mediaType) => {
  const baseStatus = [MEDIA_STATUS.COMPLETED, MEDIA_STATUS.DROPPED];
  
  switch (mediaType) {
    case MEDIA_TYPES.MOVIE:
      return [MEDIA_STATUS.WATCHING, ...baseStatus];
    case MEDIA_TYPES.GAME:
      return [MEDIA_STATUS.PLAYING, ...baseStatus];
    case MEDIA_TYPES.BOOK:
      return [MEDIA_STATUS.READING, ...baseStatus];
    default:
      return [MEDIA_STATUS.WATCHING, ...baseStatus];
  }
};

// Função para validar classificação (0-5 estrelas)
export const isValidRating = (rating) => {
  return rating >= 0 && rating <= 5 && Number.isInteger(rating);
};

// Função para gerar ID único
export const generateMediaId = () => {
  return `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Função para gerar ID único para consumo
export const generateConsumptionId = () => {
  return `consumption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

