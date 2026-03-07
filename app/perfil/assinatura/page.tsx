import { permanentRedirect } from "next/navigation";

export default function PerfilAssinaturaAliasPage() {
  permanentRedirect("/perfil?tab=assinatura");
}
