"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/lib/stores/userStore";
import { useChatStore } from "@/lib/stores/chatStore";
import { ConversationList } from "./components/ConversationList";
import { ChatWindow } from "./components/ChatWindow";
import { Loader2 } from "lucide-react";
import type { Conversation } from "@/api/chat";
import { fetchMusicianById } from "@/api/musician";

export interface PendingMusician {
  id?: number;
  userId: number;
  name: string;
  profileImageUrl?: string | null;
}

/**
 * Página exportada com Suspense (necessário para useSearchParams no App Router)
 */
export default function MensagensPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <MensagensContent />
    </Suspense>
  );
}

function MensagensContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useUserStore();
  const {
    conversations,
    selectedConversationId,
    selectConversation,
  } = useChatStore();

  // Controle de visualização mobile (lista vs chat)
  const [showChat, setShowChat] = useState(false);

  // Músico pendente (nova conversa via ?musico=X)
  const [pendingMusician, setPendingMusician] = useState<PendingMusician | null>(null);
  const [loadingMusician, setLoadingMusician] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Evitar re-processar o mesmo param
  const processedConversationRef = useRef<string | null>(null);
  
  // Trata query params ?musico=X e ?usuario=Y
  const musicoParam = searchParams.get("musico");
  const usuarioParam = searchParams.get("usuario");
  const nomeParam = searchParams.get("nome");
  const fotoParam = searchParams.get("foto");

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && !isLoggedIn) {
      router.push("/login");
    }
  }, [hasHydrated, isLoggedIn, router]);

  useEffect(() => {
    if ((!musicoParam && !usuarioParam) || !isLoggedIn || !hasHydrated) return;

    const queryKey = musicoParam
      ? `musico:${musicoParam}`
      : usuarioParam
        ? `usuario:${usuarioParam}`
        : null;

    if (!queryKey || processedConversationRef.current === queryKey) return;

    const openPendingConversation = (pending: PendingMusician) => {
      const existing = conversations.find(
        (c) =>
          c.otherParty?.id === pending.userId ||
          (pending.id ? c.musicianProfileId === pending.id : false)
      );

      if (existing) {
        selectConversation(existing.id);
        setShowChat(true);
        setPendingMusician(null);
        router.replace("/mensagens", { scroll: false });
        return;
      }

      setPendingMusician(pending);
      setShowChat(true);
    };

    if (musicoParam) {
      const musicianId = Number(musicoParam);
      if (isNaN(musicianId) || musicianId <= 0) return;

      processedConversationRef.current = queryKey;
      setLoadingMusician(true);

      // Busca os dados do músico para mapear musicianProfileId -> userId
      fetchMusicianById(musicianId)
        .then((musician) => {
          openPendingConversation({
            id: musician.id,
            userId: musician.userId ?? musician.id,
            name: musician.name,
            profileImageUrl: musician.profileImageUrl,
          });
        })
        .catch((err) => {
          console.error("[Mensagens] Erro ao buscar músico:", err);
          setPendingMusician(null);
        })
        .finally(() => setLoadingMusician(false));

      return;
    }

    const recipientUserId = Number(usuarioParam);
    if (isNaN(recipientUserId) || recipientUserId <= 0) return;

    processedConversationRef.current = queryKey;
    openPendingConversation({
      userId: recipientUserId,
      name: nomeParam?.trim() || "Usuário",
      profileImageUrl: fotoParam || undefined,
    });
  }, [
    musicoParam,
    usuarioParam,
    nomeParam,
    fotoParam,
    isLoggedIn,
    hasHydrated,
    conversations,
    selectConversation,
    router,
  ]);

  // Conversa selecionada
  const selectedConversation: Conversation | null =
    conversations.find((c) => c.id === selectedConversationId) ?? null;

  // Seleciona uma conversa
  const handleSelectConversation = useCallback(
    (id: number) => {
      selectConversation(id);
      setPendingMusician(null);
      setShowChat(true);
    },
    [selectConversation]
  );

  // Mobile: volta pra lista
  const handleBack = useCallback(() => {
    setShowChat(false);
    selectConversation(null);
    setPendingMusician(null);
    processedConversationRef.current = null;
    router.replace("/mensagens", { scroll: false });
  }, [selectConversation, router]);

  // Callback quando conversa é criada a partir do pendingMusician
  const handleConversationCreated = useCallback(
    (conversationId: number) => {
      setPendingMusician(null);
      processedConversationRef.current = null;
      selectConversation(conversationId);
      router.replace("/mensagens", { scroll: false });
    },
    [selectConversation, router]
  );

  // Aguarda hidratação do Zustand antes de renderizar
  if (!hasHydrated || loadingMusician) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Container principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Lista de conversas */}
        <div
          className={`w-full lg:w-[360px] xl:w-[400px] border-r bg-background flex flex-col shrink-0 ${
            showChat ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Header da sidebar */}
          <div className="px-4 py-3 border-b">
            <h1 className="text-xl font-bold">Mensagens</h1>
          </div>

          {/* Lista de conversas */}
          <div className="flex-1 overflow-hidden">
            <ConversationList
              onSelectConversation={handleSelectConversation}
            />
          </div>
        </div>

        {/* Área do chat */}
        <div
          className={`flex-1 flex flex-col bg-background ${
            !showChat ? "hidden lg:flex" : "flex"
          }`}
        >
          <ChatWindow
            conversation={selectedConversation}
            pendingMusician={pendingMusician}
            onBack={handleBack}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>
    </div>
  );
}
