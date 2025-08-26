import React, { useState, useMemo, useEffect } from "react";
import { Plus, Filter, Search, Film, Gamepad2, Book, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import MediaForm from "./MediaForm";
import MediaCard from "./MediaCard";
import useMediaStore from "../stores/mediaStore"; // ← store correta
import {
  MEDIA_TYPES,
  MEDIA_STATUS,
  MEDIA_TYPE_LABELS,
  MEDIA_STATUS_LABELS,
} from "../types/media";
import { toast } from "react-hot-toast";

const MediaTracking = () => {
  const { mediaItems = [], deleteMedia, loadMedia } = useMediaStore(); // ← métodos corretos

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Buscar no backend quando filtros/aba/pesquisa mudarem
  useEffect(() => {
    const type =
      activeTab !== "all"
        ? activeTab
        : filterType !== "all"
        ? filterType
        : undefined;

    const status = filterStatus !== "all" ? filterStatus : undefined;
    const search = searchTerm || undefined;

    loadMedia({ type, status, search });
  }, [activeTab, filterType, filterStatus, searchTerm, loadMedia]);

  // Ordenar por criação (backend já filtra)
  const filteredItems = useMemo(() => {
    return [...mediaItems].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [mediaItems]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = mediaItems.length;
    const completed = mediaItems.filter(
      (item) => item.status === MEDIA_STATUS.COMPLETED
    ).length;
    const inProgress = mediaItems.filter((item) =>
      [
        MEDIA_STATUS.WATCHING,
        MEDIA_STATUS.PLAYING,
        MEDIA_STATUS.READING,
      ].includes(item.status)
    ).length;
    const dropped = mediaItems.filter(
      (item) => item.status === MEDIA_STATUS.DROPPED
    ).length;

    const ratedItems = mediaItems.filter((item) => item.rating > 0);
    const averageRating =
      ratedItems.length > 0
        ? (
            ratedItems.reduce((sum, item) => sum + item.rating, 0) /
            ratedItems.length
          ).toFixed(1)
        : 0;

    return { total, completed, inProgress, dropped, averageRating };
  }, [mediaItems]);

  const handleAddNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Tem certeza que deseja excluir "${item.title}"?`)) {
      try {
        await deleteMedia(item.id); // ← nome correto
        toast.success("Item de mídia excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir item:", error);
        toast.error("Erro ao excluir item de mídia");
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const getTabIcon = (type) => {
    switch (type) {
      case MEDIA_TYPES.MOVIE:
        return <Film className="w-4 h-4" />;
      case MEDIA_TYPES.GAME:
        return <Gamepad2 className="w-4 h-4" />;
      case MEDIA_TYPES.BOOK:
        return <Book className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rastreamento de Mídias</h1>
          <p className="text-gray-600">Acompanhe seus filmes, jogos e livros</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Mídia
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.total}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.inProgress}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  Em Progresso
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  Concluídos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {stats.dropped}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  Abandonados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageRating}
              </div>
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
            <div className="text-sm text-gray-600">Média</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Pesquisar por título ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(MEDIA_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center gap-2">
                  {getTabIcon(value)}
                  {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(MEDIA_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs por tipo de mídia */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value={MEDIA_TYPES.MOVIE}>
            <div className="flex items-center gap-2">
              {getTabIcon(MEDIA_TYPES.MOVIE)}
              Filmes
            </div>
          </TabsTrigger>
          <TabsTrigger value={MEDIA_TYPES.GAME}>
            <div className="flex items-center gap-2">
              {getTabIcon(MEDIA_TYPES.GAME)}
              Jogos
            </div>
          </TabsTrigger>
          <TabsTrigger value={MEDIA_TYPES.BOOK}>
            <div className="flex items-center gap-2">
              {getTabIcon(MEDIA_TYPES.BOOK)}
              Livros
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Lista de itens */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {searchTerm ||
                filterType !== "all" ||
                filterStatus !== "all" ? (
                  <div>
                    <Filter className="w-12 h-12 mx-auto mb-2" />
                    <p>Nenhum item encontrado com os filtros aplicados</p>
                  </div>
                ) : (
                  <div>
                    <Film className="w-12 h-12 mx-auto mb-2" />
                    <p>Nenhuma mídia adicionada ainda</p>
                    <p className="text-sm">
                      Clique em "Nova Mídia" para começar
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <MediaCard
                  key={item.id}
                  mediaItem={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal do formulário */}
      {showForm && (
        <MediaForm
          mediaItem={editingItem}
          onClose={handleCloseForm}
          onSave={() => {
            // recarrega a lista com os filtros atuais
            const type =
              activeTab !== "all"
                ? activeTab
                : filterType !== "all"
                ? filterType
                : undefined;
            const status = filterStatus !== "all" ? filterStatus : undefined;
            const search = searchTerm || undefined;
            loadMedia({ type, status, search });
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

export default MediaTracking;
