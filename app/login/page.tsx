"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/lib/stores/userStore";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const { login } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password, rememberMe: remember });
      // redireciona para o dashboard após login bem‑sucedido
      router.push("/dashboard");
      toast.success("Login realizado com sucesso!");
    } catch {
      toast.error("Falha no login. Verifique suas credenciais e tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex-1  py-12">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="max-w-md w-full  p-8 rounded-lg shadow-sm">
            <div className="mb-6 text-center space-y-1">
              <div className="flex items-center justify-center text-primary mb-2">
                <Lock className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold">Bem‑vindo de volta!</h1>
              <p className="text-sm text-muted-foreground">
                Entre na sua conta para acessar músicos incríveis
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" /> E‑mail
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" /> Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label
                  htmlFor="remember"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(!!checked)}
                  />
                  <span>Lembrar de mim</span>
                </label>
                <a href="/esqueci-senha" className="text-primary hover:underline text-xs">
                  Esqueci minha senha
                </a>
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>

              {/* <div className="flex flex-col gap-3 mt-4">
                <div className="relative flex items-center justify-center">
                  <span className="absolute  px-2 text-xs text-muted-foreground mb-2">
                    ou
                  </span>
                </div>
                <Button variant="outline" className="w-full">
                  <span className="flex items-center gap-2 justify-center">
                    <Mail className="h-4 w-4" /> Continuar com Google
                  </span>
                </Button>
                <Button variant="outline" className="w-full">
                  <span className="flex items-center gap-2 justify-center">
                    <Facebook className="h-4 w-4" /> Continuar com Facebook
                  </span>
                </Button>
              </div> */}
              <p className="text-xs text-center text-muted-foreground mt-4">
                Não tem uma conta?{" "}
                <a href="/cadastro" className="text-primary hover:underline">
                  Cadastre‑se gratuitamente
                </a>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
