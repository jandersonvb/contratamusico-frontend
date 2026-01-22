// Este arquivo contém dados mockados para fallback/desenvolvimento
// Em produção, os dados são buscados da API via searchMusicians()

// Re-exporta o tipo do novo sistema de tipos
export type { MusicianListItem as Musician } from './types/musician';

// Dados mockados para desenvolvimento (quando a API não está disponível)
export const mockMusicians = [
  {
    id: 1,
    name: "João Silva",
    category: "Violonista & Cantor",
    location: "São Paulo, SP",
    priceFrom: 300,
    rating: 4.9,
    ratingCount: 25,
    eventsCount: 50,
    isFeatured: true,
    genres: [
      { id: 1, name: "MPB", slug: "mpb" },
      { id: 2, name: "Bossa Nova", slug: "bossa-nova" },
    ],
    instruments: [
      { id: 1, name: "Violão", slug: "violao" },
      { id: 2, name: "Voz", slug: "voz" },
    ],
  },
  {
    id: 2,
    name: "Maria Santos",
    category: "Pianista Clássica",
    location: "Rio de Janeiro, RJ",
    priceFrom: 450,
    rating: 5.0,
    ratingCount: 40,
    eventsCount: 80,
    isFeatured: true,
    genres: [
      { id: 3, name: "Clássica", slug: "classica" },
      { id: 4, name: "Jazz", slug: "jazz" },
    ],
    instruments: [
      { id: 3, name: "Piano", slug: "piano" },
    ],
  },
];
