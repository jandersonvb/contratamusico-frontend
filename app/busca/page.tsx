"use client";

import { useEffect, useCallback } from "react";
import { SEO } from "../components/SEO/SEO";
import { Pagination } from "./components/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Grid, List, Search, Loader2, AlertCircle } from "lucide-react";
import { SearchFilters } from "./components/SearchFilters";
import { MusicianCard } from "./components/MusicianCard";
import { useSearchStore } from "@/lib/stores/searchStore";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useInstrumentStore } from "@/lib/stores/instrumentStore";
import { useGenreStore } from "@/lib/stores/genreStore";
import { MusicianCardSkeleton } from "./components/MusicianCardSkeleton";

export default function SearchPage() {
  // Search Store
  const {
    filters,
    setFilters,
    clearFilters,
    musicians,
    pagination,
    isLoading,
    error,
    sortBy,
    setSortBy,
    view,
    setView,
    search,
  } = useSearchStore();

  // Stores para labels dos badges
  const { states } = useLocationStore();
  const { instruments } = useInstrumentStore();
  const { genres } = useGenreStore();

  // Busca inicial e quando filtros mudam
  const performSearch = useCallback(() => {
    search();
  }, [search]);

  // Busca inicial ao montar o componente
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Handler para mudança de filtros (com debounce implícito ao clicar em "Buscar")
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  // Handler para limpar filtros
  const handleClearFilters = () => {
    clearFilters();
    // Busca novamente após limpar
    setTimeout(() => search(), 0);
  };

  // Handler para busca textual
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  // Handler para submit da busca
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  // Handler para mudança de ordenação
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setTimeout(() => search(), 0);
  };

  // Handler para mudança de página
  const handlePageChange = (page: number) => {
    useSearchStore.setState((state) => ({
      pagination: state.pagination ? { ...state.pagination, page } : null,
    }));
    setTimeout(() => search(), 0);
  };

  // Helper para obter o nome do instrumento pelo slug
  const getInstrumentName = (slug: string) => {
    const instrument = instruments.find((i) => i.slug === slug);
    return instrument?.name || slug;
  };

  // Helper para obter o nome do gênero pelo slug
  const getGenreName = (slug: string) => {
    const genre = genres.find((g) => g.slug === slug);
    return genre?.name || slug;
  };

  // Helper para obter o nome do estado pela sigla
  const getStateName = (sigla: string) => {
    const state = states.find((s) => s.sigla === sigla);
    return state?.nome || sigla;
  };

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalResults = pagination?.total || 0;

  return (
    <>
      <SEO
        title="Buscar Músicos"
        description="Encontre os melhores músicos profissionais para seu evento. Filtre por instrumento, estilo musical, localização e mais. Contrate de forma fácil e segura."
        keywords={[
          "buscar músico",
          "encontrar banda",
          "contratar DJ",
          "músicos disponíveis",
          "busca de músicos",
        ]}
      />
      <div className="min-h-screen flex flex-col">
        {/* Hero search header */}
      <section className="bg-primary/5 border-b py-6 sm:py-12">
        <div className="container mx-auto px-4 text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Encontre Músicos Incríveis</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Use nossos filtros para encontrar o músico perfeito para seu evento
          </p>
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto max-w-xl flex items-center gap-2"
            role="search"
            aria-label="Buscar músicos"
          >
            <div className="flex-1 relative">
              <Label htmlFor="search-musicians" className="sr-only">
                Buscar por nome, instrumento ou estilo
              </Label>
              <input
                id="search-musicians"
                type="text"
                placeholder="Buscar músicos..."
                value={filters.search}
                onChange={handleSearchInput}
                className="w-full rounded-md border px-3 sm:px-4 py-2 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-describedby={filters.search ? "search-hint" : undefined}
              />
              {filters.search && (
                <span id="search-hint" className="sr-only">
                  Pressione Enter ou clique em Pesquisar para buscar
                </span>
              )}
            </div>
            <Button 
              type="submit" 
              size="icon" 
              variant="default" 
              aria-label="Pesquisar"
              disabled={isLoading}
              className="transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </form>
        </div>
      </section>

      {/* Main content */}
      <section className="container mx-auto px-4 flex-1 py-4 sm:py-8 flex flex-col lg:flex-row gap-4 sm:gap-8">
        <SearchFilters
          filters={filters}
          setFilters={handleFiltersChange}
          clearFilters={handleClearFilters}
        />
        <div className="flex-1 flex flex-col">
          {/* Results header and controls */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4">
            {/* Title and count */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold">Músicos Encontrados</h2>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {isLoading ? "Buscando..." : `${totalResults} músicos encontrados`}
                </span>
              </div>
              {/* Desktop-only view toggle */}
              <div className="hidden sm:flex gap-2">
                <Button
                  variant={view === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setView("grid")}
                  aria-label="Ver em grid"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setView("list")}
                  aria-label="Ver em lista"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Controls row - stacked on mobile */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
              <Button 
                onClick={performSearch} 
                disabled={isLoading} 
                className="w-full sm:w-auto"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  "Aplicar Filtros"
                )}
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Ordenar:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="flex-1 sm:w-40 text-sm">
                    {(() => {
                      switch (sortBy) {
                        case "rating":
                          return "Avaliação";
                        case "price-low":
                          return "Menor Preço";
                        case "price-high":
                          return "Maior Preço";
                        case "newest":
                          return "Recentes";
                        default:
                          return "Relevância";
                      }
                    })()}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Melhor Avaliação</SelectItem>
                    <SelectItem value="price-low">Menor Preço</SelectItem>
                    <SelectItem value="price-high">Maior Preço</SelectItem>
                    <SelectItem value="newest">Mais Recentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Active filters chips */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
            {filters.city && (
              <Badge variant="secondary" className="text-xs">Cidade: {filters.city}</Badge>
            )}
            {filters.state && filters.state !== "all" && (
              <Badge variant="secondary" className="text-xs">Estado: {getStateName(filters.state)}</Badge>
            )}
            {filters.instruments.map((slug) => (
              <Badge key={slug} variant="secondary" className="text-xs">
                {getInstrumentName(slug)}
              </Badge>
            ))}
            {filters.genres.map((slug) => (
              <Badge key={slug} variant="secondary" className="text-xs">
                {getGenreName(slug)}
              </Badge>
            ))}
            {filters.priceMin && filters.priceMax && (
              <Badge variant="secondary" className="text-xs">
                R$ {filters.priceMin} - R$ {filters.priceMax}
              </Badge>
            )}
            {filters.priceMin && !filters.priceMax && (
              <Badge variant="secondary" className="text-xs">A partir de R$ {filters.priceMin}</Badge>
            )}
            {filters.priceMax && !filters.priceMin && (
              <Badge variant="secondary" className="text-xs">Até R$ {filters.priceMax}</Badge>
            )}
            {filters.rating && (
              <Badge variant="secondary" className="text-xs">Nota: {filters.rating}+</Badge>
            )}
            {filters.date && (
              <Badge variant="secondary" className="text-xs">Data: {filters.date}</Badge>
            )}
            {filters.availability.map((avail) => (
              <Badge key={avail} variant="secondary" className="text-xs">
                {avail === "weekends"
                  ? "Fins de semana"
                  : avail === "weekdays"
                  ? "Dias de semana"
                  : "Noites"}
              </Badge>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div 
              className="bg-destructive/10 text-destructive px-3 sm:px-4 py-3 rounded-lg mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 border border-destructive/20"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-center gap-2 flex-1">
                <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base">Erro ao buscar músicos</p>
                  <p className="text-xs sm:text-sm opacity-90 truncate">{error}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={performSearch}
                className="text-destructive border-destructive/30 hover:bg-destructive/10 w-full sm:w-auto"
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Loading state - Skeleton */}
          {isLoading && (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
              aria-busy="true"
              aria-label="Carregando músicos"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <MusicianCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && musicians.length === 0 && (
            <div className="text-center py-10 sm:py-16 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhum músico encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                Não encontramos músicos com os filtros selecionados. Tente ajustar sua busca ou limpar os filtros.
              </p>
              <Button
                variant="default"
                size="sm"
                onClick={handleClearFilters}
                className="transition-all duration-200 hover:scale-105"
              >
                Limpar filtros e ver todos
              </Button>
            </div>
          )}

          {/* Results list */}
          {!isLoading && musicians.length > 0 && (
            <>
              {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {musicians.map((musician) => (
                    <MusicianCard key={musician.id} musician={musician} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:gap-4">
                  {musicians.map((musician) => (
                    <MusicianCard
                      key={musician.id}
                      musician={musician}
                      view="list"
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </section>
      </div>
    </>
  );
}
