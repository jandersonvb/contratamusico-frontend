"use client";

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

// Define the shape of our filter state. In a real app this would likely
// live in the parent page component and be passed into this component.
interface Filters {
  city: string;
  state: string;
  instruments: string[];
  genres: string[];
  priceMin: string;
  priceMax: string;
  rating: string;
  date: string;
  availability: string[];
}

interface SearchFiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
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
  // Helper to toggle a value inside an array filter (instruments, genres, availability)
  const toggleArrayValue = (key: keyof Filters, value: string) => {
    setFilters({
      ...filters,
      [key]: filters[key].includes(value)
        ? (filters[key] as string[]).filter((v) => v !== value)
        : [...(filters[key] as string[]), value],
    });
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 lg:border-r lg:pr-6 mb-8 lg:mb-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filtros</h3>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Limpar filtros"
          onClick={clearFilters}
        >
          <X className="h-4 w-4" />
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
            <Input
              placeholder="Cidade"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
            <Select
              value={filters.state}
              onValueChange={(value) =>
                setFilters({ ...filters, state: value })
              }
            >
              <SelectTrigger className="w-full">
                {filters.state ? filters.state : "Todos os estados"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {[
                  { value: "SP", label: "São Paulo" },
                  { value: "RJ", label: "Rio de Janeiro" },
                  { value: "MG", label: "Minas Gerais" },
                  { value: "RS", label: "Rio Grande do Sul" },
                  { value: "PR", label: "Paraná" },
                  { value: "SC", label: "Santa Catarina" },
                  { value: "BA", label: "Bahia" },
                  { value: "GO", label: "Goiás" },
                  { value: "PE", label: "Pernambuco" },
                  { value: "CE", label: "Ceará" },
                ].map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        {/* Instrumentos */}
        <AccordionItem value="instruments">
          <AccordionTrigger className="flex items-center gap-2 text-sm font-medium">
            <Guitar className="h-4 w-4" /> Instrumentos
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="flex flex-col gap-2">
              {[
                { value: "violao", label: "Violão" },
                { value: "guitarra", label: "Guitarra" },
                { value: "piano", label: "Piano" },
                { value: "teclado", label: "Teclado" },
                { value: "bateria", label: "Bateria" },
                { value: "baixo", label: "Baixo" },
                { value: "vocal", label: "Vocal" },
                { value: "saxofone", label: "Saxofone" },
              ].map((instrument) => (
                <Label
                  key={instrument.value}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    id={`instruments-${instrument.value}`}
                    checked={filters.instruments.includes(instrument.value)}
                    onCheckedChange={() =>
                      toggleArrayValue("instruments", instrument.value)
                    }
                  />
                  <span>{instrument.label}</span>
                </Label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Estilos Musicais */}
        <AccordionItem value="genres">
          <AccordionTrigger className="flex items-center gap-2 text-sm font-medium">
            <Music className="h-4 w-4" /> Estilos Musicais
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="flex flex-col gap-2">
              {[
                { value: "mpb", label: "MPB" },
                { value: "rock", label: "Rock" },
                { value: "pop", label: "Pop" },
                { value: "jazz", label: "Jazz" },
                { value: "classica", label: "Clássica" },
                { value: "sertanejo", label: "Sertanejo" },
                { value: "bossa-nova", label: "Bossa Nova" },
                { value: "eletronica", label: "Eletrônica" },
              ].map((genre) => (
                <Label
                  key={genre.value}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    id={`genres-${genre.value}`}
                    checked={filters.genres.includes(genre.value)}
                    onCheckedChange={() =>
                      toggleArrayValue("genres", genre.value)
                    }
                  />
                  <span>{genre.label}</span>
                </Label>
              ))}
            </div>
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
                { min: "1200", max: "9999", label: "R$ 1.200+" },
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
