# HabitFlow - Rastreador de Hábitos

Uma aplicação React moderna para rastreamento de hábitos pessoais com visualização em heatmap, permitindo aos usuários criar, monitorar e visualizar o progresso de suas atividades importantes ao longo do tempo.

## 🚀 Funcionalidades

### ✅ Gerenciamento de Hábitos

- **Criar hábitos** com nome, descrição, categoria e cor personalizada
- **Editar hábitos** existentes
- **Categorização** em: Saúde, Exercício, Estudo, Trabalho, Mindfulness, Hobbies, Social, Outros
- **Frequência alvo** configurável (diário ou semanal)
- **Cores personalizáveis** para identificação visual

### 📊 Tracking e Estatísticas

- **Check-in diário** com interface intuitiva
- **Cálculo automático de streaks** (sequências consecutivas)
- **Taxa de completude** baseada no histórico
- **Estatísticas detalhadas** por hábito
- **Dashboard geral** com visão consolidada

### 🔥 Visualização em Heatmap

- **Heatmap estilo GitHub** mostrando consistência ao longo do tempo
- **Navegação por anos** com controles intuitivos
- **Cores dinâmicas** baseadas na cor do hábito
- **Tooltips informativos** com detalhes por data
- **Seleção de hábitos** para visualização individual

### 💾 Persistência de Dados

- **Armazenamento local** automático no localStorage
- **Sincronização em tempo real** de todas as alterações
- **Backup automático** de hábitos e entradas
- **Recuperação de dados** após reload da página

### 🎨 Interface e UX

- **Design moderno** com Tailwind CSS
- **Tema responsivo** para desktop e mobile
- **Componentes reutilizáveis** com shadcn/ui
- **Ícones intuitivos** com Lucide React
- **Notificações** com react-hot-toast
- **Navegação fluida** entre seções

## 🛠️ Tecnologias Utilizadas

### Core

- **React 18** - Framework principal
- **JavaScript (JSX)** - Linguagem de programação
- **Vite** - Build tool moderna

### UI/UX

- **Tailwind CSS** - Framework de estilização
- **shadcn/ui** - Componentes UI profissionais
- **Lucide React** - Biblioteca de ícones
- **react-hot-toast** - Sistema de notificações

### Visualização de Dados

- **Cal-Heatmap** - Biblioteca para heatmap (similar ao GitHub)
- **date-fns** - Manipulação e formatação de datas

### Estado e Persistência

- **Zustand** - Gerenciamento de estado global
- **Zustand Persist** - Middleware para persistência
- **LocalStorage** - Armazenamento local dos dados

### Utilitários

- **clsx** - Utilitário para classes CSS condicionais

## 📱 Como Usar

### 1. Criando seu Primeiro Hábito

1. Clique em **"Novo Hábito"** no Dashboard ou sidebar
2. Preencha o **nome** do hábito (obrigatório)
3. Adicione uma **descrição** (opcional)
4. Selecione uma **categoria** apropriada
5. Escolha a **frequência alvo** (diário ou semanal)
6. Selecione uma **cor** para identificação visual
7. Clique em **"Salvar"**

### 2. Fazendo Check-in Diário

1. No **Dashboard** ou **Meus Hábitos**, localize seu hábito
2. Clique no botão **"Marcar"** para completar hoje
3. O botão mudará para **"Concluído"** e as estatísticas serão atualizadas
4. Clique novamente para **desmarcar** se necessário

### 3. Visualizando o Heatmap

1. Acesse a seção **"Calendário"**
2. Selecione o hábito desejado na lista
3. Visualize o heatmap anual com suas atividades
4. Use os controles **← Hoje →** para navegar entre anos
5. Passe o mouse sobre os quadrados para ver detalhes

### 4. Acompanhando Estatísticas

- **Sequência**: Dias consecutivos de completude
- **Taxa**: Porcentagem de completude desde a criação
- **Total**: Número total de dias completados
- **Dashboard**: Visão geral de todos os hábitos

## 🎯 Recursos Avançados

### Dashboard Inteligente

- Estatísticas consolidadas de todos os hábitos
- Indicadores de performance diária
- Contagem de sequências ativas
- Interface responsiva para diferentes dispositivos

### Heatmap Interativo

- Visualização similar ao GitHub Contributions
- Intensidade de cor baseada na atividade
- Navegação temporal intuitiva
- Tooltips com informações detalhadas

### Persistência Robusta

- Dados salvos automaticamente no navegador
- Recuperação completa após fechamento/abertura
- Sistema de backup transparente
- Sincronização em tempo real

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
src/
├── components/
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── HabitCard.jsx    # Cartão de hábito
│   ├── HeatmapView.jsx  # Visualização em heatmap
│   ├── HabitForm.jsx    # Formulário de hábito
│   └── Layout.jsx       # Layout principal
├── stores/
│   └── habitStore.js    # Store Zustand
├── types/
│   └── habit.js         # Tipos e constantes
├── lib/
│   └── utils.js         # Utilitários gerais
└── App.jsx              # Componente principal
```

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm run dev

# Build para produção
pnpm run build

# Preview da build
pnpm run preview
```

## 🌟 Próximas Funcionalidades

- 📤 **Exportação de dados** (JSON/CSV)
- ☁️ **Sincronização em nuvem**
- 🔔 **Lembretes e notificações**
- 🤖 **Análise de tendências com IA**
- 🏆 **Sistema de gamificação** (badges, níveis)
- 📈 **Gráficos avançados** com Recharts
- 🌙 **Modo escuro/claro**
- 📱 **PWA** (Progressive Web App)

## 📄 Licença

Este projeto foi desenvolvido como uma demonstração de aplicação React moderna para rastreamento de hábitos.

---

**HabitFlow** - Transforme seus objetivos em hábitos duradouros! 🚀

---

# Plano para Funcionalidade de Tracking de Mídias

## Visão Geral

Extender o HabitFlow para permitir o rastreamento de consumo de diferentes tipos de mídias (filmes, videogames, livros), incluindo a capacidade de marcar dias de consumo, indicar conclusão e classificar com estrelas.

## Modelo de Dados

### MediaItem (Item de Mídia)

Representa um filme, videogame ou livro que o usuário deseja rastrear.

```typescript
interface MediaItem {
  id: string; // ID único
  title: string; // Título da mídia
  type: "movie" | "game" | "book"; // Tipo de mídia
  category?: string; // Gênero ou categoria (ex: Ficção Científica, RPG)
  status: "watching" | "playing" | "reading" | "completed" | "dropped"; // Status atual
  rating?: number; // Classificação de 0 a 5 estrelas (opcional, após conclusão)
  startDate: Date; // Data de início do consumo
  endDate?: Date; // Data de conclusão (se status for 'completed')
  notes?: string; // Notas adicionais
  coverImage?: string; // URL da imagem de capa (opcional)
}
```

### MediaConsumption (Consumo de Mídia)

Representa um dia em que o usuário consumiu uma mídia específica.

```typescript
interface MediaConsumption {
  id: string; // ID único
  mediaItemId: string; // ID do item de mídia relacionado
  date: string; // Data do consumo (YYYY-MM-DD)
  duration?: number; // Duração do consumo em minutos (opcional)
  notes?: string; // Notas sobre o consumo naquele dia
}
```

## Funcionalidades

### 1. Gerenciamento de Itens de Mídia

- **Adicionar Novo Item**: Formulário para adicionar filmes, jogos ou livros com título, tipo, categoria, data de início.
- **Editar Item**: Modificar detalhes de um item existente.
- **Atualizar Status**: Mudar o status (assistindo/jogando/lendo, concluído, abandonado).
- **Classificar**: Adicionar classificação de 0 a 5 estrelas ao concluir um item.
- **Remover Item**: Excluir um item de mídia.

### 2. Tracking de Consumo Diário

- **Marcar Consumo**: Interface para registrar o consumo de um item em um dia específico.
- **Duração Opcional**: Campo para registrar a duração do consumo (ex: minutos de jogo, páginas lidas).

### 3. Visualização e Dashboard

- **Lista de Mídias**: Exibir todos os itens de mídia com seus status e classificações.
- **Detalhes do Item**: Página ou modal para ver o histórico de consumo de um item específico.
- **Heatmap de Consumo**: Um heatmap similar ao de hábitos, mostrando os dias de consumo de mídias (geral ou por tipo/item).
- **Estatísticas**: Total de itens concluídos, média de classificação, etc.

## Atualizações Necessárias

### Store (Zustand)

- Adicionar `mediaItems` e `mediaConsumptions` ao estado.
- Adicionar ações para `addMediaItem`, `updateMediaItem`, `deleteMediaItem`.
- Adicionar ações para `addMediaConsumption`, `updateMediaConsumption`, `deleteMediaConsumption`.

### Componentes UI

- Novo formulário `MediaForm.jsx` para adicionar/editar itens de mídia.
- Novo componente `MediaCard.jsx` para exibir itens de mídia.
- Nova seção `MediaTracking.jsx` para listar mídias e gerenciar consumos.
- Atualizar `Layout.jsx` para incluir a nova navegação para Mídias.
- Adaptar `HeatmapView.jsx` para poder exibir heatmaps de consumo de mídias.

### Utilitários

- Funções auxiliares para manipulação de dados de mídia e cálculo de estatísticas.

## Fluxo de Usuário

1. Usuário navega para a nova seção
