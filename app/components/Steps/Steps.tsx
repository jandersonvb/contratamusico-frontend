import { steps } from "@/app/lib/data/home";

export function Steps() {
  return (
    <section id="como-funciona" className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-semibold">Como Funciona</h2>
          <p className="text-muted-foreground">
            Processo simples e seguro para contratar músicos
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="flex items-start gap-4">
              <div className="grid size-12 place-content-center rounded-full bg-primary text-primary-foreground">
                <span className="text-lg font-bold">{i + 1}</span>
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
