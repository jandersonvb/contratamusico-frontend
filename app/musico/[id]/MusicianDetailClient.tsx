"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Star,
  Heart,
  HeartOff,
  Share2,
  Calendar,
  Clock,
  CheckCircle,
  MapPin,
  Music,
  Play,
} from "lucide-react";
import Image from "next/image";
import { MusicianDetail } from "@/lib/musicianDetails";

interface MusicianDetailClientProps {
  musician: MusicianDetail;
}

/**
 * Converts a numeric rating into an array of booleans indicating
 * whether each of the five stars should be filled or not.
 */
function getStarArray(rating: number) {
  const filled = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) => i < filled);
}

export default function MusicianDetailClient({ musician }: MusicianDetailClientProps) {
  // State for contact form
  const [form, setForm] = useState({ date: "", eventType: "", message: "" });
  const [favorite, setFavorite] = useState(false);

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.eventType || !form.message) {
      toast.error("Preencha todos os campos");
      return;
    }
    toast.success(
      "Mensagem enviada com sucesso! O músico entrará em contato em breve."
    );
    setForm({ date: "", eventType: "", message: "" });
  };

  const toggleFavorite = () => {
    setFavorite((prev) => !prev);
    if (favorite) {
      toast.info("Removido dos favoritos");
    } else {
      toast.success("Adicionado aos favoritos");
    }
  };

  const shareProfile = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `${musician.name} - ${musician.category}`,
          text: "Confira o perfil deste músico incrível!",
          url: window.location.href,
        })
        .catch(() => { });
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success("Link copiado para a área de transferência!");
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <section className="container mx-auto px-4 py-8 flex-1">
        {/* Profile Header */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Avatar and basic info */}
            <div className="flex items-start gap-4 md:col-span-2">
              <div className="relative">
                <Image
                  src={
                    // If the musician has an avatar property in future data, use it
                    musician.portfolio[0]?.image ||
                    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
                  }
                  alt={musician.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover h-20 w-20"
                />
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-card"></span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{musician.name}</h1>
                <p className="text-sm text-muted-foreground mb-1">
                  {musician.category}
                </p>
                {/* Rating */}
                <div className="flex items-center gap-1">
                  {getStarArray(musician.rating).map((filled, idx) => (
                    <Star
                      key={idx}
                      className={`h-4 w-4 ${filled ? "text-yellow-400" : "text-muted-foreground"
                        }`}
                      fill={filled ? "currentColor" : "none"}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">
                    {musician.rating.toFixed(1)} ({musician.ratingCount}{" "}
                    avaliações)
                  </span>
                </div>
                {/* Location and tags */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {musician.location}
                  {musician.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* Price and actions */}
            <div className="flex flex-col items-start md:items-end gap-4">
              <div className="text-md md:text-right">
                <span className="block text-xs text-muted-foreground">
                  A partir de
                </span>
                <span className="text-2xl font-bold text-primary">
                  R$ {musician.priceFrom.toFixed(0)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => toast.info("Iniciar conversa com o músico")}
                >
                  Entrar em Contato
                </Button>
                <Button
                  variant="outline"
                  onClick={toggleFavorite}
                  aria-label={
                    favorite
                      ? "Remover dos favoritos"
                      : "Adicionar aos favoritos"
                  }
                >
                  {favorite ? (
                    <Heart className="h-5 w-5" />
                  ) : (
                    <HeartOff className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={shareProfile}
                  aria-label="Compartilhar perfil"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {musician.events}+ eventos
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Resp. em{" "}
                  {musician.responseTime}
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> {musician.satisfaction}%
                  satisfação
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Profile Content and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Main content */}
          <div className="space-y-10">
            {/* About */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Sobre</h2>
              {musician.about.map((paragraph, idx) => (
                <p key={idx} className="text-sm text-muted-foreground mb-2">
                  {paragraph}
                </p>
              ))}
            </section>
            {/* Portfolio */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Portfólio</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {musician.portfolio.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-card border rounded-lg overflow-hidden flex flex-col"
                  >
                    {item.type === "image" && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={600}
                        height={400}
                        className="h-40 w-full object-cover"
                      />
                    )}
                    {item.type === "video" && (
                      <div className="relative h-40 w-full">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={600}
                          height={400}
                          className="h-40 w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play className="h-10 w-10 text-white" />
                        </div>
                      </div>
                    )}
                    {item.type === "audio" && (
                      <div className="flex items-center gap-4 p-4">
                        <button
                          className="p-2 rounded-full bg-primary/10 text-primary"
                          aria-label="Ouvir áudio"
                        >
                          <Play className="h-5 w-5" />
                        </button>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {item.title}
                          </span>
                          {item.genre && (
                            <span className="text-xs text-muted-foreground">
                              {item.genre}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="p-4 space-y-1 flex-1 flex flex-col">
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground flex-1">
                        {item.description}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {item.date}
                        </span>
                        {item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {item.location}
                          </span>
                        )}
                        {item.genre && (
                          <span className="flex items-center gap-1">
                            <Music className="h-3 w-3" /> {item.genre}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {/* Reviews */}
            <section>
              <h2 className="text-xl font-semibold mb-3">
                Avaliações dos Clientes
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-bold text-primary">
                  {musician.rating.toFixed(1)}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    {getStarArray(musician.rating).map((filled, idx) => (
                      <Star
                        key={idx}
                        className={`h-4 w-4 ${filled ? "text-yellow-400" : "text-muted-foreground"
                          }`}
                        fill={filled ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {musician.ratingCount} avaliações
                  </span>
                </div>
              </div>
              <div className="space-y-6">
                {musician.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-card border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Image
                          src={review.avatar}
                          alt={review.name}
                          width={40}
                          height={40}
                          className="rounded-full h-10 w-10 object-cover"
                        />
                        <div>
                          <span className="font-medium text-sm">
                            {review.name}
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {review.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {getStarArray(review.rating).map((filled, idx) => (
                          <Star
                            key={idx}
                            className={`h-3 w-3 ${filled
                                ? "text-yellow-400"
                                : "text-muted-foreground"
                              }`}
                            fill={filled ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {review.content}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {review.event}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4">
                Ver Todas as Avaliações
              </Button>
            </section>
          </div>
          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Contact Card */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Entre em Contato</h3>
              <form onSubmit={handleSubmitContact} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="eventDate" className="text-sm font-medium">
                    Data do Evento
                  </label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={form.date}
                    onChange={(e) => handleFormChange("date", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="eventType" className="text-sm font-medium">
                    Tipo de Evento
                  </label>
                  <Select
                    value={form.eventType}
                    onValueChange={(value) =>
                      handleFormChange("eventType", value)
                    }
                  >
                    <SelectTrigger id="eventType" className="w-full">
                      {form.eventType
                        ? (() => {
                          switch (form.eventType) {
                            case "casamento":
                              return "Casamento";
                            case "aniversario":
                              return "Aniversário";
                            case "corporativo":
                              return "Evento Corporativo";
                            case "festa":
                              return "Festa";
                            case "outro":
                              return "Outro";
                            default:
                              return "Selecione o tipo";
                          }
                        })()
                        : "Selecione o tipo"}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casamento">Casamento</SelectItem>
                      <SelectItem value="aniversario">Aniversário</SelectItem>
                      <SelectItem value="corporativo">
                        Evento Corporativo
                      </SelectItem>
                      <SelectItem value="festa">Festa</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="message" className="text-sm font-medium">
                    Mensagem
                  </label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) =>
                      handleFormChange("message", e.target.value)
                    }
                    placeholder="Conte mais sobre seu evento..."
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Enviar Mensagem
                </Button>
              </form>
            </div>
            {/* Details Card */}
            <div className="bg-card border rounded-lg p-6 space-y-2">
              <h3 className="font-semibold mb-4">Detalhes</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Instrumentos</span>
                <span>{musician.instruments.join(", ")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Experiência</span>
                <span>{musician.experience}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Equipamentos</span>
                <span className="text-right">{musician.equipment}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Disponibilidade</span>
                <span>{musician.availability}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Área de Atuação</span>
                <span>{musician.area}</span>
              </div>
            </div>
            {/* Similar Musicians */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Músicos Similares</h3>
              <div className="space-y-4">
                {musician.similar.map((sm) => (
                  <div key={sm.id} className="flex items-center gap-3">
                    <Image
                      src={sm.image}
                      alt={sm.name}
                      width={40}
                      height={40}
                      className="rounded-full h-10 w-10 object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{sm.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {sm.category}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star
                        className="h-3 w-3 text-yellow-400"
                        fill="currentColor"
                      />
                      {sm.rating.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

