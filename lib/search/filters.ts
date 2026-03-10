import { SearchFilters } from "@/lib/types/search";

export function hasMusicianOnlyFilters(filters: SearchFilters): boolean {
  return (
    filters.genres.length > 0 ||
    filters.instruments.length > 0 ||
    Boolean(filters.priceMin) ||
    Boolean(filters.priceMax) ||
    Boolean(filters.rating)
  );
}

export function clearMusicianOnlyFilters(filters: SearchFilters): SearchFilters {
  return {
    ...filters,
    genres: [],
    instruments: [],
    priceMin: "",
    priceMax: "",
    rating: "",
  };
}

export function countActiveFilters(filters: SearchFilters): number {
  let count = 0;

  if (filters.state && filters.state !== "all") count += 1;
  if (filters.city) count += 1;
  count += filters.instruments.length;
  count += filters.genres.length;
  if (filters.priceMin || filters.priceMax) count += 1;
  if (filters.rating) count += 1;
  if (filters.date) count += 1;
  count += filters.availability.length;

  return count;
}
