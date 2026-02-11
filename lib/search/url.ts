import { SearchFilters, defaultFilters } from "@/lib/types/search";

type SearchParamsLike = {
  get: (name: string) => string | null;
  getAll: (name: string) => string[];
};

const ALLOWED_SORT_VALUES = new Set(["rating", "price-low", "price-high", "newest"]);

function parseArray(params: SearchParamsLike, key: string): string[] {
  const raw = params.getAll(key);
  if (!raw.length) return [];

  const values = raw
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set(values));
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : fallback;
}

export function parseSearchStateFromUrl(params: SearchParamsLike): {
  filters: SearchFilters;
  sortBy: string;
  page: number;
} {
  const search = params.get("search") ?? params.get("q") ?? "";
  const city = params.get("city") ?? params.get("location") ?? "";
  const state = params.get("state") ?? "";
  const priceMin = params.get("priceMin") ?? "";
  const priceMax = params.get("priceMax") ?? "";
  const rating = params.get("rating") ?? "";
  const date = params.get("date") ?? "";
  const instruments = parseArray(params, "instruments");
  const genres = parseArray(params, "genres");
  const availability = parseArray(params, "availability");

  const sortByCandidate = params.get("sortBy") ?? "rating";
  const sortBy = ALLOWED_SORT_VALUES.has(sortByCandidate)
    ? sortByCandidate
    : "rating";

  const page = parsePositiveInt(params.get("page"), 1);

  return {
    filters: {
      ...defaultFilters,
      search,
      city,
      state,
      priceMin,
      priceMax,
      rating,
      date,
      instruments,
      genres,
      availability,
    },
    sortBy,
    page,
  };
}

export function buildSearchUrlQuery(filters: SearchFilters, sortBy: string, page: number): string {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.city) params.set("city", filters.city);
  if (filters.state && filters.state !== "all") params.set("state", filters.state);
  if (filters.priceMin) params.set("priceMin", filters.priceMin);
  if (filters.priceMax) params.set("priceMax", filters.priceMax);
  if (filters.rating) params.set("rating", filters.rating);
  if (filters.date) params.set("date", filters.date);

  filters.instruments.forEach((instrument) => params.append("instruments", instrument));
  filters.genres.forEach((genre) => params.append("genres", genre));
  filters.availability.forEach((slot) => params.append("availability", slot));

  if (sortBy && sortBy !== "rating") params.set("sortBy", sortBy);
  if (page > 1) params.set("page", String(page));

  return params.toString();
}

