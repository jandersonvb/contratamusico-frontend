"use client";

import { useState } from "react";

import { Pagination } from "./components/Pagination";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid, List, Search } from "lucide-react";
import { musicians, type Musician } from "@/lib/musicians";
import { SearchFilters } from "./components/SearchFilters";
import { MusicianCard } from "./components/MusicianCard";

// Define the shape of our filter state. This mirrors the structure
// described in SearchFilters.tsx. In a production app these would
// likely live in a shared store (e.g. Zustand) or be derived from
// query parameters.
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

const defaultFilters: Filters = {
  city: "",
  state: "",
  instruments: [],
  genres: [],
  priceMin: "",
  priceMax: "",
  rating: "",
  date: "",
  availability: [],
};

export default function SearchPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset filters to defaults
  const clearFilters = () => setFilters(defaultFilters);

  // In a real implementation you would filter and sort your data
  // based on the current filters and sortBy state. For now we just
  // return the full list of musicians.
  const filteredMusicians: Musician[] = musicians;

  const totalPages = 1; // Pagination not implemented yet

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero search header */}
      <section className="bg-primary/5 border-b py-12">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h1 className="text-3xl font-bold">Encontre Músicos Incríveis</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Use nossos filtros para encontrar o músico perfeito para seu evento
          </p>
          <div className="mx-auto max-w-xl flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar por nome, instrumento ou estilo..."
              className="flex-1 rounded-md border px-4 py-2 focus:outline-none focus:ring ring-primary"
            />
            <Button size="icon" variant="default" aria-label="Pesquisar">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      {/* Main content */}
      <section className="container mx-auto px-4 flex-1 py-8 flex flex-col lg:flex-row gap-8">
        <SearchFilters
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
        />
        <div className="flex-1 flex flex-col">
          {/* Results header and controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-semibold">Músicos Encontrados</h2>
              <span className="text-sm text-muted-foreground">
                {filteredMusicians.length} músicos encontrados
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Ordenar por:
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    {(() => {
                      switch (sortBy) {
                        case "rating":
                          return "Melhor Avaliação";
                        case "price-low":
                          return "Menor Preço";
                        case "price-high":
                          return "Maior Preço";
                        case "distance":
                          return "Distância";
                        case "newest":
                          return "Mais Recentes";
                        default:
                          return "Relevância";
                      }
                    })()}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevância</SelectItem>
                    <SelectItem value="rating">Melhor Avaliação</SelectItem>
                    <SelectItem value="price-low">Menor Preço</SelectItem>
                    <SelectItem value="price-high">Maior Preço</SelectItem>
                    <SelectItem value="distance">Distância</SelectItem>
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
            {filters.state && (
              <Badge variant="secondary">Estado: {filters.state}</Badge>
            )}
            {filters.instruments.map((instr) => (
              <Badge key={instr} variant="secondary">
                {instr}
              </Badge>
            ))}
            {filters.genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
            {filters.priceMin && filters.priceMax && (
              <Badge variant="secondary">
                Faixa: R$ {filters.priceMin} - R$ {filters.priceMax}
              </Badge>
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
          {/* Results list */}
          {view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMusicians.map((musician) => (
                <MusicianCard key={musician.id} musician={musician} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredMusicians.map((musician) => (
                <MusicianCard
                  key={musician.id}
                  musician={musician}
                  view="list"
                />
              ))}
            </div>
          )}
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>
    </div>
  );
}
