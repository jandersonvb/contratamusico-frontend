import { SearchFilters } from "@/lib/types/search";

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

