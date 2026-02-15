"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { DynamicFAQ } from "./components/DynamicFAQ";
import { createContact } from "@/api/contact";

/**
 * Contact page replicating the structure of contato.html. It features
 * a hero header, a contact form with validation, a sidebar with
 * alternative contact methods, an FAQ section using an accordion and
 * a simple map placeholder. The form submission triggers a toast
 * notification to mimic a successful send action.
 */
export default function ContatoPage() {
  const googleMapsUrl =
    "https://www.google.com/maps/search/?api=1&query=Avenida+Padre+Lourenco+da+Costa,+3415,+Morro+Grande,+Itajuba,+MG,+37502-710";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    newsletter: false,
  });

  const subjects = [
    { value: "suporte", label: "Suporte Técnico" },
    { value: "duvidas", label: "Dúvidas sobre Planos" },
    { value: "musico", label: "Sou Músico - Preciso de Ajuda" },
    { value: "cliente", label: "Sou Cliente - Preciso de Ajuda" },
    { value: "parceria", label: "Proposta de Parceria" },
    { value: "imprensa", label: "Imprensa" },
    { value: "outro", label: "Outro" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubjectChange = (value: string) => {
    setForm((prev) => ({ ...prev, subject: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simple validation
    if (
      !form.subject ||
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.message
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      setIsSubmitting(false);
      return;
    }

    try {
      await createContact({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.subject,
        message: form.message,
      });

      toast.success("Mensagem enviada com sucesso! Responderemos em breve.");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        newsletter: false,
      });
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao enviar sua mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="bg-primary/5 border-b py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Entre em Contato</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Estamos aqui para ajudar você a encontrar o músico perfeito ou a
            divulgar seu talento musical
          </p>
        </div>
      </section>
      {/* Contact form and info */}
      <section className="container mx-auto px-4 py-8 sm:py-12 flex-1">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Form */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Envie sua Mensagem</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
              Preencha o formulário abaixo e entraremos em contato em até 24
              horas
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName">Nome *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Sobrenome *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
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
              </div>
              <div className="space-y-1">
                <Label htmlFor="subject">Assunto *</Label>
                <Select
                  value={form.subject}
                  onValueChange={handleSubjectChange}
                >
                  <SelectTrigger id="subject" className="w-full">
                    {form.subject
                      ? subjects.find((s) => s.value === form.subject)?.label
                      : "Selecione o assunto"}
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Descreva sua dúvida ou solicitação..."
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="newsletter"
                  checked={form.newsletter}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, newsletter: !!checked }))
                  }
                />
                <label htmlFor="newsletter" className="text-sm">
                  Quero receber novidades e dicas por e-mail
                </label>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
              </Button>
            </form>
          </div>
          {/* Contact info */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                Outras Formas de Contato
              </h2>
              <div className="space-y-4 text-sm sm:text-base">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">E-mail</h4>
                    <p>contato@contratamusico.com</p>
                    <span className="text-xs text-muted-foreground">
                      Resposta em até 24h
                    </span>
                  </div>
                </div>
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Telefone</h4>
                    <p>(35) 9 9810-2070</p>
                    <span className="text-xs text-muted-foreground block mb-2">
                      Seg–Sex: 9h às 18h
                    </span>
                  </div>
                </div>
                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">WhatsApp</h4>
                    <p>(35) 9 9810-2070</p>
                    <span className="text-xs text-muted-foreground">
                      Seg–Sex: 9h às 18h
                    </span>
                  </div>
                </div>
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Endereço</h4>
                    <p>
                      Avenida Padre Lourenço da Costa, 3415
                      <br />
                      Morro Grande – Itajubá/MG
                      <br />
                      CEP: 37502-710
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Social */}
            <div>
              <h3 className="font-medium mb-2">Siga-nos nas Redes Sociais</h3>
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
      </section>
      {/* FAQ */}
      <section className="bg-muted/50 border-t py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Perguntas Frequentes</h2>
          <DynamicFAQ />
        </div>
      </section>
      {/* Map */}
      <section className="py-8 sm:py-12 border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Nossa Localização</h2>
          <div className="bg-card border rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="p-2 sm:p-3 rounded-full bg-primary/10 text-primary shrink-0">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="text-sm sm:text-base">
                <p>Av. Padre Lourenço da Costa, 3415 – Morro Grande</p>
                <p>Itajubá/MG – CEP: 37502-710</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                Ver no Google Maps
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
