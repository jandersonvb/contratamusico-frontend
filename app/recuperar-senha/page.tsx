import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import RecuperarSenhaClient from "./RecuperarSenhaClient";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function RecuperarSenhaPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RecuperarSenhaClient />
    </Suspense>
  );
}
