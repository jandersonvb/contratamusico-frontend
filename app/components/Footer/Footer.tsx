import Link from "next/link";

import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";

export function Footer() {
  const socialLinks = [
    { 
      href: "https://facebook.com/contratamusico", 
      icon: Facebook, 
      label: "Facebook",
      ariaLabel: "Visite nossa página no Facebook" 
    },
    { 
      href: "https://instagram.com/contratamusico", 
      icon: Instagram, 
      label: "Instagram",
      ariaLabel: "Siga-nos no Instagram" 
    },
    { 
      href: "https://twitter.com/contratamusico", 
      icon: Twitter, 
      label: "Twitter",
      ariaLabel: "Siga-nos no Twitter" 
    },
    { 
      href: "https://youtube.com/contratamusico", 
      icon: Youtube, 
      label: "YouTube",
      ariaLabel: "Inscreva-se em nosso canal no YouTube" 
    },
  ];

  return (
    <footer id="contato" className="border-t bg-background" role="contentinfo">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <Link href="/" className="text-lg flex items-center w-fit" aria-label="ContrataMusico - Página inicial">
            <span className="text-lg bg-primary border-lg border-0 rounded-md px-1 py-0.5 mr-1 font-mono font-bold text-background">
              CONTRATA
            </span>
            MÚSICO
          </Link>

          <p className="mt-2 text-sm text-muted-foreground">
            Encontre e contrate músicos com segurança.
          </p>
        </div>
        <nav aria-label="Links úteis">
          <h3 className="text-sm font-medium">Links</h3>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/como-funciona" className="hover:text-foreground transition-colors duration-200">Como funciona</Link>
            </li>
            <li>
              <Link href="/busca" className="hover:text-foreground transition-colors duration-200">Buscar músicos</Link>
            </li>
            <li>
              <Link href="/planos" className="hover:text-foreground transition-colors duration-200">Planos</Link>
            </li>
          </ul>
        </nav>
        <div>
          <h3 className="text-sm font-medium">Contato</h3>
          <a 
            href="mailto:contato@contratamusico.com.br" 
            className="mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-2"
            aria-label="Enviar email para contato@contratamusico.com.br"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            contato@contratamusico.com.br
          </a>
          <div className="mt-8">
            <h3 className="font-medium mb-3">
              Siga-nos nas Redes Sociais
            </h3>
            <nav aria-label="Redes sociais" className="flex flex-wrap gap-3">
              {socialLinks.map(({ href, icon: Icon, label, ariaLabel }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                  aria-label={ariaLabel}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{label}</span>
                </a>
              ))}
            </nav>
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
