export interface PortfolioItem {
  /**
   * Type of media in the portfolio. Images are displayed as pictures,
   * videos show a play overlay and audio entries show a simple play
   * button with title and duration. This mirrors the different
   * media elements present in the original HTML mockup.
   */
  type: "image" | "video" | "audio";
  /** Title describing the portfolio piece. */
  title: string;
  /** Short description about the context of the item. */
  description: string;
  /** URL for the thumbnail or cover image. */
  image: string;
  /** Date the performance or recording took place. */
  date: string;
  /** Optional location of the event. */
  location?: string;
  /** Optional musical genre for audio examples. */
  genre?: string;
}

export interface Review {
  id: number;
  /** Reviewer's name. */
  name: string;
  /** URL to the reviewer avatar. */
  avatar: string;
  /** Human friendly date of the review. */
  date: string;
  /** Rating given by the reviewer (1–5). */
  rating: number;
  /** Review body text. */
  content: string;
  /** Description of the event the review refers to. */
  event: string;
}

export interface SimilarMusician {
  id: number;
  name: string;
  category: string;
  rating: number;
  image: string;
}

export interface MusicianDetail {
  id: number;
  name: string;
  category: string;
  tags: string[];
  location: string;
  /** Average rating out of 5. */
  rating: number;
  /** Total number of ratings. */
  ratingCount: number;
  /** Total number of events performed. */
  events: number;
  /** Average response time to inquiries. */
  responseTime: string;
  /** Overall satisfaction percentage. */
  satisfaction: number;
  /** Starting price per event in Brazilian Real. */
  priceFrom: number;
  /** About section paragraphs. */
  about: string[];
  /** Portfolio entries. */
  portfolio: PortfolioItem[];
  /** Client reviews. */
  reviews: Review[];
  /** Instruments the musician plays. */
  instruments: string[];
  /** Experience level description. */
  experience: string;
  /** Brief description of equipment the musician owns. */
  equipment: string;
  /** Availability description (e.g. weekends, weekdays). */
  availability: string;
  /** Geographic area the musician is willing to travel to. */
  area: string;
  /** List of similar musicians to suggest on the details page. */
  similar: SimilarMusician[];
}

/**
 * Sample detail records for musicians. In a real application these
 * would come from an API or database. The structure covers all
 * information displayed on the musician details page, including
 * portfolio items, reviews and sidebar metadata. Feel free to add
 * additional musicians to this list as you build out the app.
 */
export const musicianDetails: MusicianDetail[] = [
  {
    id: 1,
    name: "João Silva",
    category: "Violonista & Cantor",
    tags: ["MPB", "Bossa Nova", "Pop"],
    location: "São Paulo, SP",
    rating: 4.9,
    ratingCount: 47,
    events: 52,
    responseTime: "2h",
    satisfaction: 98,
    priceFrom: 300,
    about: [
      "Músico profissional com mais de 10 anos de experiência em apresentações ao vivo. Especializado em MPB, Bossa Nova e música popular brasileira. Já se apresentou em diversos eventos, desde casamentos intimistas até grandes festivais.",
      "Minha paixão pela música começou na adolescência e desde então venho me dedicando a criar experiências musicais únicas para cada evento. Acredito que a música tem o poder de transformar momentos especiais em memórias inesquecíveis.",
    ],
    portfolio: [
      {
        type: "image",
        title: "Casamento Silva",
        description:
          "Apresentação intimista com repertório de MPB e Bossa Nova",
        image:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
        date: "15/08/2024",
        location: "São Paulo, SP",
      },
      {
        type: "video",
        title: "Evento Corporativo",
        description: "Performance ao vivo para evento de fim de ano da empresa",
        image:
          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=200&fit=crop",
        date: "20/12/2023",
        location: "São Paulo, SP",
      },
      {
        type: "audio",
        title: "Demo - Bossa Nova",
        description: "Gravação de estúdio do clássico de Tom Jobim",
        image: "", // audio entries don't need an image
        date: "10/03/2024",
        genre: "Bossa Nova",
      },
    ],
    reviews: [
      {
        id: 1,
        name: "Ana Costa",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
        date: "15 de agosto de 2024",
        rating: 5,
        content:
          "João foi simplesmente perfeito no nosso casamento! Sua voz é incrível e o repertório escolhido foi exatamente o que queríamos. Todos os convidados elogiaram muito. Super recomendo!",
        event: "Casamento - São Paulo, SP",
      },
      {
        id: 2,
        name: "Roberto Lima",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
        date: "20 de dezembro de 2023",
        rating: 5,
        content:
          "Excelente profissional! Pontual, educado e com uma performance impecável. O evento corporativo ficou muito mais especial com sua apresentação. Certamente contrataremos novamente.",
        event: "Evento Corporativo - São Paulo, SP",
      },
    ],
    instruments: ["Violão", "Vocal"],
    experience: "10+ anos",
    equipment:
      "Violão Martin D-28, sistema de som Bose S1 Pro, microfone Shure SM58, pedais de efeito Boss.",
    availability: "Fins de semana",
    area: "Grande São Paulo",
    similar: [
      {
        id: 2,
        name: "Maria Santos",
        category: "Pianista Clássica",
        rating: 5.0,
        image:
          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=60&h=60&fit=crop&crop=face",
      },
      {
        id: 3,
        name: "Carlos Drums",
        category: "Baterista",
        rating: 4.8,
        image:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=60&h=60&fit=crop&crop=face",
      },
    ],
  },
  {
    id: 2,
    name: "Maria Santos",
    category: "Pianista Clássica",
    tags: ["Clássica", "Jazz", "Instrumental"],
    location: "Rio de Janeiro, RJ",
    rating: 5.0,
    ratingCount: 38,
    events: 85,
    responseTime: "1h",
    satisfaction: 100,
    priceFrom: 450,
    about: [
      "Pianista clássica com formação em música erudita e jazz. Com mais de 8 anos de experiência, já se apresentou em teatros, eventos corporativos e casamentos. Meu repertório inclui desde clássicos da música erudita até standards do jazz.",
      "Acredito que a música é uma forma de expressão que transcende palavras. Cada apresentação é uma oportunidade de criar uma conexão única com o público, tornando cada evento especial e memorável.",
    ],
    portfolio: [
      {
        type: "image",
        title: "Recital de Piano",
        description: "Performance solo com repertório clássico e jazz",
        image:
          "https://images.unsplash.com/photo-1511376777868-611b54f68947?w=300&h=200&fit=crop",
        date: "05/09/2024",
        location: "Rio de Janeiro, RJ",
      },
      {
        type: "video",
        title: "Evento Corporativo",
        description:
          "Apresentação ao vivo para evento de lançamento de produto",
        image:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=200&fit=crop",
        date: "12/11/2023",
        location: "Rio de Janeiro, RJ",
      },
      {
        type: "audio",
        title: "Demo - Jazz Standards",
        description: "Gravação de estúdio com clássicos do jazz",
        image: "",
        date: "22/02/2024",
        genre: "Jazz",
      },
    ],
    reviews: [
      {
        id: 1,
        name: "Lucas Ferreira",
        avatar:
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=50&h=50&fit=crop&crop=face",
        date: "05 de setembro de 2024",
        rating: 5,
        content:
          "Maria é uma pianista excepcional! Sua técnica e sensibilidade musical são impressionantes. A apresentação no nosso evento foi um sucesso absoluto. Todos ficaram encantados com sua performance.",
        event: "Evento Corporativo - Rio de Janeiro, RJ",
      },
      {
        id: 2,
        name: "Fernanda Oliveira",
        avatar:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=50&h=50&fit=crop&crop=face",
        date: "12 de novembro de 2023",
        rating: 5,
        content:
          "Contratamos Maria para o recital de piano na nossa galeria de arte e foi simplesmente maravilhoso. Sua interpretação das peças clássicas trouxe uma atmosfera única ao evento. Recomendo fortemente!",
        event: "Recital de Piano - Rio de Janeiro, RJ",
      },
    ],
    instruments: ["Piano"],
    experience: "8 anos",
    equipment:
      "Piano de cauda Yamaha C7, sistema de som JBL EON615, microfone AKG C414.",
    availability: "Fins de semana e feriados",
    area: "Grande Rio de Janeiro",
    similar: [
      {
        id: 1,
        name: "João Silva",
        category: "Violonista & Cantor",
        rating: 4.9,
        image:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop&crop=face",
      },
      {
        id: 4,
        name: "Ana Ribeiro",
        category: "Cantora",
        rating: 4.7,
        image:
          "https://images.unsplash.com/photo-1544221230-3a495b71c41?w=60&h=60&fit=crop&crop=face",
      },
    ],
  },
];
