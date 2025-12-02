export interface Musician {
  id: number;
  name: string;
  category: string;
  tags: string[];
  location: string;
  events: number;
  responseTime: string;
  price: number;
  rating: number;
  image: string;
}

/**
 * Static list of musicians used to seed the search results. In a real
 * application these records would come from an API or database. The
 * structure mirrors the information shown in the original busca.html
 * mockup: name, category, genres, location, number of events, response
 * time, starting price and rating. Feel free to extend this list with
 * additional entries as you build out the filtering logic.
 */
export const musicians: Musician[] = [
  {
    id: 1,
    name: "João Silva",
    category: "Violonista & Cantor",
    tags: ["MPB", "Bossa Nova", "Pop"],
    location: "São Paulo, SP",
    events: 50,
    responseTime: "2h",
    price: 300,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Maria Santos",
    category: "Pianista Clássica",
    tags: ["Clássica", "Jazz", "Instrumental"],
    location: "Rio de Janeiro, RJ",
    events: 80,
    responseTime: "1h",
    price: 450,
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Carlos Drums",
    category: "Baterista Profissional",
    tags: ["Rock", "Pop", "Funk"],
    location: "Belo Horizonte, MG",
    events: 35,
    responseTime: "3h",
    price: 350,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Ana Ribeiro",
    category: "Cantora",
    tags: ["Pop", "Eletrônica"],
    location: "Curitiba, PR",
    events: 20,
    responseTime: "4h",
    price: 280,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1544221230-3a495b71c41e?w=300&h=300&fit=crop&crop=face",
  },
  {
    id: 5,
    name: "Pedro Alves",
    category: "Violinista",
    tags: ["Clássica", "MPB"],
    location: "Salvador, BA",
    events: 45,
    responseTime: "2h",
    price: 380,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1495562569060-2eec283d3391?w=300&h=300&fit=crop&crop=face",
  },
];