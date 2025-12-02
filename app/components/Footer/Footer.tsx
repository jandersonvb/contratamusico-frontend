import Link from "next/link";

import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer id="contato" className="border-t bg-background">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <span className="text-lg flex items-center">
            <Link href="/">
              <span className="text-lg bg-primary border-lg border-0 rounded-md px-1 py-0.5 mr-1 font-mono font-bold text-background">
                CONTRATA
              </span>
              MÚSICO
            </Link>
          </span>

          <p className="mt-2 text-sm text-muted-foreground">
            Encontre e contrate músicos com segurança.
          </p>
        </div>
        <div>
          <div className="text-sm font-medium">Links</div>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/como-funciona" className="hover:text-foreground">Como funciona</Link>
            </li>
            <li>
              <Link href="/busca" className="hover:text-foreground">Buscar músicos</Link>
            </li>
            <li>
              <Link href="/planos" className="hover:text-foreground">Planos</Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium">Contato</div>
          <p className="mt-2 text-sm text-muted-foreground">
            contato@contratamusico.com.br
          </p>
          <div>
            <h3 className="font-medium mb-2 mt-8">
              Siga-nos nas Redes Sociais
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#"
                className="flex items-center gap-2 text-sm hover:text-primary"
              >
                <Facebook className="h-4 w-4" /> Facebook
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm hover:text-primary"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm hover:text-primary"
              >
                <Twitter className="h-4 w-4" /> Twitter
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm hover:text-primary"
              >
                <Youtube className="h-4 w-4" /> YouTube
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ContrataMusico. Todos os direitos
        reservados.
      </div>
    </footer>
  );
}
