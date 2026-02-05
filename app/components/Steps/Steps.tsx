import { steps } from "@/app/lib/data/home";

export function Steps() {
  return (
    <section id="como-funciona" className="bg-background py-16" aria-labelledby="steps-title">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 id="steps-title" className="mb-2 text-3xl font-semibold">Como Funciona</h2>
          <p className="text-muted-foreground">
            Processo simples e seguro para contratar músicos
          </p>
        </div>
        <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {steps.map((s, i) => (
            <li 
              key={s.title} 
              className="flex items-start gap-4 group"
            >
              <div 
                className="grid size-12 place-content-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
                aria-hidden="true"
              >
                <span className="text-lg font-bold">{i + 1}</span>
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.blurb}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
