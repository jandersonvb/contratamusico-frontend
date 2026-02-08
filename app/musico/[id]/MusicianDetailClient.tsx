"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Loader2,
  MessageCircle,
  User,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { MusicianAvatar } from "@/components/ui/musician-avatar";
import { MusicianProfile } from "@/lib/types/musician";
import { createBooking } from "@/api/booking";
import { sendMessage } from "@/api/chat";
import { useUserStore } from "@/lib/stores/userStore";
import { useFavoriteStore } from "@/lib/stores/favoriteStore";
import { useSocket } from "@/hooks/useSocket";
import { useChatStore } from "@/lib/stores/chatStore";
import { MusicianSchema } from "@/app/components/StructuredData/MusicianSchema";

interface MusicianDetailClientProps {
  musician: MusicianProfile;
}

type TabType = "sobre" | "portfolio" | "avaliacoes" | "contato";

function getStarArray(rating: number) {
  const filled = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) => i < filled);
}

export default function MusicianDetailClient({ musician }: MusicianDetailClientProps) {
  const router = useRouter();
  const { isLoggedIn } = useUserStore();
  const { emit, isConnected } = useSocket();
  const { openFloatingChat, conversations } = useChatStore();

  const [activeTab, setActiveTab] = useState<TabType>("sobre");
  const [form, setForm] = useState({ date: "", eventType: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Favoritos via store centralizada
  const favorite = useFavoriteStore((s) => s.favoriteIds.has(musician.id));
  const isTogglingFavorite = useFavoriteStore((s) => s.togglingIds.has(musician.id));

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error("Você precisa estar logado para fazer uma solicitação");
      return;
    }

    if (!form.date || !form.eventType || !form.message) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);

    try {
      await createBooking({
        musicianProfileId: musician.id,
        eventDate: form.date,
        eventType: form.eventType,
        message: form.message,
      });

      toast.success(
        "Solicitação enviada com sucesso! O músico entrará em contato em breve."
      );
      setForm({ date: "", eventType: "", message: "" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao enviar solicitação";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      toast.error("Você precisa estar logado para favoritar");
      router.push("/login");
      return;
    }

    try {
      const added = await useFavoriteStore.getState().toggleFavorite(musician.id);
      toast.success(added ? "Adicionado aos favoritos" : "Removido dos favoritos");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao atualizar favorito";
      toast.error(message);
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
        .catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success("Link copiado para a área de transferência!");
      });
    }
  };

  /**
   * Abre o FloatingChat com a conversa do músico.
   * Se já existe uma conversa, abre direto. Senão, envia a primeira mensagem
   * para criar a conversa e depois abre o FloatingChat.
   */
  const handleStartChat = async () => {
    if (!isLoggedIn) {
      toast.error("Você precisa estar logado para enviar mensagens");
      router.push("/login");
      return;
    }

    // Verifica se já existe uma conversa com este músico
    const existingConversation = conversations.find(
      (c) => c.musicianProfileId === musician.id
    );

    if (existingConversation) {
      openFloatingChat(existingConversation.id);
      return;
    }

    // Se não existe, cria uma nova conversa enviando a primeira mensagem
    setIsStartingChat(true);
    const messageContent = `Olá ${musician.name}! Vi seu perfil e gostaria de conversar sobre contratar seus serviços.`;

    try {
      if (isConnected) {
        emit(
          "message:send",
          {
            musicianProfileId: musician.id,
            content: messageContent,
          },
          (response: unknown) => {
            const res = response as {
              success: boolean;
              error?: string;
              data?: { conversationId?: number };
              conversationId?: number;
            };
            if (res.success) {
              toast.success("Conversa iniciada!");
              // Tenta abrir o FloatingChat com o conversationId retornado
              const convId = res.data?.conversationId || res.conversationId;
              if (convId) {
                openFloatingChat(convId);
              } else {
                // Aguarda a conversa aparecer na store (via socket) e abre
                setTimeout(() => {
                  const conv = useChatStore.getState().conversations.find(
                    (c) => c.musicianProfileId === musician.id
                  );
                  if (conv) {
                    openFloatingChat(conv.id);
                  }
                }, 1000);
              }
            } else {
              toast.error(res.error || "Erro ao iniciar conversa");
            }
            setIsStartingChat(false);
          }
        );
      } else {
        // Fallback REST
        const result = await sendMessage({
          musicianId: musician.id,
          content: messageContent,
        });
        toast.success("Conversa iniciada!");
        // O resultado contém conversationId
        if (result.conversationId) {
          openFloatingChat(result.conversationId);
        } else {
          // Aguarda a conversa aparecer na store
          setTimeout(() => {
            const conv = useChatStore.getState().conversations.find(
              (c) => c.musicianProfileId === musician.id
            );
            if (conv) {
              openFloatingChat(conv.id);
            }
          }, 1000);
        }
        setIsStartingChat(false);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao iniciar conversa";
      if (
        !message.includes("Too Many Requests") &&
        !message.includes("ThrottlerException")
      ) {
        toast.error(message);
      }
      setIsStartingChat(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "sobre", label: "Sobre", icon: <User className="h-4 w-4" /> },
    { id: "portfolio", label: "Portfólio", icon: <ImageIcon className="h-4 w-4" /> },
    { id: "avaliacoes", label: "Avaliações", icon: <Star className="h-4 w-4" /> },
    { id: "contato", label: "Contato", icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <>
      <MusicianSchema musician={musician} />
      <div className="min-h-screen flex flex-col bg-background">
        {/* ====== PROFILE HEADER ====== */}
        <div className="container mx-auto px-4 pt-8">
          <div className="bg-card border rounded-xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="rounded-full ring-4 ring-primary/20 overflow-hidden shadow-lg">
                  <MusicianAvatar
                    src={musician.profileImageUrl}
                    name={musician.name}
                    size={200}
                    className="h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-full"
                  />
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-1 right-1 block h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-green-500 ring-3 ring-card" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left: Name, rating, info */}
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold truncate text-foreground">
                      {musician.name}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        {getStarArray(musician.rating).map((filled, idx) => (
                          <Star
                            key={idx}
                            className={`h-4 w-4 ${
                              filled
                                ? "text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                            fill={filled ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {musician.rating.toFixed(1)} ({musician.ratingCount} avaliações)
                      </span>
                    </div>

                    {/* Location and category */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 mt-2 text-sm text-muted-foreground">
                      {musician.category && (
                        <span className="font-medium text-foreground">
                          {musician.category}
                        </span>
                      )}
                      {musician.category && musician.location && (
                        <span className="text-muted-foreground/50">·</span>
                      )}
                      {musician.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {musician.location}
                        </span>
                      )}
                    </div>

                    {/* Genres */}
                    {musician.genres && musician.genres.length > 0 && (
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-2.5">
                        {musician.genres.map((genre) => (
                          <Badge
                            key={genre.id}
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {genre.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{musician.eventsCount || 0}+</span> eventos
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        Resp. em{" "}
                        <span className="font-medium text-foreground">{musician.responseTime || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{musician.satisfactionRate || 0}%</span> satisfação
                      </div>
                    </div>
                  </div>

                  {/* Right: Price and action buttons */}
                  <div className="flex flex-col items-center sm:items-end gap-3 flex-shrink-0">
                    {/* Price */}
                    <div className="text-center sm:text-right">
                      <span className="block text-xs text-muted-foreground">
                        A partir de
                      </span>
                      <span className="text-3xl font-bold text-primary">
                        R$ {musician.priceFrom != null ? musician.priceFrom.toFixed(0) : "--"}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleStartChat}
                        disabled={isStartingChat}
                        size="lg"
                        className="gap-2"
                      >
                        {isStartingChat ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Iniciando...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4" />
                            Enviar Mensagem
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={toggleFavorite}
                        disabled={isTogglingFavorite}
                        aria-label={
                          favorite
                            ? "Remover dos favoritos"
                            : "Adicionar aos favoritos"
                        }
                        className={favorite ? "text-red-500 border-red-200 hover:bg-red-50" : ""}
                      >
                        {favorite ? (
                          <Heart className="h-5 w-5 fill-current" />
                        ) : (
                          <HeartOff className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={shareProfile}
                        aria-label="Compartilhar perfil"
                      >
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ====== TABS NAVIGATION ====== */}
          <div className="mt-6 border-b">
            <nav className="-mb-px flex gap-0 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-[3px] transition-colors whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* ====== TAB CONTENT ====== */}
          <div className="py-6 pb-16">
            {/* SOBRE */}
            {activeTab === "sobre" && (
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                <div className="space-y-8">
                  {/* Bio */}
                  <section className="bg-card border rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Sobre
                    </h2>
                    {musician.bio ? (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {musician.bio}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Nenhuma biografia disponível.
                      </p>
                    )}
                  </section>

                  {/* Preview do Portfólio (últimos 4 itens) */}
                  {musician.portfolio && musician.portfolio.length > 0 && (
                    <section className="bg-card border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <ImageIcon className="h-5 w-5 text-primary" />
                          Portfólio
                        </h2>
                        <button
                          onClick={() => setActiveTab("portfolio")}
                          className="text-sm text-primary hover:underline"
                        >
                          Ver todos
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {musician.portfolio.slice(0, 4).map((item, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer"
                          >
                            {item.mediaType === "IMAGE" && item.mediaUrl ? (
                              <Image
                                src={item.mediaUrl}
                                alt={item.title || "Portfolio"}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                unoptimized
                              />
                            ) : item.mediaType === "VIDEO" && item.mediaUrl ? (
                              <>
                                <Image
                                  src={item.mediaUrl}
                                  alt={item.title || "Portfolio"}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                  <Play className="h-8 w-8 text-white" />
                                </div>
                              </>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
                                <Music className="h-8 w-8 mb-1" />
                                <span className="text-xs">{item.title}</span>
                              </div>
                            )}
                            {/* Overlay with title on hover */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-white text-xs font-medium truncate block">
                                {item.title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Preview de Avaliações (últimas 2) */}
                  <section className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Avaliações dos Clientes
                      </h2>
                      {musician.reviews && musician.reviews.length > 2 && (
                        <button
                          onClick={() => setActiveTab("avaliacoes")}
                          className="text-sm text-primary hover:underline"
                        >
                          Ver todas
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                      <span className="text-4xl font-bold text-primary">
                        {musician.rating.toFixed(1)}
                      </span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-0.5">
                          {getStarArray(musician.rating).map((filled, idx) => (
                            <Star
                              key={idx}
                              className={`h-4 w-4 ${
                                filled
                                  ? "text-yellow-400"
                                  : "text-muted-foreground/30"
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

                    {musician.reviews && musician.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {musician.reviews.slice(0, 2).map((review) => (
                          <div
                            key={review.id}
                            className="border rounded-lg p-4 space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                  {review.clientName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-medium text-sm block">
                                    {review.clientName}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {review.date}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-0.5">
                                {getStarArray(review.rating).map((filled, idx) => (
                                  <Star
                                    key={idx}
                                    className={`h-3 w-3 ${
                                      filled
                                        ? "text-yellow-400"
                                        : "text-muted-foreground/30"
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
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Nenhuma avaliação ainda.
                      </p>
                    )}
                  </section>
                </div>

                {/* Sidebar - Detalhes */}
                <aside className="space-y-6">
                  {/* Details Card */}
                  <div className="bg-card border rounded-lg p-6 space-y-3">
                    <h3 className="font-semibold text-lg mb-4">Detalhes</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-sm">
                        <Music className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-muted-foreground block text-xs">Instrumentos</span>
                          <span className="font-medium">
                            {musician.instruments
                              .map((inst) =>
                                typeof inst === "string" ? inst : inst.name
                              )
                              .join(", ")}
                          </span>
                        </div>
                      </div>
                      {musician.experience && (
                        <div className="flex items-start gap-3 text-sm">
                          <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-muted-foreground block text-xs">Experiência</span>
                            <span className="font-medium">{musician.experience}</span>
                          </div>
                        </div>
                      )}
                      {musician.equipment && (
                        <div className="flex items-start gap-3 text-sm">
                          <Music className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-muted-foreground block text-xs">Equipamentos</span>
                            <span className="font-medium">{musician.equipment}</span>
                          </div>
                        </div>
                      )}
                      {musician.availability && (
                        <div className="flex items-start gap-3 text-sm">
                          <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-muted-foreground block text-xs">Disponibilidade</span>
                            <span className="font-medium">{musician.availability}</span>
                          </div>
                        </div>
                      )}
                      {musician.location && (
                        <div className="flex items-start gap-3 text-sm">
                          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-muted-foreground block text-xs">Localização</span>
                            <span className="font-medium">{musician.location}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick contact CTA */}
                  <div className="bg-card border rounded-lg p-6 text-center">
                    <h3 className="font-semibold mb-2">Gostou do perfil?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Envie uma mensagem ou solicite um orçamento.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button onClick={handleStartChat} disabled={isStartingChat} className="w-full gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Enviar Mensagem
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab("contato")}
                      >
                        Solicitar Orçamento
                      </Button>
                    </div>
                  </div>
                </aside>
              </div>
            )}

            {/* PORTFÓLIO */}
            {activeTab === "portfolio" && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Portfólio</h2>
                {musician.portfolio && musician.portfolio.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {musician.portfolio.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-card border rounded-lg overflow-hidden group hover:shadow-md transition-shadow"
                      >
                        {item.mediaType === "IMAGE" && item.mediaUrl && (
                          <div className="relative aspect-video">
                            <Image
                              src={item.mediaUrl}
                              alt={item.title || "Portfolio item"}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                          </div>
                        )}
                        {item.mediaType === "VIDEO" && item.mediaUrl && (
                          <div className="relative aspect-video">
                            <Image
                              src={item.mediaUrl}
                              alt={item.title || "Portfolio item"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                                <Play className="h-8 w-8 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                        {item.mediaType === "AUDIO" && (
                          <div className="flex items-center gap-4 p-4 bg-muted/30">
                            <button
                              className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              aria-label="Ouvir áudio"
                            >
                              <Play className="h-5 w-5" />
                            </button>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-sm truncate">
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
                        <div className="p-4 space-y-1">
                          <h4 className="font-semibold text-sm">{item.title}</h4>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-3 pt-2">
                            {item.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {item.date}
                              </span>
                            )}
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
                ) : (
                  <div className="bg-card border rounded-lg p-12 text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Nenhum item no portfólio ainda.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* AVALIAÇÕES */}
            {activeTab === "avaliacoes" && (
              <div>
                <h2 className="text-xl font-semibold mb-6">
                  Avaliações dos Clientes
                </h2>

                {/* Rating summary */}
                <div className="bg-card border rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="text-5xl font-bold text-primary block">
                        {musician.rating.toFixed(1)}
                      </span>
                      <div className="flex items-center gap-0.5 mt-1 justify-center">
                        {getStarArray(musician.rating).map((filled, idx) => (
                          <Star
                            key={idx}
                            className={`h-4 w-4 ${
                              filled
                                ? "text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                            fill={filled ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground mt-1 block">
                        {musician.ratingCount} avaliações
                      </span>
                    </div>
                  </div>
                </div>

                {musician.reviews && musician.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {musician.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-card border rounded-lg p-5 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {review.clientName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-medium text-sm block">
                                {review.clientName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {review.date}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {getStarArray(review.rating).map((filled, idx) => (
                              <Star
                                key={idx}
                                className={`h-4 w-4 ${
                                  filled
                                    ? "text-yellow-400"
                                    : "text-muted-foreground/30"
                                }`}
                                fill={filled ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.content}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                          <Calendar className="h-3 w-3" /> {review.event}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card border rounded-lg p-12 text-center">
                    <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Nenhuma avaliação ainda.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CONTATO */}
            {activeTab === "contato" && (
              <div className="max-w-xl mx-auto">
                <div className="bg-card border rounded-lg p-6 sm:p-8">
                  <h2 className="text-xl font-semibold mb-2">
                    Solicitar Orçamento
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Preencha o formulário abaixo para solicitar um orçamento de{" "}
                    <span className="font-medium text-foreground">{musician.name}</span>.
                  </p>
                  <form onSubmit={handleSubmitContact} className="space-y-5">
                    <div className="space-y-1.5">
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
                    <div className="space-y-1.5">
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
                    <div className="space-y-1.5">
                      <label htmlFor="message" className="text-sm font-medium">
                        Mensagem
                      </label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={(e) =>
                          handleFormChange("message", e.target.value)
                        }
                        placeholder="Conte mais sobre seu evento, local, horário, tipo de música que deseja..."
                        rows={5}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting || !isLoggedIn}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : !isLoggedIn ? (
                        "Faça login para solicitar"
                      ) : (
                        "Enviar Solicitação"
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
