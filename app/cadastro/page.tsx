"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { UserPlus, Calendar, Music, EyeOff, Eye, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { registerUser } from "@/api/auth";
import { UserType } from "@/lib/types/user";
import { useUserStore } from "@/lib/stores/userStore";


export default function CadastroPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState<"cliente" | "musico">("cliente");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    instruments: [] as string[],
    genres: [] as string[],
    experience: "",
    priceRange: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const states = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
  ];
  const instruments = [
    { value: "violao", label: "Violão" },
    { value: "guitarra", label: "Guitarra" },
    { value: "piano", label: "Piano" },
    { value: "teclado", label: "Teclado" },
    { value: "bateria", label: "Bateria" },
    { value: "baixo", label: "Baixo" },
    { value: "vocal", label: "Vocal" },
    { value: "saxofone", label: "Saxofone" },
  ];
  const genres = [
    { value: "mpb", label: "MPB" },
    { value: "rock", label: "Rock" },
    { value: "pop", label: "Pop" },
    { value: "jazz", label: "Jazz" },
    { value: "classica", label: "Clássica" },
    { value: "sertanejo", label: "Sertanejo" },
    { value: "bossa-nova", label: "Bossa Nova" },
    { value: "eletronica", label: "Eletrônica" },
  ];
  const experiences = [
    { value: "iniciante", label: "Iniciante (0-2 anos)" },
    { value: "intermediario", label: "Intermediário (3-5 anos)" },
    { value: "avancado", label: "Avançado (6-10 anos)" },
    { value: "profissional", label: "Profissional (10+ anos)" },
  ];
  const priceRanges = [
    { value: "100-300", label: "R$ 100 - R$ 300" },
    { value: "300-500", label: "R$ 300 - R$ 500" },
    { value: "500-800", label: "R$ 500 - R$ 800" },
    { value: "800-1200", label: "R$ 800 - R$ 1.200" },
    { value: "1200+", label: "R$ 1.200+" },
  ];

  const handleCheckboxChange = (
    key: "instruments" | "genres",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? (prev[key] as string[]).filter((v) => v !== value)
        : [...(prev[key] as string[]), value],
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic client-side validation
    if (form.password !== form.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (!form.terms) {
      toast.error("Você precisa aceitar os termos para continuar");
      return;
    }
    if (form.password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      // Remove formatação do telefone (mantém apenas números)
      const cleanPhone = form.phone ? form.phone.replace(/\D/g, '') : undefined;

      const registerData = {
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        firstName: form.firstName,
        lastName: form.lastName,
        userType: userType === "musico" ? UserType.MUSICIAN : UserType.CLIENT,
        phone: cleanPhone || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        terms: form.terms,
        // Dados específicos para músicos
        ...(userType === "musico" && {
          instruments: form.instruments,
          genres: form.genres,
          experience: form.experience || undefined,
          priceRange: form.priceRange || undefined,
        }),
      };

      const response = await registerUser(registerData);

      // Salvar token e usuário
      localStorage.setItem('token', response.access_token);
      setUser(response.user);

      toast.success("Conta criada com sucesso! Bem-vindo(a) à plataforma.");
      
      // Redirecionar para o dashboard
      router.push("/dashboard");

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar conta';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-card border rounded-lg shadow-sm p-8">
            {/* Header */}
            <div className="text-center mb-8 space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto">
                <UserPlus className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold">Crie sua conta</h1>
              <p className="text-muted-foreground">
                Junte-se à maior plataforma de contratação de músicos do Brasil
              </p>
            </div>
            {/* User type selector */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setUserType("cliente")}
                className={`flex flex-col items-center justify-center rounded-md border p-4 transition-colors text-center space-y-1 ${
                  userType === "cliente"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted hover:bg-muted/70"
                }`}
              >
                <Calendar className="h-5 w-5 mb-1" />
                <h3 className="font-medium">Sou Cliente</h3>
                <p className="text-xs text-center">
                  Quero contratar músicos para meus eventos
                </p>
              </button>
              <button
                type="button"
                onClick={() => setUserType("musico")}
                className={`flex flex-col items-center justify-center rounded-md border p-4 transition-colors text-center space-y-1 ${
                  userType === "musico"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted hover:bg-muted/70"
                }`}
              >
                <Music className="h-5 w-5 mb-1" />
                <h3 className="font-medium">Sou Músico</h3>
                <p className="text-xs text-center">
                  Quero oferecer meus serviços musicais
                </p>
              </button>
            </div>
            {/* Registration form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações básicas */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Informações Básicas</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Seu nome"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Seu sobrenome"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Sua cidade"
                      value={form.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="state">Estado</Label>
                    <Select
                      value={form.state}
                      onValueChange={(value) =>
                        handleSelectChange("state", value)
                      }
                    >
                      <SelectTrigger id="state" className="w-full hover:cursor-pointer">
                        {form.state
                          ? states.find((s) => s.value === form.state)?.label
                          : "Selecione"}
                      </SelectTrigger>
                      <SelectContent className="hover:cursor-pointer">
                        {states.map((s) => (
                          <SelectItem key={s.value} value={s.value} className="hover:cursor-pointer hover:bg-primary/10 hover:text-primary">
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              {/* Informações musicais */}
              {userType === "musico" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">
                    Informações Musicais
                  </h2>
                  {/* Instruments */}
                  <div className="space-y-1">
                    <Label>Instrumentos</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {instruments.map((inst) => (
                        <label
                          key={inst.value}
                          className="inline-flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={form.instruments.includes(inst.value)}
                            onCheckedChange={() =>
                              handleCheckboxChange("instruments", inst.value)
                            }
                          />
                          {inst.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Genres */}
                  <div className="space-y-1">
                    <Label>Estilos Musicais</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {genres.map((genre) => (
                        <label
                          key={genre.value}
                          className="inline-flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={form.genres.includes(genre.value)}
                            onCheckedChange={() =>
                              handleCheckboxChange("genres", genre.value)
                            }
                          />
                          {genre.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Experience */}
                  <div className="space-y-1">
                    <Label>Experiência</Label>
                    <Select
                      value={form.experience}
                      onValueChange={(value) =>
                        handleSelectChange("experience", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        {form.experience
                          ? experiences.find((e) => e.value === form.experience)
                              ?.label
                          : "Selecione"}
                      </SelectTrigger>
                      <SelectContent>
                        {experiences.map((e) => (
                          <SelectItem key={e.value} value={e.value}>
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Price range */}
                  <div className="space-y-1">
                    <Label>Faixa de Preço (por evento)</Label>
                    <Select
                      value={form.priceRange}
                      onValueChange={(value) =>
                        handleSelectChange("priceRange", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        {form.priceRange
                          ? priceRanges.find((p) => p.value === form.priceRange)
                              ?.label
                          : "Selecione"}
                      </SelectTrigger>
                      <SelectContent>
                        {priceRanges.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {/* Password */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Segurança</h2>
                <div className="space-y-1 relative">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-1 relative">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              {/* Terms */}
              <div className="space-y-4">
                <label className="inline-flex items-start gap-2 text-sm">
                  <Checkbox
                    id="terms"
                    checked={form.terms}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({ ...prev, terms: !!checked }))
                    }
                    required
                  />
                  <span>
                    Aceito os{" "}
                    <a href="#" className="text-primary underline">
                      Termos de Uso
                    </a>{" "}
                    e a{" "}
                    <a href="#" className="text-primary underline">
                      Política de Privacidade
                    </a>
                  </span>
                </label>
              </div>
              {/* Submit */}
              <div className="space-y-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
                <div className="relative flex items-center justify-center">
                  <span className="absolute bg-card px-2 text-xs text-muted-foreground">
                    ou
                  </span>
                  <div className="h-px w-full bg-border" />
                </div>
                <div className="flex flex-col  gap-3">
                  <Button variant="outline" className="w-full">
                    <i className="fab fa-google mr-2" /> Continuar com Google
                  </Button>
                  <Button variant="outline" className="w-full">
                    <i className="fab fa-facebook-f mr-2" /> Continuar com
                    Facebook
                  </Button>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <a href="/login" className="text-primary underline">
                  Faça login
                </a>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
