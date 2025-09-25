import { categories } from "@/app/lib/data/home";
import { CategoryCard } from "../CategoryCard/CategoryCard";

export function Categories() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-semibold">Categorias de Músicos</h2>
          <p className="text-muted-foreground">
            Encontre o estilo musical perfeito para seu evento
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <CategoryCard key={c.slug} item={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
