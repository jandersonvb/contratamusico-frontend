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
import { Grid, List, Search, Loader2 } from "lucide-react";
import { SearchFilters } from "./components/SearchFilters";
import { MusicianCard } from "./components/MusicianCard";
import { useSearchStore } from "@/lib/stores/searchStore";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useInstrumentStore } from "@/lib/stores/instrumentStore";
import { useGenreStore } from "@/lib/stores/genreStore";

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
      <section className="bg-primary/5 border-b py-12">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h1 className="text-3xl font-bold">Encontre Músicos Incríveis</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Use nossos filtros para encontrar o músico perfeito para seu evento
          </p>
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto max-w-xl flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Buscar por nome, instrumento ou estilo..."
              value={filters.search}
              onChange={handleSearchInput}
              className="flex-1 rounded-md border px-4 py-2 focus:outline-none focus:ring ring-primary"
            />
            <Button type="submit" size="icon" variant="default" aria-label="Pesquisar">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </section>

      {/* Main content */}
      <section className="container mx-auto px-4 flex-1 py-8 flex flex-col lg:flex-row gap-8">
        <SearchFilters
          filters={filters}
          setFilters={handleFiltersChange}
          clearFilters={handleClearFilters}
        />
        <div className="flex-1 flex flex-col">
          {/* Results header and controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-semibold">Músicos Encontrados</h2>
              <span className="text-sm text-muted-foreground">
                {isLoading ? "Buscando..." : `${totalResults} músicos encontrados`}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={performSearch} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  "Aplicar Filtros"
                )}
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ordenar por:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-40">
                    {(() => {
                      switch (sortBy) {
                        case "rating":
                          return "Melhor Avaliação";
                        case "price-low":
                          return "Menor Preço";
                        case "price-high":
                          return "Maior Preço";
                        case "newest":
                          return "Mais Recentes";
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
              {/* View toggle */}
              <div className="flex gap-2">
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
          </div>

          {/* Active filters chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.city && (
              <Badge variant="secondary">Cidade: {filters.city}</Badge>
            )}
            {filters.state && filters.state !== "all" && (
              <Badge variant="secondary">Estado: {getStateName(filters.state)}</Badge>
            )}
            {filters.instruments.map((slug) => (
              <Badge key={slug} variant="secondary">
                {getInstrumentName(slug)}
              </Badge>
            ))}
            {filters.genres.map((slug) => (
              <Badge key={slug} variant="secondary">
                {getGenreName(slug)}
              </Badge>
            ))}
            {filters.priceMin && filters.priceMax && (
              <Badge variant="secondary">
                Faixa: R$ {filters.priceMin} - R$ {filters.priceMax}
              </Badge>
            )}
            {filters.priceMin && !filters.priceMax && (
              <Badge variant="secondary">A partir de R$ {filters.priceMin}</Badge>
            )}
            {filters.priceMax && !filters.priceMin && (
              <Badge variant="secondary">Até R$ {filters.priceMax}</Badge>
            )}
            {filters.rating && (
              <Badge variant="secondary">Nota: {filters.rating}+</Badge>
            )}
            {filters.date && (
              <Badge variant="secondary">Data: {filters.date}</Badge>
            )}
            {filters.availability.map((avail) => (
              <Badge key={avail} variant="secondary">
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
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && musicians.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum músico encontrado com os filtros selecionados.
              </p>
              <Button
                variant="link"
                onClick={handleClearFilters}
                className="mt-2"
              >
                Limpar filtros
              </Button>
            </div>
          )}

          {/* Results list */}
          {!isLoading && musicians.length > 0 && (
            <>
              {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {musicians.map((musician) => (
                    <MusicianCard key={musician.id} musician={musician} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
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
