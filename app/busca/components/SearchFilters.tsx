"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Calendar as CalendarIcon,
  Check,
  DollarSign,
  Filter,
  Guitar,
  Music,
  Star,
  X,
} from "lucide-react";
import { useInstrumentStore } from "@/lib/stores/instrumentStore";
import { useGenreStore } from "@/lib/stores/genreStore";
import { SearchFilters as SearchFiltersType } from "@/lib/types/search";
import { cn } from "@/lib/utils";
import { countActiveFilters } from "@/lib/search/filters";

interface SearchFiltersProps {
  filters: SearchFiltersType;
  setFilters: (filters: Partial<SearchFiltersType>) => void;
  clearFilters: () => void;
  mode?: "sidebar" | "panel";
  className?: string;
}

/**
 * Renders the filters sidebar for the search page. Groups are displayed
 * inside an accordion to allow users to collapse sections. Each filter
 * uses shadcn/ui components for consistent styling. State management is
 * delegated to the parent page via the `filters` and `setFilters` props.
 */
export function SearchFilters({
  filters,
  setFilters,
  clearFilters,
  mode = "sidebar",
  className,
}: SearchFiltersProps) {
  const isPanel = mode === "panel";
  const isClientSearch = filters.userType === "client";
  const [instrumentQuery, setInstrumentQuery] = useState("");
  const [genreQuery, setGenreQuery] = useState("");

  // Stores
  const { instruments, isLoading: isLoadingInstruments, fetchInstruments } = useInstrumentStore();
  const { genres, isLoading: isLoadingGenres, fetchGenres } = useGenreStore();

  // Carrega dados iniciais
  useEffect(() => {
    fetchInstruments();
    fetchGenres();
  }, [fetchInstruments, fetchGenres]);

  // Helper to toggle a value inside an array filter (instruments, genres, availability)
  const toggleArrayValue = (key: keyof SearchFiltersType, value: string) => {
    const currentArray = filters[key] as string[];
    setFilters({
      ...filters,
      [key]: currentArray.includes(value)
        ? currentArray.filter((v) => v !== value)
        : [...currentArray, value],
    });
  };

  const hasPricePreset = (min: string, max: string) =>
    filters.priceMin === min && filters.priceMax === max;

  const activeFiltersCount = useMemo(() => countActiveFilters(filters), [filters]);

  const filteredInstruments = useMemo(() => {
    const query = instrumentQuery.trim().toLowerCase();
    if (!query) return instruments;
    return instruments.filter((instrument) =>
      instrument.name.toLowerCase().includes(query)
    );
  }, [instruments, instrumentQuery]);

  const filteredGenres = useMemo(() => {
    const query = genreQuery.trim().toLowerCase();
    if (!query) return genres;
    return genres.filter((genre) => genre.name.toLowerCase().includes(query));
  }, [genres, genreQuery]);

  return (
    <aside
      className={cn(
        "w-full shrink-0",
        mode === "sidebar" && "lg:w-80 lg:border-r lg:pr-6 mb-4 lg:mb-0",
        className
      )}
    >
      {!isPanel && (
        <div className="rounded-xl border bg-card/60 backdrop-blur-sm p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold inline-flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {activeFiltersCount} ativos
            </span>
          </div>
        </div>
      )}

      <div className={cn("flex items-center justify-end mb-3 sm:mb-4", isPanel && "mb-2")}>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Limpar filtros"
          onClick={clearFilters}
          disabled={activeFiltersCount === 0}
          className="h-8 px-2 text-xs sm:text-sm"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      </div>
      <Accordion
        type="multiple"
        defaultValue={[]}
        className="space-y-2"
      >
        {!isClientSearch && (
          <>
            {/* Instrumentos */}
            <AccordionItem value="instruments">
              <AccordionTrigger className="flex items-center gap-2 text-sm font-medium">
                <Guitar className="h-4 w-4" /> Instrumentos
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-2">
                <Input
                  value={instrumentQuery}
                  onChange={(e) => setInstrumentQuery(e.target.value)}
                  placeholder="Filtrar instrumentos..."
                  className="h-9"
                />
                {isLoadingInstruments ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {filteredInstruments.map((instrument) => (
                      <Label
                        key={instrument.slug}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          id={`instruments-${instrument.slug}`}
                          checked={filters.instruments.includes(instrument.slug)}
                          onCheckedChange={() =>
                            toggleArrayValue("instruments", instrument.slug)
                          }
                        />
                        <span>{instrument.name}</span>
                      </Label>
                    ))}
                    {!filteredInstruments.length && (
                      <p className="text-xs text-muted-foreground">Nenhum instrumento encontrado.</p>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Estilos Musicais */}
            <AccordionItem value="genres">
              <AccordionTrigger className="flex items-center gap-2 text-sm font-medium">
                <Music className="h-4 w-4" /> Estilos Musicais
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-2">
                <Input
                  value={genreQuery}
                  onChange={(e) => setGenreQuery(e.target.value)}
                  placeholder="Filtrar estilos..."
                  className="h-9"
                />
                {isLoadingGenres ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {filteredGenres.map((genre) => (
                      <Label
                        key={genre.slug}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          id={`genres-${genre.slug}`}
                          checked={filters.genres.includes(genre.slug)}
                          onCheckedChange={() =>
                            toggleArrayValue("genres", genre.slug)
                          }
                        />
                        <span>{genre.name}</span>
                      </Label>
                    ))}
                    {!filteredGenres.length && (
                      <p className="text-xs text-muted-foreground">Nenhum estilo encontrado.</p>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Faixa de Preço */}
            <AccordionItem value="price">
              <AccordionTrigger className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4" /> Faixa de Preço
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={filters.priceMin}
                    onChange={(e) =>
                      setFilters({ ...filters, priceMin: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={filters.priceMax}
                    onChange={(e) =>
                      setFilters({ ...filters, priceMax: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { min: "0", max: "300", label: "Até R$ 300" },
                    { min: "300", max: "500", label: "R$ 300 - R$ 500" },
                    { min: "500", max: "800", label: "R$ 500 - R$ 800" },
                    { min: "800", max: "1200", label: "R$ 800 - R$ 1.200" },
                    { min: "1200", max: "", label: "R$ 1.200+" },
                  ].map((preset, idx) => (
                    <Button
                      key={idx}
                      variant={hasPricePreset(preset.min, preset.max) ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          priceMin: preset.min,
                          priceMax: preset.max,
                        })
                      }
                    >
                      {hasPricePreset(preset.min, preset.max) && <Check className="h-3 w-3 mr-1" />}
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Avaliação */}
            <AccordionItem value="rating">
              <AccordionTrigger className="flex items-center gap-2 text-sm font-medium">
                <Star className="h-4 w-4" /> Avaliação Mínima
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <RadioGroup
                  value={filters.rating}
                  onValueChange={(value) =>
                    setFilters({ ...filters, rating: value })
                  }
                  className="flex flex-col gap-2"
                >
                  {["5", "4", "3"].map((value) => (
                    <Label
                      key={value}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <RadioGroupItem value={value} id={`rating-${value}`} />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < parseInt(value)
                                ? "fill-current"
                                : "stroke-current"
                            }`}
                          />
                        ))}
                      </div>
                      <span>
                        {value === "5" ? "5 estrelas" : `${value}+ estrelas`}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>
          </>
        )}

        {/* Disponibilidade */}
        <AccordionItem value="availability">
          <AccordionTrigger className="flex items-center gap-2 text-sm font-medium">
            <CalendarIcon className="h-4 w-4" /> Disponibilidade
          </AccordionTrigger>
          <AccordionContent className="pt-2 space-y-2">
            <div className="flex flex-col gap-2">
              {[
                { value: "weekends", label: "Fins de semana" },
                { value: "weekdays", label: "Dias de semana" },
                { value: "evenings", label: "Noites" },
              ].map((option) => (
                <Label
                  key={option.value}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    id={`availability-${option.value}`}
                    checked={filters.availability.includes(option.value)}
                    onCheckedChange={() =>
                      toggleArrayValue("availability", option.value)
                    }
                  />
                  <span>{option.label}</span>
                </Label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
