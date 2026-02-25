"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { Star, MapPin, Camera, Loader2, CreditCard, ExternalLink, Calendar, AlertCircle, Upload, Trash2, X, Music, Video, FileAudio } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useUserStore } from "@/lib/stores/userStore";
import { UserType } from "@/lib/types/user";
import { getMySubscription, cancelSubscription, reactivateSubscription, createPortalSession } from "@/api/payment";
import type { SubscriptionResponse } from "@/api/payment";
import {
  updateMyMusicianGenres,
  updateMyMusicianInstruments,
  updateMyMusicianProfile,
} from "@/api/musician";
import {
  getMusicianReviews,
  getMusicianReviewStats,
  ReviewApiError,
  type ReviewItem,
  type ReviewStatsResponse,
} from "@/api/review";
import { uploadAvatar } from "@/api/user";
import { uploadPortfolioFile, getMyPortfolio, deletePortfolioItem } from "@/api/portfolio";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { useGenreStore } from "@/lib/stores/genreStore";
import { useInstrumentStore } from "@/lib/stores/instrumentStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ProfileTab =
  | "info-pessoais"
  | "info-musicais"
  | "portfolio"
  | "avaliacoes"
  | "assinatura"
  | "configuracoes";

const PROFILE_TABS: ProfileTab[] = [
  "info-pessoais",
  "info-musicais",
  "portfolio",
  "avaliacoes",
  "assinatura",
  "configuracoes",
];

const CLIENT_PROFILE_TABS: ProfileTab[] = [
  "info-pessoais",
  "configuracoes",
];

const PROFILE_TAB_LABELS: Record<ProfileTab, string> = {
  "info-pessoais": "Informações Pessoais",
  "info-musicais": "Informações Musicais",
  portfolio: "Portfólio",
  avaliacoes: "Avaliações",
  assinatura: "Assinatura",
  configuracoes: "Configurações",
};

/**
 * Profile page that allows the logged in musician to view and edit their
 * personal and musical information. It also shows a summary card with
 * statistics and provides navigation between different sections. The
 * editing states for each tab are controlled independently and can
 * toggle between read‑only and editable modes.
 */
export default function PerfilPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, isUpdating, updateUser, fetchUser } = useUserStore();
  const { genres, fetchGenres } = useGenreStore();
  const { instruments, fetchInstruments } = useInstrumentStore();

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, isLoading, router]);

  // Buscar dados atualizados do usuário ao carregar a página
  useEffect(() => {
    if (isLoggedIn) {
      fetchUser();
    }
  }, [isLoggedIn, fetchUser]);

  // Dados do perfil de músico (se existir)
  const musicianProfile = user?.musicianProfile;
  const isMusician = user?.userType === UserType.MUSICIAN;

  // Tabs state
  const [activeTab, setActiveTab] = useState<ProfileTab>("info-pessoais");
  const availableTabs = useMemo<ProfileTab[]>(() => {
    if (!user) {
      return PROFILE_TABS;
    }

    return isMusician ? PROFILE_TABS : CLIENT_PROFILE_TABS;
  }, [isMusician, user]);

  // Subscription state
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionResponse | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Editing states
  const [editPersonal, setEditPersonal] = useState(false);
  const [editMusical, setEditMusical] = useState(false);

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Portfolio state
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    genre: "",
  });

  const currentPlan = subscriptionData?.subscription?.plan;

  // Limites (se maxPhotos for null, é ilimitado)
  const maxPhotosLimit = currentPlan?.maxPhotos ?? 3; // Fallback para 3 se não carregar
  const maxVideosLimit = currentPlan?.maxVideos ?? 0; // Fallback para 0 se não carregar



  const photosCount = portfolioItems.filter(item => item.type === 'IMAGE').length;
  const videosCount = portfolioItems.filter(item => ['VIDEO', 'AUDIO'].includes(item.type)).length;

  // Verifica se pode fazer upload
  const canUploadPhoto = currentPlan?.maxPhotos === null || photosCount < maxPhotosLimit;
  // Para vídeos, verificamos se é ilimitado (null) ou se o contador é menor que o limite
  const canUploadVideoAudio = currentPlan?.maxVideos === null || (currentPlan?.maxVideos !== undefined && videosCount < maxVideosLimit);

  const planName = currentPlan?.title || "Básico";


  // Form states - inicializado vazio, será preenchido pelo useEffect
  const [personalForm, setPersonalForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
  });

  const [musicalForm, setMusicalForm] = useState({
    instruments: [] as string[],
    genres: [] as string[],
    bio: "",
    experience: "",
    priceRange: "",
    equipment: "",
  });

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewStats, setReviewStats] = useState<ReviewStatsResponse | null>(null);
  const [reviewStatsError, setReviewStatsError] = useState<string | null>(null);

  // Atualizar formulários quando os dados do usuário carregarem
  useEffect(() => {
    if (user) {
      setPersonalForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
        state: user.state || "",
      });

      if (musicianProfile) {
        setMusicalForm({
          instruments: musicianProfile.instruments?.map((i) => i.slug) || [],
          genres: musicianProfile.genres?.map((g) => g.slug) || [],
          bio: musicianProfile.bio || "",
          experience: musicianProfile.experience || "",
          priceRange: musicianProfile.priceFrom ? getPriceRangeFromValue(musicianProfile.priceFrom) : "",
          equipment: musicianProfile.equipment || "",
        });
      }
    }
  }, [user, musicianProfile]);

  useEffect(() => {
    if (!isMusician) return;
    fetchGenres();
    fetchInstruments();
  }, [isMusician, fetchGenres, fetchInstruments]);

  useEffect(() => {
    const syncTabFromUrl = () => {
      const tabParam = new URLSearchParams(window.location.search).get("tab");
      if (tabParam && availableTabs.includes(tabParam as ProfileTab)) {
        setActiveTab(tabParam as ProfileTab);
      }
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, [availableTabs]);

  useEffect(() => {
    if (!user) return;
    if (availableTabs.includes(activeTab)) return;

    const fallbackTab = availableTabs[0] ?? "info-pessoais";
    setActiveTab(fallbackTab);
    router.replace(`/perfil?tab=${fallbackTab}`, { scroll: false });
  }, [activeTab, availableTabs, router, user]);

  const fetchSubscriptionData = useCallback(async () => {
    if (!isMusician) {
      setSubscriptionData({ hasSubscription: false });
      return;
    }

    setIsLoadingSubscription(true);
    try {
      const data = await getMySubscription();
      setSubscriptionData(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar assinatura";
      toast.error(message);
    } finally {
      setIsLoadingSubscription(false);
    }
  }, [isMusician]);

  // Buscar dados de assinatura quando acessar a aba
  useEffect(() => {
    if (activeTab === "assinatura" && isLoggedIn && isMusician && !subscriptionData) {
      fetchSubscriptionData();
    }
  }, [activeTab, isLoggedIn, isMusician, subscriptionData, fetchSubscriptionData]);

  // Buscar portfólio e assinatura quando acessar a aba de portfólio
  useEffect(() => {
    if (activeTab === "portfolio" && isLoggedIn && isMusician) {
      fetchPortfolio();
      if (!subscriptionData) {
        fetchSubscriptionData();
      }
    }
  }, [activeTab, isLoggedIn, isMusician, subscriptionData, fetchSubscriptionData]);

  const fetchReviews = useCallback(async () => {
    if (!musicianProfile?.id) return;

    setIsLoadingReviews(true);
    try {
      const data = await getMusicianReviews(musicianProfile.id, reviewsPage, 10);
      setReviews(data.data);
      setReviewsTotalPages(data.pagination.totalPages || 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar avaliações";
      toast.error(message);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [musicianProfile?.id, reviewsPage]);

  const fetchReviewStats = useCallback(async () => {
    if (!musicianProfile?.id) return;

    setReviewStatsError(null);
    try {
      const data = await getMusicianReviewStats(musicianProfile.id);
      setReviewStats(data);
    } catch (error) {
      setReviewStats(null);
      if (error instanceof ReviewApiError && error.status === 403) {
        setReviewStatsError("Seu plano atual não inclui estatísticas detalhadas.");
        return;
      }

      const message = error instanceof Error ? error.message : "Erro ao carregar estatísticas";
      setReviewStatsError(message);
      toast.error(message);
    }
  }, [musicianProfile?.id]);

  useEffect(() => {
    if (activeTab === "avaliacoes" && isLoggedIn && isMusician) {
      fetchReviews();
    }
  }, [activeTab, isLoggedIn, isMusician, fetchReviews]);

  useEffect(() => {
    if (activeTab === "avaliacoes" && isLoggedIn && isMusician) {
      fetchReviewStats();
    }
  }, [activeTab, isLoggedIn, isMusician, fetchReviewStats]);

  const fetchPortfolio = async () => {
    setIsLoadingPortfolio(true);
    try {
      const items = await getMyPortfolio();
      setPortfolioItems(items);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar portfólio";
      toast.error(message);
    } finally {
      setIsLoadingPortfolio(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsProcessingAction(true);
    try {
      const response = await cancelSubscription();
      toast.success(response.message);
      await fetchSubscriptionData(); // Recarregar dados
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cancelar assinatura";
      toast.error(message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsProcessingAction(true);
    try {
      const response = await reactivateSubscription();
      toast.success(response.message);
      await fetchSubscriptionData(); // Recarregar dados
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao reativar assinatura";
      toast.error(message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleOpenPortal = async () => {
    setIsProcessingAction(true);
    try {
      const { portalUrl } = await createPortalSession(window.location.href);
      window.location.href = portalUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao abrir portal";
      toast.error(message);
      setIsProcessingAction(false);
    }
  };

  // Função auxiliar para converter priceFrom em faixa de preço
  const getPriceRangeFromValue = (value: number): string => {
    if (value >= 800) return "800+";
    if (value >= 500) return "500-800";
    if (value >= 300) return "300-500";
    return "0-300";
  };

  const getPriceFromRange = (priceRange: string): number | undefined => {
    if (!priceRange) return undefined;
    const match = priceRange.match(/\d+/);
    if (!match) return undefined;
    return Number(match[0]);
  };

  // Options for selects and checkboxes
  const instrumentOptions = useMemo(() => {
    if (instruments.length > 0) {
      return instruments.map((item) => ({
        value: item.slug,
        label: item.name,
      }));
    }

    return [
      { value: "violao", label: "Violão" },
      { value: "guitarra", label: "Guitarra" },
      { value: "vocal", label: "Vocal" },
      { value: "piano", label: "Piano" },
      { value: "bateria", label: "Bateria" },
      { value: "saxofone", label: "Saxofone" },
    ];
  }, [instruments]);

  const genreOptions = useMemo(() => {
    if (genres.length > 0) {
      return genres.map((item) => ({
        value: item.slug,
        label: item.name,
      }));
    }

    return [
      { value: "mpb", label: "MPB" },
      { value: "bossa-nova", label: "Bossa Nova" },
      { value: "pop", label: "Pop" },
      { value: "rock", label: "Rock" },
      { value: "jazz", label: "Jazz" },
      { value: "samba", label: "Samba" },
    ];
  }, [genres]);

  const experienceOptions = [
    { value: "iniciante", label: "Iniciante (0-2 anos)" },
    { value: "intermediario", label: "Intermediário (2-5 anos)" },
    { value: "profissional", label: "Profissional (5+ anos)" },
  ];
  const priceOptions = [
    { value: "0-300", label: "Até R$ 300" },
    { value: "300-500", label: "R$ 300 - R$ 500" },
    { value: "500-800", label: "R$ 500 - R$ 800" },
    { value: "800+", label: "Mais de R$ 800" },
  ];

  const handlePersonalChange = (
    field: keyof typeof personalForm,
    value: string
  ) => {
    setPersonalForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMusicalCheckbox = (
    field: "instruments" | "genres",
    option: string,
    checked: boolean
  ) => {
    setMusicalForm((prev) => {
      const arr = new Set(prev[field]);
      if (checked) arr.add(option);
      else arr.delete(option);
      return { ...prev, [field]: Array.from(arr) };
    });
  };

  const handleMusicalChange = (
    field: keyof typeof musicalForm,
    value: string
  ) => {
    setMusicalForm((prev) => ({ ...prev, [field]: value }));
  };

  const savePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        firstName: personalForm.firstName,
        lastName: personalForm.lastName,
        phone: personalForm.phone,
        city: personalForm.city,
        state: personalForm.state,
      });
      toast.success("Informações pessoais atualizadas!");
      setEditPersonal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar";
      toast.error(message);
    }
  };

  const saveMusicalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMyMusicianProfile({
        bio: musicalForm.bio || undefined,
        experience: musicalForm.experience || undefined,
        equipment: musicalForm.equipment || undefined,
        priceFrom: getPriceFromRange(musicalForm.priceRange),
      });

      await Promise.all([
        updateMyMusicianGenres(musicalForm.genres),
        updateMyMusicianInstruments(musicalForm.instruments),
      ]);

      await fetchUser();
      toast.success("Informações musicais atualizadas!");
      setEditMusical(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar informações musicais";
      toast.error(message);
    }
  };

  const handleTabChange = (tab: ProfileTab) => {
    if (!availableTabs.includes(tab)) {
      return;
    }

    setActiveTab(tab);
    router.replace(`/perfil?tab=${tab}`, { scroll: false });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      await fetchUser(); // Recarregar dados do usuário
      toast.success("Foto de perfil atualizada com sucesso!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao fazer upload";
      toast.error(message);
    } finally {
      setIsUploadingAvatar(false);
      // Limpar o input para permitir upload do mesmo arquivo novamente
      e.target.value = '';
    }
  };

  const handlePortfolioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!uploadForm.title.trim()) {
      toast.error("Por favor, informe um título para o item");
      return;
    }

    // Verificar restrições de plano
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    const isImage = imageTypes.includes(file.type);
    const isVideoOrAudio = videoTypes.includes(file.type) || audioTypes.includes(file.type);

    if (isImage && !canUploadPhoto) {
      toast.error(`Você atingiu o limite de ${maxPhotosLimit} fotos do plano ${planName}. Faça upgrade para adicionar mais.`);
      e.target.value = '';
      return;
    }

    if (isVideoOrAudio && !canUploadVideoAudio) {
      toast.error(
        maxVideosLimit === 0
          ? `Seu plano atual (${planName}) não permite vídeos/áudios. Faça upgrade.`
          : `Você atingiu o limite de ${maxVideosLimit} vídeos/áudios do plano ${planName}.`
      );
      e.target.value = '';
      return;
    }

    setIsUploadingPortfolio(true);
    try {
      await uploadPortfolioFile(file, {
        title: uploadForm.title,
        description: uploadForm.description || undefined,
        date: uploadForm.date || undefined,
        location: uploadForm.location || undefined,
        genre: uploadForm.genre || undefined,
      });

      toast.success("Arquivo adicionado ao portfólio com sucesso!");
      setShowUploadModal(false);
      setUploadForm({
        title: "",
        description: "",
        date: "",
        location: "",
        genre: "",
      });
      await fetchPortfolio(); // Recarregar portfólio
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao fazer upload";
      toast.error(message);
    } finally {
      setIsUploadingPortfolio(false);
      e.target.value = '';
    }
  };

  const handleDeletePortfolioItem = async (itemId: number) => {
    if (!confirm("Tem certeza que deseja remover este item do portfólio?")) {
      return;
    }

    try {
      await deletePortfolioItem(itemId);
      toast.success("Item removido com sucesso!");
      await fetchPortfolio(); // Recarregar portfólio
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao remover item";
      toast.error(message);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-5 w-5" />;
      case 'AUDIO':
        return <FileAudio className="h-5 w-5" />;
      default:
        return <Music className="h-5 w-5" />;
    }
  };

  // Loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <section className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Profile card */}
            <div className="bg-card border rounded-lg p-6 text-center">
              <button
                type="button"
                aria-label="Alterar foto de perfil"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={isUploadingAvatar}
                className="relative inline-block mb-4 group cursor-pointer disabled:cursor-not-allowed"
              >
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
                {/* Overlay de hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 rounded-full transition-colors z-[5]">
                  <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {user.profileImageUrl ? (
                  <Image
                    src={user.profileImageUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    width={100}
                    height={100}
                    className="rounded-full object-cover h-24 w-24"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-primary">
                      {(user.firstName?.[0] || "").toUpperCase()}
                      {(user.lastName?.[0] || "").toUpperCase()}
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
                <span className="absolute bottom-0 right-0 p-1 rounded-full bg-card border shadow text-muted-foreground group-hover:text-primary">
                  <Camera className="h-4 w-4" />
                </span>
              </button>
              <h2 className="text-lg font-semibold">{user.firstName} {user.lastName}</h2>
              {isMusician && musicianProfile?.category && (
                <p className="text-sm text-muted-foreground mb-2">
                  {musicianProfile.category}
                </p>
              )}
              {isMusician && musicianProfile?.rating !== undefined && (
                <div className="flex items-center justify-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(musicianProfile.rating || 0)
                          ? "text-yellow-400"
                          : "text-muted-foreground"
                        }`}
                      fill={i < Math.round(musicianProfile.rating || 0) ? "currentColor" : "none"}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">
                    {(musicianProfile.rating || 0).toFixed(1)} ({musicianProfile.ratingCount || 0})
                  </span>
                </div>
              )}
              {(user.city || user.state) && (
                <p className="text-xs flex items-center justify-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {user.city}{user.city && user.state ? ", " : ""}{user.state}
                </p>
              )}
              {isMusician && musicianProfile && (
                <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                  <div>
                    <div className="font-semibold">{musicianProfile.eventsCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Eventos</div>
                  </div>
                  <div>
                    <div className="font-semibold">{musicianProfile.satisfactionRate || 0}%</div>
                    <div className="text-xs text-muted-foreground">
                      Satisfação
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">{musicianProfile.responseTime || "-"}</div>
                    <div className="text-xs text-muted-foreground">
                      Resp. Média
                    </div>
                  </div>
                </div>
              )}
              {isMusician && musicianProfile?.id && (
                <div className="mt-6">
                  <a
                    href={`/musico/${musicianProfile.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    rel="noopener noreferrer"
                  >
                    Ver Perfil Público
                  </a>
                </div>
              )}
            </div>
            {/* Navigation menu */}
            <nav className="flex flex-col space-y-2">
              {availableTabs.map((tabId) => (
                <button
                  key={tabId}
                  onClick={() => handleTabChange(tabId)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === tabId
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                    }`}
                >
                  {PROFILE_TAB_LABELS[tabId]}
                </button>
              ))}
            </nav>
          </aside>
          {/* Content area */}
          <main className="space-y-8">
            {/* Personal Info Tab */}
            {activeTab === "info-pessoais" && (
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Informações Pessoais
                  </h3>
                  {!editPersonal ? (
                    <Button size="sm" onClick={() => setEditPersonal(true)}>
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={savePersonalInfo} disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          "Salvar"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => {
                          setEditPersonal(false);
                          // Reset form values to original when canceling
                          setPersonalForm({
                            firstName: user.firstName || "",
                            lastName: user.lastName || "",
                            email: user.email || "",
                            phone: user.phone || "",
                            city: user.city || "",
                            state: user.state || "",
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
                <form onSubmit={savePersonalInfo} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label
                        htmlFor="firstName"
                        className="text-sm font-medium"
                      >
                        Nome
                      </label>
                      <Input
                        id="firstName"
                        value={personalForm.firstName}
                        onChange={(e) =>
                          handlePersonalChange("firstName", e.target.value)
                        }
                        readOnly={!editPersonal}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="lastName" className="text-sm font-medium">
                        Sobrenome
                      </label>
                      <Input
                        id="lastName"
                        value={personalForm.lastName}
                        onChange={(e) =>
                          handlePersonalChange("lastName", e.target.value)
                        }
                        readOnly={!editPersonal}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium">
                      E‑mail
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={personalForm.email}
                      readOnly
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      O e-mail não pode ser alterado.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Telefone
                      </label>
                      <Input
                        id="phone"
                        value={personalForm.phone}
                        onChange={(e) =>
                          handlePersonalChange("phone", e.target.value)
                        }
                        readOnly={!editPersonal}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="city" className="text-sm font-medium">
                        Cidade
                      </label>
                      <Input
                        id="city"
                        value={personalForm.city}
                        onChange={(e) =>
                          handlePersonalChange("city", e.target.value)
                        }
                        readOnly={!editPersonal}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="state" className="text-sm font-medium">
                        Estado
                      </label>
                      <Input
                        id="state"
                        value={personalForm.state}
                        onChange={(e) =>
                          handlePersonalChange("state", e.target.value)
                        }
                        readOnly={!editPersonal}
                      />
                    </div>
                  </div>
                </form>
              </div>
            )}
            {/* Musical Info Tab */}
            {activeTab === "info-musicais" && (
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Informações Musicais
                  </h3>
                  {!editMusical ? (
                    <Button size="sm" onClick={() => setEditMusical(true)}>
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveMusicalInfo}>
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditMusical(false);
                          if (musicianProfile) {
                            setMusicalForm({
                              instruments: musicianProfile.instruments?.map((i) => i.slug) || [],
                              genres: musicianProfile.genres?.map((g) => g.slug) || [],
                              bio: musicianProfile.bio || "",
                              experience: musicianProfile.experience || "",
                              priceRange: musicianProfile.priceFrom ? getPriceRangeFromValue(musicianProfile.priceFrom) : "",
                              equipment: musicianProfile.equipment || "",
                            });
                          }
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
                <form onSubmit={saveMusicalInfo} className="space-y-4">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Instrumentos</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {instrumentOptions.map((option) => {
                        const checked =
                          musicalForm.instruments.includes(option.value);
                        return (
                          <label
                            key={option.value}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(val) =>
                                handleMusicalCheckbox(
                                  "instruments",
                                  option.value,
                                  !!val
                                )
                              }
                              disabled={!editMusical}
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Estilos Musicais</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {genreOptions.map((option) => {
                        const checked = musicalForm.genres.includes(option.value);
                        return (
                          <label
                            key={option.value}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(val) =>
                                handleMusicalCheckbox("genres", option.value, !!val)
                              }
                              disabled={!editMusical}
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label
                        htmlFor="experience"
                        className="text-sm font-medium"
                      >
                        Experiência
                      </label>
                      <Select
                        value={musicalForm.experience}
                        onValueChange={(value) =>
                          handleMusicalChange("experience", value)
                        }
                        disabled={!editMusical}
                      >
                        <SelectTrigger id="experience" className="w-full">
                          {experienceOptions.find(
                            (o) => o.value === musicalForm.experience
                          )?.label || "Selecione"}
                        </SelectTrigger>
                        <SelectContent>
                          {experienceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="priceRange"
                        className="text-sm font-medium"
                      >
                        Faixa de Preço
                      </label>
                      <Select
                        value={musicalForm.priceRange}
                        onValueChange={(value) =>
                          handleMusicalChange("priceRange", value)
                        }
                        disabled={!editMusical}
                      >
                        <SelectTrigger id="priceRange" className="w-full">
                          {priceOptions.find(
                            (o) => o.value === musicalForm.priceRange
                          )?.label || "Selecione"}
                        </SelectTrigger>
                        <SelectContent>
                          {priceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="bio" className="text-sm font-medium">
                      Biografia
                    </label>
                    <Textarea
                      id="bio"
                      value={musicalForm.bio}
                      onChange={(e) =>
                        handleMusicalChange("bio", e.target.value)
                      }
                      readOnly={!editMusical}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="equipment" className="text-sm font-medium">
                      Equipamentos Próprios
                    </label>
                    <Textarea
                      id="equipment"
                      value={musicalForm.equipment}
                      onChange={(e) =>
                        handleMusicalChange("equipment", e.target.value)
                      }
                      readOnly={!editMusical}
                      rows={4}
                    />
                  </div>
                </form>
              </div>
            )}
            {/* Portfolio Tab */}
            {activeTab === "portfolio" && (
              <div className="space-y-6">
                <div className="bg-card border rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Meu Portfólio</h3>
                    {isMusician && (
                      <Button onClick={() => setShowUploadModal(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Adicionar Mídia
                      </Button>
                    )}
                  </div>

                  {/* Banner de limites do plano */}
                  {isMusician && currentPlan?.isMusicianPlan && !currentPlan?.isMusicianPlan && (
                    <div className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 dark:text-amber-300">
                          Plano Gratuito — {photosCount}/{maxPhotosLimit} fotos utilizadas
                        </p>
                        <p className="text-amber-700 dark:text-amber-400 mt-1">
                          No plano gratuito você pode ter até {maxPhotosLimit} fotos. Vídeos e áudios estão disponíveis nos planos pagos.{" "}
                          <Link href="/planos" className="underline font-medium hover:text-amber-900 dark:hover:text-amber-200">
                            Fazer upgrade
                          </Link>
                        </p>
                      </div>
                    </div>
                  )}

                  {!isMusician ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Apenas músicos podem gerenciar portfólio
                      </p>
                    </div>
                  ) : isLoadingPortfolio ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : portfolioItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="font-medium mb-2">Seu portfólio está vazio</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Adicione fotos, vídeos ou áudios das suas apresentações
                      </p>
                      <Button onClick={() => setShowUploadModal(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Adicionar Primeiro Item
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {portfolioItems.map((item) => (
                        <div key={item.id} className="bg-muted/50 rounded-lg overflow-hidden group relative">
                          {/* Preview */}
                          <div className="aspect-video bg-muted flex items-center justify-center relative">
                            {item.type === 'IMAGE' ? (
                              <Image
                                src={item.url}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                {getMediaIcon(item.type)}
                                <span className="text-xs">{item.type}</span>
                              </div>
                            )}
                            {/* Delete button */}
                            <button
                              onClick={() => handleDeletePortfolioItem(item.id)}
                              className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remover item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {/* Info */}
                          <div className="p-3 space-y-1">
                            <h4 className="font-medium text-sm truncate">{item.title}</h4>
                            {item.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {item.genre && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                                  {item.genre}
                                </span>
                              )}
                              {item.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {item.location}
                                </span>
                              )}
                              {item.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(item.date).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload Modal */}
                {showUploadModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-lg max-w-md w-full p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Adicionar ao Portfólio</h3>
                        <button
                          onClick={() => {
                            setShowUploadModal(false);
                            setUploadForm({
                              title: "",
                              description: "",
                              date: "",
                              location: "",
                              genre: "",
                            });
                          }}
                          className="text-muted-foreground hover:text-foreground"
                          disabled={isUploadingPortfolio}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label htmlFor="portfolio-title" className="text-sm font-medium">
                            Título *
                          </label>
                          <Input
                            id="portfolio-title"
                            value={uploadForm.title}
                            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                            placeholder="Ex: Show no Teatro Municipal"
                            disabled={isUploadingPortfolio}
                          />
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="portfolio-description" className="text-sm font-medium">
                            Descrição
                          </label>
                          <Textarea
                            id="portfolio-description"
                            value={uploadForm.description}
                            onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                            placeholder="Descreva brevemente..."
                            rows={3}
                            disabled={isUploadingPortfolio}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label htmlFor="portfolio-genre" className="text-sm font-medium">
                              Gênero
                            </label>
                            <Input
                              id="portfolio-genre"
                              value={uploadForm.genre}
                              onChange={(e) => setUploadForm({ ...uploadForm, genre: e.target.value })}
                              placeholder="Ex: Jazz"
                              disabled={isUploadingPortfolio}
                            />
                          </div>

                          <div className="space-y-1">
                            <label htmlFor="portfolio-date" className="text-sm font-medium">
                              Data
                            </label>
                            <Input
                              id="portfolio-date"
                              type="date"
                              value={uploadForm.date}
                              onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
                              disabled={isUploadingPortfolio}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="portfolio-location" className="text-sm font-medium">
                            Local
                          </label>
                          <Input
                            id="portfolio-location"
                            value={uploadForm.location}
                            onChange={(e) => setUploadForm({ ...uploadForm, location: e.target.value })}
                            placeholder="Ex: São Paulo, SP"
                            disabled={isUploadingPortfolio}
                          />
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="portfolio-file" className="text-sm font-medium">
                            Arquivo *
                          </label>
                          {canUploadVideoAudio ? (
                            <p className="text-xs text-muted-foreground mb-2">
                              Imagens (5MB), Vídeos (50MB) ou Áudios (10MB)
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground mb-2">
                              Apenas imagens (JPEG, PNG, WebP — até 5MB).{" "}
                              {!canUploadPhoto && (
                                <span className="text-destructive font-medium">
                                  Limite de {maxPhotosLimit} fotos atingido.
                                </span>
                              )}
                              {canUploadPhoto && (
                                <span>
                                  Restam {maxPhotosLimit - photosCount} foto(s).
                                </span>
                              )}
                              {" "}
                              <Link href="/planos" className="text-primary underline">
                                Upgrade para vídeos e áudios
                              </Link>
                            </p>
                          )}
                          <input
                            type="file"
                            id="portfolio-file"
                            accept={canUploadVideoAudio
                              ? "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/ogg"
                              : "image/jpeg,image/png,image/webp"
                            }
                            onChange={handlePortfolioFileChange}
                            disabled={isUploadingPortfolio || (!canUploadPhoto && !canUploadVideoAudio)}
                            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
                          />
                        </div>
                      </div>

                      {isUploadingPortfolio && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="ml-2 text-sm text-muted-foreground">
                            Fazendo upload...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === "avaliacoes" && (
              <div className="space-y-6">
                {!isMusician ? (
                  <div className="bg-card border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-2">Avaliações</h3>
                    <p className="text-sm text-muted-foreground">
                      Apenas perfis de músico possuem avaliações públicas.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-card border rounded-lg p-6 space-y-4">
                      <h3 className="text-lg font-semibold">Resumo de Avaliações</h3>
                      {reviewStats ? (
                        <>
                          <div className="flex flex-wrap items-center gap-6">
                            <div>
                              <p className="text-3xl font-bold text-primary">
                                {reviewStats.averageRating.toFixed(1)}
                              </p>
                              <p className="text-xs text-muted-foreground">Média geral</p>
                            </div>
                            <div>
                              <p className="text-3xl font-bold">
                                {reviewStats.totalReviews}
                              </p>
                              <p className="text-xs text-muted-foreground">Total de avaliações</p>
                            </div>
                          </div>
                          {reviewStats.ratingDistribution && (
                            <div className="space-y-2">
                              {[5, 4, 3, 2, 1].map((value) => {
                                const key = String(value) as '1' | '2' | '3' | '4' | '5';
                                const total = Math.max(reviewStats.totalReviews, 1);
                                const count = reviewStats.ratingDistribution?.[key] ?? 0;
                                const width = `${(count / total) * 100}%`;
                                return (
                                  <div key={value} className="flex items-center gap-3">
                                    <span className="w-6 text-xs text-muted-foreground">{value}★</span>
                                    <div className="h-2 flex-1 rounded bg-muted overflow-hidden">
                                      <div className="h-full bg-primary" style={{ width }} />
                                    </div>
                                    <span className="w-8 text-right text-xs text-muted-foreground">
                                      {count}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : reviewStatsError ? (
                        <div className="rounded-lg border border-amber-300/60 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">
                          {reviewStatsError}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Carregando estatísticas...
                        </div>
                      )}
                    </div>

                    <div className="bg-card border rounded-lg p-6 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold">Avaliações recebidas</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            fetchReviews();
                            fetchReviewStats();
                          }}
                          disabled={isLoadingReviews}
                        >
                          Atualizar
                        </Button>
                      </div>

                      {isLoadingReviews ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Carregando avaliações...
                        </div>
                      ) : reviews.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Você ainda não recebeu avaliações.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {reviews.map((review) => (
                            <div key={review.id} className="rounded-lg border p-4 space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium">{review.clientName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {review.date || new Date(review.createdAt).toLocaleDateString("pt-BR")}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < Math.round(review.rating) ? "text-yellow-400" : "text-muted-foreground/40"}`}
                                      fill={i < Math.round(review.rating) ? "currentColor" : "none"}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">{review.content}</p>
                              {review.event && (
                                <p className="text-xs text-muted-foreground">Evento: {review.event}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {reviewsTotalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-xs text-muted-foreground">
                            Página {reviewsPage} de {reviewsTotalPages}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={reviewsPage <= 1 || isLoadingReviews}
                              onClick={() => setReviewsPage((prev) => Math.max(1, prev - 1))}
                            >
                              Anterior
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={reviewsPage >= reviewsTotalPages || isLoadingReviews}
                              onClick={() => setReviewsPage((prev) => prev + 1)}
                            >
                              Próxima
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            {/* Subscription Tab */}
            {activeTab === "assinatura" && (
              <div className="space-y-6">
                <div className="bg-card border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Minha Assinatura
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchSubscriptionData()}
                      disabled={isLoadingSubscription}
                    >
                      {isLoadingSubscription ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Atualizar"
                      )}
                    </Button>
                  </div>

                  {isLoadingSubscription && !subscriptionData ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !subscriptionData?.hasSubscription ? (
                    <div className="text-center py-8 space-y-4">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <p className="font-medium mb-2">Você não possui uma assinatura ativa</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Assine um plano para ter acesso a recursos exclusivos
                        </p>
                      </div>
                      <Button asChild>
                        <Link href="/planos">Ver Planos Disponíveis</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Status Card */}
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${subscriptionData.subscription?.status === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }`}
                          >
                            {subscriptionData.subscription?.status === "active"
                              ? "Ativo"
                              : subscriptionData.subscription?.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Plano</span>
                          <span className="font-semibold">
                            {subscriptionData.subscription?.plan.title}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Valor Mensal</span>
                          <span className="font-semibold">
                            R$ {((subscriptionData.subscription?.plan.monthlyPrice || 0) / 100).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Início do período</span>
                          <span className="font-medium">
                            {subscriptionData.subscription?.currentPeriodStart &&
                              new Date(subscriptionData.subscription.currentPeriodStart).toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {subscriptionData.subscription?.cancelAtPeriodEnd
                              ? "Acesso até"
                              : "Próxima cobrança"}
                          </span>
                          <span className="font-medium">
                            {subscriptionData.subscription?.currentPeriodEnd &&
                              new Date(subscriptionData.subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        {subscriptionData.subscription?.cancelAtPeriodEnd && (
                          <div className="pt-3 border-t">
                            <div className="flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <p>
                                Sua assinatura foi cancelada e expirará no final do período.
                                Você ainda tem acesso até a data informada acima.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      {subscriptionData.subscription?.plan.features &&
                        subscriptionData.subscription.plan.features.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3">Recursos incluídos:</h4>
                            <ul className="space-y-2">
                              {subscriptionData.subscription.plan.features
                                .filter((f) => f.available)
                                .map((feature) => (
                                  <li key={feature.id} className="flex items-center gap-2 text-sm">
                                    <Star className="h-4 w-4 text-primary" />
                                    {feature.text}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                      {/* Actions */}
                      <div className="space-y-3 pt-4 border-t">
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={handleOpenPortal}
                          disabled={isProcessingAction}
                        >
                          {isProcessingAction ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Abrindo...
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Gerenciar Método de Pagamento
                            </>
                          )}
                        </Button>

                        {subscriptionData.subscription?.cancelAtPeriodEnd ? (
                          <Button
                            className="w-full"
                            onClick={handleReactivateSubscription}
                            disabled={isProcessingAction}
                          >
                            {isProcessingAction ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Reativando...
                              </>
                            ) : (
                              "Reativar Assinatura"
                            )}
                          </Button>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                className="w-full"
                                variant="destructive"
                                disabled={isProcessingAction}
                              >
                                Cancelar Assinatura
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Sua assinatura será cancelada ao final do período atual.
                                  Você continuará tendo acesso aos recursos até{" "}
                                  {subscriptionData.subscription?.currentPeriodEnd &&
                                    new Date(subscriptionData.subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
                                  .
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Voltar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleCancelSubscription}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Sim, Cancelar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        <Button
                          variant="ghost"
                          className="w-full"
                          asChild
                        >
                          <Link href="/perfil/pagamentos">
                            Ver Histórico de Pagamentos
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === "configuracoes" && (
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Configurações</h3>
                <p className="text-sm text-muted-foreground">
                  Ajustes de conta e preferências estarão disponíveis aqui em
                  breve.
                </p>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
