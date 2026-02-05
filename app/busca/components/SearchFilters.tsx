"use client";

import { useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  DollarSign,
  Guitar,
  MapPin,
  Music,
  Star,
  X,
} from "lucide-react";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useInstrumentStore } from "@/lib/stores/instrumentStore";
import { useGenreStore } from "@/lib/stores/genreStore";
import { SearchFilters as SearchFiltersType } from "@/lib/types/search";

interface SearchFiltersProps {
  filters: SearchFiltersType;
  setFilters: (filters: SearchFiltersType) => void;
  clearFilters: () => void;
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
}: SearchFiltersProps) {
  // Stores
  const { states, cities, isLoadingStates, isLoadingCities, fetchStates, fetchCities } = useLocationStore();
  const { instruments, isLoading: isLoadingInstruments, fetchInstruments } = useInstrumentStore();
  const { genres, isLoading: isLoadingGenres, fetchGenres } = useGenreStore();

  // Carrega dados iniciais
  useEffect(() => {
    fetchStates();
    fetchInstruments();
    fetchGenres();
  }, [fetchStates, fetchInstruments, fetchGenres]);

  // Quando o estado muda, busca as cidades
  useEffect(() => {
    if (filters.state && filters.state !== "all") {
      fetchCities(filters.state);
    }
  }, [filters.state, fetchCities]);

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

  return (
    <aside className="w-full lg:w-72 shrink-0 lg:border-r lg:pr-6 mb-4 lg:mb-0">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold">Filtros</h3>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Limpar filtros"
          onClick={clearFilters}
          className="h-8 px-2 text-xs sm:text-sm"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      </div>
      <Accordion
        type="multiple"
        defaultValue={[
          "location",
          "instruments",
          "genres",
          "price",
          "rating",
          "availability",
        ]}
        className="space-y-2"
      >
        {/* Localização */}
        <AccordionItem value="location">
          <AccordionTrigger className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4" /> Localização
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            <Select
              value={filters.state}
              onValueChange={(value) => {
                setFilters({ ...filters, state: value, city: "" });
              }}
            >
              <SelectTrigger className="w-full">
                {isLoadingStates 
                  ? "Carregando..." 
                  : filters.state && filters.state !== "all"
                    ? states.find(s => s.sigla === filters.state)?.nome || filters.state
                    : "Todos os estados"
                }
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
            
            {filters.state && filters.state !== "all" && (
              <Select
                value={filters.city || "all"}
                onValueChange={(value) => setFilters({ ...filters, city: value === "all" ? "" : value })}
              >
                <SelectTrigger className="w-full">
                  {isLoadingCities
                    ? "Carregando..."
                    : filters.city || "Todas as cidades"
                  }
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
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Instrumentos */}
        <AccordionItem value="instruments">
          <AccordionTrigger className="flex items-center gap-2 text-sm font-medium">
            <Guitar className="h-4 w-4" /> Instrumentos
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            {isLoadingInstruments ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {instruments.map((instrument) => (
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
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Estilos Musicais */}
        <AccordionItem value="genres">
          <AccordionTrigger className="flex items-center gap-2 text-sm font-medium">
            <Music className="h-4 w-4" /> Estilos Musicais
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            {isLoadingGenres ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {genres.map((genre) => (
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
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      priceMin: preset.min,
                      priceMax: preset.max,
                    })
                  }
                >
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

        {/* Disponibilidade */}
        <AccordionItem value="availability">
          <AccordionTrigger className="flex items-center gap-2 text-sm font-medium">
            <CalendarIcon className="h-4 w-4" /> Disponibilidade
          </AccordionTrigger>
          <AccordionContent className="pt-2 space-y-2">
            <div className="space-y-1">
              <Label htmlFor="eventDate" className="text-sm">
                Data do Evento
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters({ ...filters, date: e.target.value })
                }
              />
            </div>
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
