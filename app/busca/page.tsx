"use client";

import { ChangeEvent, FormEvent, Suspense, useEffect, useMemo, useState } from "react";
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
import {
  Grid,
  List,
  Search,
  Loader2,
  AlertCircle,
  ChevronDown,
  X,
  MapPin,
  Tags,
  SlidersHorizontal,
} from "lucide-react";
import { SearchFilters } from "./components/SearchFilters";
import { MusicianCard } from "./components/MusicianCard";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useInstrumentStore } from "@/lib/stores/instrumentStore";
import { useGenreStore } from "@/lib/stores/genreStore";
import { MusicianCardSkeleton } from "./components/MusicianCardSkeleton";
import { useSearchController } from "./hooks/useSearchController";
import { DateFilterCalendar } from "./components/DateFilterCalendar";

const PRICE_PRESETS = [
  { value: "all", label: "Qualquer preco", min: "", max: "" },
  { value: "0-300", label: "Ate R$ 300", min: "0", max: "300" },
  { value: "300-500", label: "R$ 300 - R$ 500", min: "300", max: "500" },
  { value: "500-800", label: "R$ 500 - R$ 800", min: "500", max: "800" },
  { value: "800-1200", label: "R$ 800 - R$ 1.200", min: "800", max: "1200" },
  { value: "1200+", label: "R$ 1.200+", min: "1200", max: "" },
];

function SearchPageContent() {
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  const {
    filters,
    musicians,
    pagination,
    isLoading,
    error,
    sortBy,
    view,
    setView,
    updateFilters,
    clearAllFilters,
    applySearch,
    changeSort,
    changePage,
    activeFiltersCount,
  } = useSearchController();

  const { states, cities, isLoadingCities, fetchStates, fetchCities } = useLocationStore();
  const { instruments, fetchInstruments } = useInstrumentStore();
  const { genres, fetchGenres } = useGenreStore();

  useEffect(() => {
    fetchStates();
    fetchInstruments();
    fetchGenres();
  }, [fetchStates, fetchInstruments, fetchGenres]);

  useEffect(() => {
    if (filters.state && filters.state !== "all") {
      fetchCities(filters.state);
    }
  }, [filters.state, fetchCities]);

  useEffect(() => {
    if (!isAdvancedFiltersOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isAdvancedFiltersOpen]);

  const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    updateFilters({ search: e.target.value });
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    applySearch();
  };

  const pricePresetValue = useMemo(() => {
    const found = PRICE_PRESETS.find(
      (preset) =>
        preset.min === filters.priceMin &&
        preset.max === filters.priceMax
    );
    return found?.value || "all";
  }, [filters.priceMin, filters.priceMax]);

  const getInstrumentName = (slug: string) => {
    const instrument = instruments.find((i) => i.slug === slug);
    return instrument?.name || slug;
  };

  const getGenreName = (slug: string) => {
    const genre = genres.find((g) => g.slug === slug);
    return genre?.name || slug;
  };

  const getStateName = (sigla: string) => {
    const state = states.find((s) => s.sigla === sigla);
    return state?.nome || sigla;
  };

  const toggleGenre = (slug: string) => {
    const hasGenre = filters.genres.includes(slug);
    updateFilters({
      genres: hasGenre
        ? filters.genres.filter((item) => item !== slug)
        : [...filters.genres, slug],
    });
  };

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalResults = pagination?.total || 0;
  const highlightedGenres = genres;

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
                />
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

        <section className="container mx-auto px-4 flex-1 py-4 sm:py-8">
          <div className="sticky top-2 z-20 bg-background/95 backdrop-blur-sm border rounded-xl p-3 sm:p-4 mb-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="w-full sm:w-auto sm:min-w-[180px]">
                  <Select
                    value={filters.state || "all"}
                    onValueChange={(value) =>
                      updateFilters({ state: value === "all" ? "" : value, city: "" })
                    }
                  >
                    <SelectTrigger className="w-full text-sm">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {filters.state && filters.state !== "all"
                          ? getStateName(filters.state)
                          : "Estado"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os estados</SelectItem>
                      {states.map((state) => (
                        <SelectItem key={state.sigla} value={state.sigla}>
                          {state.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-auto sm:min-w-[180px]">
                  <Select
                    value={filters.city || "all"}
                    onValueChange={(value) =>
                      updateFilters({ city: value === "all" ? "" : value })
                    }
                    disabled={!filters.state || filters.state === "all"}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {isLoadingCities
                          ? "Carregando cidades..."
                          : filters.city || "Cidade"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as cidades</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.nome}>
                          {city.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-auto sm:min-w-[170px]">
                  <DateFilterCalendar
                    value={filters.date}
                    onChange={(date) => updateFilters({ date })}
                  />
                </div>

                <div className="w-full sm:w-auto sm:min-w-[190px]">
                  <Select
                    value={pricePresetValue}
                    onValueChange={(value) => {
                      const preset = PRICE_PRESETS.find((item) => item.value === value);
                      updateFilters({
                        priceMin: preset?.min ?? "",
                        priceMax: preset?.max ?? "",
                      });
                    }}
                  >
                    <SelectTrigger className="w-full text-sm">
                      {PRICE_PRESETS.find((item) => item.value === pricePresetValue)?.label || "Preco"}
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_PRESETS.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  onClick={applySearch}
                  disabled={isLoading}
                  className="sm:ml-auto"
                >
                  {isLoading ? "Atualizando..." : `Ver resultados (${totalResults})`}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  disabled={activeFiltersCount === 0}
                >
                  Limpar filtros
                </Button>
              </div>

              {highlightedGenres.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-xs sm:text-sm text-muted-foreground inline-flex items-center gap-1 shrink-0">
                    <Tags className="h-3.5 w-3.5" />
                    Estilos:
                  </span>
                  {highlightedGenres.map((genre) => {
                    const isActive = filters.genres.includes(genre.slug);
                    return (
                      <button
                        key={genre.slug}
                        type="button"
                        onClick={() => toggleGenre(genre.slug)}
                        className={`text-xs sm:text-sm rounded-full border px-3 py-1.5 whitespace-nowrap transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        {genre.name}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAdvancedFiltersOpen(true)}
                  className="h-8 px-2 text-xs sm:text-sm"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                  Filtros avancados
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
                {activeFiltersCount > 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {activeFiltersCount} filtros ativos
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold">Músicos Encontrados</h2>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {isLoading ? "Buscando..." : `${totalResults} músicos encontrados`}
                </span>
              </div>
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

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Ordenar:</span>
                <Select value={sortBy} onValueChange={changeSort}>
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

          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
            {filters.city && (
              <button type="button" onClick={() => updateFilters({ city: "" })}>
                <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                  Cidade: {filters.city} <X className="inline h-3 w-3 ml-1" />
                </Badge>
              </button>
            )}
            {filters.state && filters.state !== "all" && (
              <button type="button" onClick={() => updateFilters({ state: "", city: "" })}>
                <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                  Estado: {getStateName(filters.state)} <X className="inline h-3 w-3 ml-1" />
                </Badge>
              </button>
            )}
            {filters.instruments.map((slug) => (
              <button
                key={slug}
                type="button"
                onClick={() =>
                  updateFilters({
                    instruments: filters.instruments.filter((item) => item !== slug),
                  })
                }
              >
                <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                  {getInstrumentName(slug)} <X className="inline h-3 w-3 ml-1" />
                </Badge>
              </button>
            ))}
            {filters.genres.map((slug) => (
              <button
                key={slug}
                type="button"
                onClick={() =>
                  updateFilters({
                    genres: filters.genres.filter((item) => item !== slug),
                  })
                }
              >
                <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                  {getGenreName(slug)} <X className="inline h-3 w-3 ml-1" />
                </Badge>
              </button>
            ))}
            {filters.priceMin && filters.priceMax && (
              <button type="button" onClick={() => updateFilters({ priceMin: "", priceMax: "" })}>
                <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                  R$ {filters.priceMin} - R$ {filters.priceMax} <X className="inline h-3 w-3 ml-1" />
                </Badge>
              </button>
            )}
            {filters.priceMin && !filters.priceMax && (
              <button type="button" onClick={() => updateFilters({ priceMin: "", priceMax: "" })}>
                <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                  A partir de R$ {filters.priceMin} <X className="inline h-3 w-3 ml-1" />
                </Badge>
              </button>
            )}
            {filters.priceMax && !filters.priceMin && (
              <button type="button" onClick={() => updateFilters({ priceMin: "", priceMax: "" })}>
                <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                  Até R$ {filters.priceMax} <X className="inline h-3 w-3 ml-1" />
                </Badge>
              </button>
            )}
            {filters.rating && (
              <button type="button" onClick={() => updateFilters({ rating: "" })}>
                <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                  Nota: {filters.rating}+ <X className="inline h-3 w-3 ml-1" />
                </Badge>
              </button>
            )}
            {filters.date && (
              <button type="button" onClick={() => updateFilters({ date: "" })}>
                <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                  Data: {filters.date} <X className="inline h-3 w-3 ml-1" />
                </Badge>
              </button>
            )}
            {filters.availability.map((avail) => (
              <button
                key={avail}
                type="button"
                onClick={() =>
                  updateFilters({
                    availability: filters.availability.filter((item) => item !== avail),
                  })
                }
              >
                <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                  {avail === "weekends"
                    ? "Fins de semana"
                    : avail === "weekdays"
                      ? "Dias de semana"
                      : "Noites"}{" "}
                  <X className="inline h-3 w-3 ml-1" />
                </Badge>
              </button>
            ))}
          </div>

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
                onClick={applySearch}
                className="text-destructive border-destructive/30 hover:bg-destructive/10 w-full sm:w-auto"
              >
                Tentar novamente
              </Button>
            </div>
          )}

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
                onClick={clearAllFilters}
                className="transition-all duration-200 hover:scale-105"
              >
                Limpar filtros e ver todos
              </Button>
            </div>
          )}

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
                    <MusicianCard key={musician.id} musician={musician} view="list" />
                  ))}
                </div>
              )}
            </>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={changePage}
            />
          )}
        </section>

        {isAdvancedFiltersOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
              onClick={() => setIsAdvancedFiltersOpen(false)}
            />

            <div className="absolute inset-x-0 bottom-0 max-h-[86vh] rounded-t-2xl border bg-background shadow-2xl overflow-hidden sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[420px] sm:max-h-none sm:rounded-none sm:rounded-l-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div>
                  <p className="font-semibold">Filtros avancados</p>
                  <p className="text-xs text-muted-foreground">
                    {activeFiltersCount} selecionado(s)
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAdvancedFiltersOpen(false)}
                  aria-label="Fechar filtros"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="h-[calc(100%-64px)] overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] p-4 pb-6">
                <SearchFilters
                  filters={filters}
                  setFilters={updateFilters}
                  clearFilters={clearAllFilters}
                  mode="panel"
                />
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={clearAllFilters}
                  >
                    Limpar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setIsAdvancedFiltersOpen(false);
                      applySearch();
                    }}
                    disabled={isLoading}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SearchPageContent />
    </Suspense>
  );
}
