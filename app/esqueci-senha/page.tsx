"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { requestPasswordReset } from "@/api/auth";
import Link from "next/link";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Digite seu e-mail");
      return;
    }

    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      setEmailSent(true);
      toast.success("E-mail enviado! Verifique sua caixa de entrada.");
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar e-mail';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle>Recuperar Senha</CardTitle>
            <CardDescription>
              {emailSent 
                ? "E-mail enviado com sucesso!"
                : "Digite seu e-mail para receber instruções de recuperação"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Enviamos um link de recuperação de senha para <strong>{email}</strong>.
                  Verifique sua caixa de entrada e spam.
                </p>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setEmailSent(false)}
                >
                  Enviar novamente
                </Button>
                <Link href="/login" className="block">
                  <Button className="w-full">
                    Voltar para o login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm font-medium">
                    E-mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Lembrou sua senha?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}

