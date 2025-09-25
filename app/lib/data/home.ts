import { Calendar, Star, User } from "lucide-react";

export const site = {
  name: "ContrataMusico",
  tagline: "Encontre o Músico Perfeito para seu Evento",
  description:
    "Conectamos você com músicos talentosos para tornar sua ocasião especial inesquecível. Desde casamentos até shows corporativos.",
};

export type Category = {
  slug: string;
  title: string;
  icon: string; // lucide icon name
  blurb: string;
  href: string;
};

export const categories: Category[] = [
  {
    slug: "cordas",
    title: "Violão & Guitarra",
    icon: "Guitar",
    blurb:
      "Músicos especializados em cordas para eventos intimistas ou shows energéticos",
    href: "/buscar?categoria=cordas",
  },
  {
    slug: "vocal",
    title: "Cantores",
    icon: "Mic",
    blurb:
      "Vocalistas profissionais para dar vida à trilha sonora do seu evento",
    href: "/buscar?categoria=vocal",
  },
  {
    slug: "teclas",
    title: "Piano & Teclado",
    icon: "Piano",
    blurb: "Pianistas e tecladistas para cerimônias e apresentações elegantes",
    href: "/buscar?categoria=teclas",
  },
  {
    slug: "percussao",
    title: "Bateria & Percussão",
    icon: "Drum",
    blurb: "Bateristas e percussionistas para dar ritmo ao seu evento",
    href: "/buscar?categoria=percussao",
  },
  {
    slug: "bandas",
    title: "Bandas",
    icon: "Users",
    blurb: "Grupos musicais completos para eventos de grande porte",
    href: "/buscar?categoria=bandas",
  },
  {
    slug: "dj",
    title: "DJ & Eletrônica",
    icon: "Music2",
    blurb: "DJs e produtores de música eletrônica para festas e baladas",
    href: "/buscar?categoria=dj",
  },
];

export const stats = [
  { label: "Músicos Cadastrados", value: "500+", icon: User },
  { label: "Eventos Realizados", value: "1000+", icon: Calendar },
  { label: "Satisfação", value: "98%", icon: Star },
];

export const steps = [
  {
    title: "Busque e filtre",
    blurb: "Use filtros por cidade, estilo e preço.",
  },
  { title: "Compare perfis", blurb: "Veja avaliações, vídeos e portfólio." },
  {
    title: "Converse com o artista",
    blurb: "Combine detalhes e disponibilidade.",
  },
  { title: "Feche com segurança", blurb: "Contratação simples e protegida." },
];
