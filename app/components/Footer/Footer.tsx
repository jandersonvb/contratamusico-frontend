import Link from "next/link";

export function Footer() {
  return (
    <footer id="contato" className="border-t bg-background">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-lg flex items-center">
              <span className="text-lg bg-primary border-lg border-0 rounded-md px-1 py-0.5 mr-1 font-mono font-bold text-background">
                CONTRATA
              </span>
              MÚSICO
            </span>
          </Link>

          <p className="mt-2 text-sm text-muted-foreground">
            Encontre e contrate músicos com segurança.
          </p>
        </div>
        <div>
          <div className="text-sm font-medium">Links</div>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#como-funciona">Como funciona</a>
            </li>
            <li>
              <a href="/buscar">Buscar músicos</a>
            </li>
            <li>
              <a href="/planos">Planos</a>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium">Contato</div>
          <p className="mt-2 text-sm text-muted-foreground">
            contato@contratamusico.com.br
          </p>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ContrataMusico. Todos os direitos
        reservados.
      </div>
    </footer>
  );
}
