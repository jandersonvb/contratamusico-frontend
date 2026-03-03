import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade | Contrata Músico",
  description:
    "Entenda quais dados coletamos, para que usamos, com quem compartilhamos e quais são seus direitos na plataforma Contrata Músico.",
};

export default function PoliticaPrivacidadePage() {
  return (
    <main className="min-h-screen">
      <section className="bg-primary/5 border-b py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Política de Privacidade
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
            Esta política descreve como o Contrata Músico coleta, utiliza,
            compartilha e protege dados pessoais dos usuários da plataforma.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 sm:py-12">
        <article className="max-w-4xl mx-auto space-y-8 text-sm sm:text-base leading-7">
          <section id="dados-coletados" className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold">
              1. Dados coletados
            </h2>
            <p>Podemos coletar as seguintes categorias de dados pessoais:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                dados cadastrais, como nome, e-mail, telefone e cidade/estado;
              </li>
              <li>
                dados de perfil e uso da plataforma, como preferências, histórico
                de interações e informações de contratação;
              </li>
              <li>
                dados técnicos, como endereço IP, tipo de dispositivo, navegador
                e registros de acesso;
              </li>
              <li>
                dados fornecidos em contato com nosso suporte, inclusive
                mensagens enviadas por formulários.
              </li>
            </ul>
          </section>

          <section id="finalidade" className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold">
              2. Finalidade do tratamento
            </h2>
            <p>
              Utilizamos dados pessoais para operar e melhorar a plataforma,
              incluindo:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>criação e gerenciamento de contas;</li>
              <li>
                conexão entre clientes e músicos para viabilizar contratações;
              </li>
              <li>atendimento, suporte e comunicação com usuários;</li>
              <li>segurança, prevenção a fraudes e proteção da plataforma;</li>
              <li>
                cumprimento de obrigações legais, regulatórias e exercício de
                direitos em processos administrativos ou judiciais.
              </li>
            </ul>
          </section>

          <section id="compartilhamento" className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold">
              3. Compartilhamento de dados
            </h2>
            <p>
              O compartilhamento de dados ocorre apenas quando necessário para a
              prestação dos serviços ou para cumprir obrigações legais, como:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                entre usuários da plataforma, quando necessário para viabilizar
                o contato e a contratação;
              </li>
              <li>
                com fornecedores e parceiros que apoiam a operação do serviço
                (por exemplo, infraestrutura, autenticação e comunicação);
              </li>
              <li>
                com autoridades públicas, quando houver obrigação legal ou ordem
                válida.
              </li>
            </ul>
          </section>

          <section id="retencao" className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold">
              4. Retenção de dados
            </h2>
            <p className="text-muted-foreground">
              Os dados pessoais são armazenados pelo tempo necessário para
              cumprir as finalidades desta política, atender exigências legais e
              regulatórias, resolver disputas e exercer direitos. Quando não
              houver mais necessidade, os dados são eliminados ou anonimizados,
              conforme aplicável.
            </p>
          </section>

          <section id="direitos" className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold">
              5. Direitos do usuário
            </h2>
            <p>
              Nos termos da legislação aplicável, incluindo a LGPD, você pode
              solicitar:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>confirmação da existência de tratamento de dados;</li>
              <li>acesso, correção e atualização de dados incompletos;</li>
              <li>anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>portabilidade, quando aplicável;</li>
              <li>
                informações sobre compartilhamento de dados e possibilidade de
                revogação de consentimento, quando essa for a base legal.
              </li>
            </ul>
          </section>

          <section id="contato" className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold">6. Contato</h2>
            <p className="text-muted-foreground">
              Para dúvidas, solicitações sobre dados pessoais ou exercício de
              direitos, entre em contato pelos canais abaixo:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                e-mail:{" "}
                <a
                  href="mailto:contato@contratamusico.com.br"
                  className="text-primary underline"
                >
                  contato@contratamusico.com.br
                </a>
              </li>
              <li>
                página de contato:{" "}
                <Link href="/contato" className="text-primary underline">
                  contratamusico.com.br/contato
                </Link>
              </li>
            </ul>
          </section>
        </article>
      </section>
    </main>
  );
}
