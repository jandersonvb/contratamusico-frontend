"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { PortfolioMediaDialog } from "@/components/portfolio/PortfolioMediaDialog";

import { Star, MapPin, Loader2, CreditCard, ExternalLink, Calendar, AlertCircle, Upload, Trash2, X, Music, Video, FileAudio, Eye, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useUserStore } from "@/lib/stores/userStore";
import { UserType } from "@/lib/types/user";
import {
  normalizePortfolioUploadFile,
  PORTFOLIO_IMAGE_ACCEPT,
  PORTFOLIO_MEDIA_ACCEPT,
} from "@/lib/portfolioUpload";
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
import { useLocationStore } from "@/lib/stores/locationStore";
import { detectBillingInterval, formatCentsToBrl, getSubscriptionPlanPrice } from "@/lib/subscription";
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
  | "assinatura";

const PROFILE_TABS: ProfileTab[] = [
  "info-pessoais",
  "info-musicais",
  "portfolio",
  "avaliacoes",
  "assinatura",
];

const CLIENT_PROFILE_TABS: ProfileTab[] = [
  "info-pessoais",
];

const PROFILE_TAB_LABELS: Record<ProfileTab, string> = {
  "info-pessoais": "Informações Pessoais",
  "info-musicais": "Informações Musicais",
  portfolio: "Portfólio",
  avaliacoes: "Avaliações",
  assinatura: "Assinatura",
};

function createEmptyUploadForm() {
  return {
    title: "",
    description: "",
    date: "",
    location: "",
    genre: "",
  };
}

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Profile page that allows the logged in musician to view and edit their
 * personal and musical information. It also shows a summary card with
 * statistics and provides navigation between different sections.
 */
export default function PerfilPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, isUpdating, updateUser, fetchUser, setUser } = useUserStore();
  const { genres, fetchGenres } = useGenreStore();
  const { instruments, fetchInstruments } = useInstrumentStore();
  const {
    states,
    cities,
    isLoadingCities,
    fetchStates,
    fetchCities,
    clearCities,
  } = useLocationStore();

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

  const [isSavingMusical, setIsSavingMusical] = useState(false);

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
  const [avatarLocalPreviewUrl, setAvatarLocalPreviewUrl] = useState<string | null>(null);
  const [avatarRemoteUrlBeforeUpload, setAvatarRemoteUrlBeforeUpload] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Portfolio state
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showOptionalPortfolioFields, setShowOptionalPortfolioFields] = useState(false);
  const [uploadForm, setUploadForm] = useState(createEmptyUploadForm);
  const [selectedPortfolioFile, setSelectedPortfolioFile] = useState<File | null>(null);
  const [portfolioPreviewItem, setPortfolioPreviewItem] = useState<PortfolioItem | null>(null);
  const [portfolioItemToDelete, setPortfolioItemToDelete] = useState<PortfolioItem | null>(null);
  const [isDeletingPortfolioItem, setIsDeletingPortfolioItem] = useState(false);
  const [selectedPortfolioPreviewUrl, setSelectedPortfolioPreviewUrl] = useState<string | null>(null);
  const [isDraggingPortfolioFile, setIsDraggingPortfolioFile] = useState(false);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const currentPlan = subscriptionData?.subscription?.plan;
  const subscription = subscriptionData?.subscription;
  const subscriptionBillingInterval = subscription
    ? detectBillingInterval(subscription.currentPeriodStart, subscription.currentPeriodEnd)
    : "monthly";
  const subscriptionPlanPrice = subscription
    ? getSubscriptionPlanPrice(subscription.plan, subscriptionBillingInterval)
    : 0;
  const subscriptionPriceLabel = subscriptionBillingInterval === "yearly" ? "Valor Anual" : "Valor Mensal";

  // Limites (se maxPhotos for null, é ilimitado)
  const maxPhotosLimit = currentPlan?.maxPhotos ?? 3; // Fallback para 3 se não carregar
  const maxVideosLimit = currentPlan?.maxVideos ?? 0; // Fallback para 0 se não carregar



  const photosCount = portfolioItems.filter(item => item.type === 'IMAGE').length;
  const videosCount = portfolioItems.filter(item => ['VIDEO', 'AUDIO'].includes(item.type)).length;

  // Verifica se pode fazer upload
  const canUploadPhoto = currentPlan?.maxPhotos === null || photosCount < maxPhotosLimit;
  // Para vídeos, verificamos se é ilimitado (null) ou se o contador é menor que o limite
  const canUploadVideoAudio = currentPlan?.maxVideos === null || (currentPlan?.maxVideos !== undefined && videosCount < maxVideosLimit);
  const isPortfolioFileSelectionDisabled = isUploadingPortfolio || (!canUploadPhoto && !canUploadVideoAudio);

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
        phone: formatPhoneInput(user.phone || ""),
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
    fetchStates();
  }, [fetchStates]);

  useEffect(() => {
    if (personalForm.state) {
      fetchCities(personalForm.state);
      return;
    }

    clearCities();
  }, [personalForm.state, fetchCities, clearCities]);

  useEffect(() => {
    if (!showUploadModal) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [showUploadModal]);

  useEffect(() => {
    return () => {
      if (avatarLocalPreviewUrl) {
        URL.revokeObjectURL(avatarLocalPreviewUrl);
      }
    };
  }, [avatarLocalPreviewUrl]);

  useEffect(() => {
    if (!avatarLocalPreviewUrl) {
      return;
    }

    const normalizeAvatarUrl = (url?: string | null): string | null => {
      if (!url) return null;
      try {
        const parsed = new URL(url);
        parsed.searchParams.delete("_ts");
        return parsed.toString();
      } catch {
        return url;
      }
    };

    const currentAvatarUrl = user?.profileImageUrl ?? null;
    const normalizedCurrentAvatarUrl = normalizeAvatarUrl(currentAvatarUrl);
    const normalizedAvatarBeforeUpload = normalizeAvatarUrl(avatarRemoteUrlBeforeUpload);
    const hasServerAvatarUpdated =
      !!normalizedCurrentAvatarUrl &&
      (normalizedAvatarBeforeUpload === null ||
        normalizedCurrentAvatarUrl !== normalizedAvatarBeforeUpload);

    if (!hasServerAvatarUpdated) {
      return;
    }

    setAvatarLocalPreviewUrl(null);
    setAvatarRemoteUrlBeforeUpload(null);
  }, [avatarLocalPreviewUrl, avatarRemoteUrlBeforeUpload, user?.profileImageUrl]);

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

  useEffect(() => {
    return () => {
      if (selectedPortfolioPreviewUrl) {
        URL.revokeObjectURL(selectedPortfolioPreviewUrl);
      }
    };
  }, [selectedPortfolioPreviewUrl]);

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
    setPersonalForm((prev) => ({
      ...prev,
      [field]: field === "phone" ? formatPhoneInput(value) : value,
    }));
  };

  const resetPersonalForm = () => {
    if (!user) {
      return;
    }

    setPersonalForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: formatPhoneInput(user.phone || ""),
      city: user.city || "",
      state: user.state || "",
    });
  };

  const resetMusicalForm = () => {
    if (!musicianProfile) {
      setMusicalForm({
        instruments: [],
        genres: [],
        bio: "",
        experience: "",
        priceRange: "",
        equipment: "",
      });
      return;
    }

    setMusicalForm({
      instruments: musicianProfile.instruments?.map((i) => i.slug) || [],
      genres: musicianProfile.genres?.map((g) => g.slug) || [],
      bio: musicianProfile.bio || "",
      experience: musicianProfile.experience || "",
      priceRange: musicianProfile.priceFrom
        ? getPriceRangeFromValue(musicianProfile.priceFrom)
        : "",
      equipment: musicianProfile.equipment || "",
    });
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
        phone: personalForm.phone.replace(/\D/g, ""),
        city: personalForm.city,
        state: personalForm.state,
      });
      toast.success("Informações pessoais atualizadas!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar";
      toast.error(message);
    }
  };

  const saveMusicalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMusical(true);
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar informações musicais";
      toast.error(message);
    } finally {
      setIsSavingMusical(false);
    }
  };

  const handleTabChange = (tab: ProfileTab) => {
    if (!availableTabs.includes(tab)) {
      return;
    }

    setActiveTab(tab);
    router.replace(`/perfil?tab=${tab}`, { scroll: false });
  };

  const openAvatarFilePicker = () => {
    if (isUploadingAvatar) {
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const input = avatarInputRef.current;
    if (!input) return;

    input.value = "";
    input.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previousAvatarUrl = user?.profileImageUrl ?? null;
    const localPreviewUrl = URL.createObjectURL(file);
    setIsAvatarPreviewOpen(false);
    setAvatarLocalPreviewUrl(localPreviewUrl);
    setAvatarRemoteUrlBeforeUpload(previousAvatarUrl);
    setIsUploadingAvatar(true);

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
      });

    const normalizeAvatarUrl = (url?: string | null): string | null => {
      if (!url) return null;
      try {
        const parsed = new URL(url);
        parsed.searchParams.delete("_ts");
        return parsed.toString();
      } catch {
        return url;
      }
    };

    const withTransientCacheBust = (url: string): string => {
      try {
        const parsed = new URL(url);
        parsed.searchParams.set("_ts", Date.now().toString());
        return parsed.toString();
      } catch {
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}_ts=${Date.now()}`;
      }
    };

    const syncUserAfterAvatarUpload = async (expectedAvatarUrl?: string | null) => {
      const expectedNormalized = normalizeAvatarUrl(expectedAvatarUrl);

      for (let attempt = 0; attempt < 8; attempt += 1) {
        await fetchUser(true).catch(() => undefined);

        const currentAvatarUrl = useUserStore.getState().user?.profileImageUrl ?? null;
        const currentNormalized = normalizeAvatarUrl(currentAvatarUrl);
        const hasUpdatedAvatar =
          !!currentNormalized &&
          (expectedNormalized === null || currentNormalized !== expectedNormalized);

        if (hasUpdatedAvatar) {
          return;
        }

        await wait(350 + attempt * 150);
      }
    };

    try {
      const uploaded = await uploadAvatar(file);

      // Atualiza imediatamente o estado local para não depender de timing de cache/CDN.
      if (user) {
        const uploadedProfileImageUrl =
          typeof uploaded.profileImageUrl === "string" ? uploaded.profileImageUrl : null;
        const normalizedUploaded = normalizeAvatarUrl(uploadedProfileImageUrl);
        const normalizedPrevious = normalizeAvatarUrl(previousAvatarUrl);
        const nextAvatarUrl =
          uploadedProfileImageUrl
            ? normalizedUploaded && normalizedUploaded === normalizedPrevious
              ? withTransientCacheBust(uploadedProfileImageUrl)
              : uploadedProfileImageUrl
            : previousAvatarUrl
              ? withTransientCacheBust(previousAvatarUrl)
              : null;

        setUser({
          ...user,
          profileImageUrl: nextAvatarUrl ?? undefined,
          profileImageKey:
            (typeof uploaded.profileImageKey === "string" && uploaded.profileImageKey) ||
            nextAvatarUrl ||
            undefined,
        });
      }

      await syncUserAfterAvatarUpload(previousAvatarUrl);
      toast.success("Foto de perfil atualizada com sucesso!");
    } catch (error) {
      setAvatarLocalPreviewUrl(null);
      setAvatarRemoteUrlBeforeUpload(null);
      const message = error instanceof Error ? error.message : "Erro ao fazer upload";
      toast.error(message);
    } finally {
      setIsUploadingAvatar(false);
      // Limpar o input para permitir upload do mesmo arquivo novamente
      e.target.value = '';
    }
  };

  const handleViewAvatar = () => {
    if (!user?.profileImageUrl) {
      toast.info("Você ainda não possui foto de perfil.");
      return;
    }

    setIsAvatarPreviewOpen(true);
  };

  const resetPortfolioUploadForm = () => {
    setUploadForm(createEmptyUploadForm());
    setShowOptionalPortfolioFields(false);
    setSelectedPortfolioFile(null);
    setSelectedPortfolioPreviewUrl(null);
    setIsDraggingPortfolioFile(false);

    if (portfolioInputRef.current) {
      portfolioInputRef.current.value = "";
    }
  };

  const closeUploadModal = () => {
    if (isUploadingPortfolio) {
      return;
    }

    setShowUploadModal(false);
    resetPortfolioUploadForm();
  };

  const openUploadModal = () => {
    resetPortfolioUploadForm();
    setShowUploadModal(true);
  };

  const openPortfolioFilePicker = () => {
    if (isPortfolioFileSelectionDisabled) {
      return;
    }

    const input = portfolioInputRef.current;
    if (!input) {
      return;
    }

    input.value = "";
    input.click();
  };

  const clearSelectedPortfolioFile = () => {
    setSelectedPortfolioFile(null);
    setSelectedPortfolioPreviewUrl(null);
    setIsDraggingPortfolioFile(false);

    if (portfolioInputRef.current) {
      portfolioInputRef.current.value = "";
    }
  };

  const setPortfolioFile = (
    file: File | null,
    inputElement?: HTMLInputElement | null,
  ) => {
    if (!file) {
      setSelectedPortfolioFile(null);
      return;
    }

    const normalizedUpload = normalizePortfolioUploadFile(file);

    if (!normalizedUpload) {
      toast.error("Formato não suportado. Use imagem, vídeo ou áudio compatível.");
      if (inputElement) {
        inputElement.value = "";
      }
      return;
    }

    const { file: normalizedFile, rule } = normalizedUpload;
    const isImage = rule.kind === "IMAGE";
    const isVideoOrAudio = rule.kind === "VIDEO" || rule.kind === "AUDIO";

    if (isImage && !canUploadPhoto) {
      toast.error(`Você atingiu o limite de ${maxPhotosLimit} fotos do plano ${planName}. Faça upgrade para adicionar mais.`);
      if (inputElement) {
        inputElement.value = "";
      }
      return;
    }

    if (isVideoOrAudio && !canUploadVideoAudio) {
      toast.error(
        maxVideosLimit === 0
          ? `Seu plano atual (${planName}) não permite vídeos/áudios. Faça upgrade.`
          : `Você atingiu o limite de ${maxVideosLimit} vídeos/áudios do plano ${planName}.`
      );
      if (inputElement) {
        inputElement.value = "";
      }
      return;
    }

    const nextPreviewUrl =
      normalizedFile.type.startsWith("image/") || normalizedFile.type.startsWith("video/")
        ? URL.createObjectURL(normalizedFile)
        : null;

    setSelectedPortfolioPreviewUrl(nextPreviewUrl);
    setSelectedPortfolioFile(normalizedFile);
  };

  const handlePortfolioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPortfolioFile(e.target.files?.[0] ?? null, e.target);
  };

  const handlePortfolioFileDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (isPortfolioFileSelectionDisabled) {
      return;
    }

    setIsDraggingPortfolioFile(true);
  };

  const handlePortfolioFileDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingPortfolioFile(false);
  };

  const handlePortfolioFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingPortfolioFile(false);

    if (isPortfolioFileSelectionDisabled) {
      return;
    }

    setPortfolioFile(e.dataTransfer.files?.[0] ?? null, portfolioInputRef.current);
  };

  const handleSubmitPortfolioUpload = async () => {
    if (!uploadForm.title.trim()) {
      toast.error("Por favor, informe um título para o item.");
      return;
    }

    if (!selectedPortfolioFile) {
      toast.error("Selecione uma foto, vídeo ou áudio para enviar.");
      return;
    }

    setIsUploadingPortfolio(true);
    try {
      await uploadPortfolioFile(selectedPortfolioFile, {
        title: uploadForm.title.trim(),
        description: uploadForm.description || undefined,
        date: uploadForm.date || undefined,
        location: uploadForm.location || undefined,
        genre: uploadForm.genre || undefined,
      });

      toast.success("Arquivo adicionado ao portfólio com sucesso!");
      setShowUploadModal(false);
      resetPortfolioUploadForm();
      await fetchPortfolio(); // Recarregar portfólio
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao fazer upload";
      toast.error(message);
    } finally {
      setIsUploadingPortfolio(false);
    }
  };

  const handleDeletePortfolioItem = async () => {
    if (!portfolioItemToDelete) {
      return;
    }

    setIsDeletingPortfolioItem(true);
    try {
      await deletePortfolioItem(portfolioItemToDelete.id);
      toast.success("Item removido com sucesso!");
      setPortfolioItemToDelete(null);
      await fetchPortfolio(); // Recarregar portfólio
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao remover item";
      toast.error(message);
    } finally {
      setIsDeletingPortfolioItem(false);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-5 w-5" />;
      case 'AUDIO':
        return <FileAudio className="h-5 w-5" />;
      default:
        return <ImageIcon className="h-5 w-5" />;
    }
  };

  const getPortfolioFileKindLabel = (file: File) => {
    const normalizedUpload = normalizePortfolioUploadFile(file);

    switch (normalizedUpload?.rule.kind) {
      case "IMAGE":
        return "Foto";
      case "VIDEO":
        return "Vídeo";
      case "AUDIO":
        return "Áudio";
      default:
        return "Arquivo";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatPortfolioDate = (date?: string) => {
    if (!date) {
      return null;
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("pt-BR");
  };

  // Loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const profileDisplayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Perfil";
  const avatarDisplayUrl = avatarLocalPreviewUrl || user.profileImageUrl || undefined;
  const hasPortfolioUploadFile = !!selectedPortfolioFile;
  const hasPortfolioTitle = uploadForm.title.trim().length > 0;
  const isPortfolioUploadReady = hasPortfolioUploadFile && hasPortfolioTitle;

  return (
    <div className="min-h-screen flex flex-col">
      <section className="container mx-auto flex-1 px-3 py-4 sm:px-4 sm:py-8 [&_button]:cursor-pointer [&_a]:cursor-pointer [&_input:not(:disabled)]:cursor-pointer [&_[role=checkbox]]:cursor-pointer [&_[role=combobox]]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
          {/* Sidebar */}
          <aside className="space-y-4 self-start sm:space-y-6 lg:sticky lg:top-24">
            {/* Navigation menu */}
            <nav className="bg-card border rounded-lg p-3">
              <p className="hidden px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:block">
                Meu perfil
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-col sm:gap-1 sm:overflow-visible sm:pb-0">
                {availableTabs.map((tabId) => (
                  <button
                    key={tabId}
                    onClick={() => handleTabChange(tabId)}
                    className={`shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-xs transition-colors cursor-pointer sm:w-full sm:text-left sm:text-sm ${activeTab === tabId
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                      }`}
                  >
                    {PROFILE_TAB_LABELS[tabId]}
                  </button>
                ))}
              </div>
            </nav>

            {/* Profile card */}
            <div className="bg-card border rounded-lg p-4 text-center sm:p-6">
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
          </aside>
          {/* Content area */}
          <main className="min-w-0 space-y-6 sm:space-y-8">
            {/* Personal Info Tab */}
            {activeTab === "info-pessoais" && (
              <div className="bg-card border rounded-lg p-4 space-y-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-semibold">
                    Informações Pessoais
                  </h3>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={savePersonalInfo} disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar alterações"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUpdating}
                      onClick={resetPersonalForm}
                    >
                      Reverter
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative inline-block mx-auto sm:mx-0">
                      <button
                        type="button"
                        aria-label={avatarDisplayUrl ? "Ver foto do perfil" : "Foto de perfil"}
                        onClick={avatarDisplayUrl ? handleViewAvatar : undefined}
                        disabled={isUploadingAvatar}
                        className={`relative block rounded-full ${isUploadingAvatar ? "cursor-not-allowed" : avatarDisplayUrl ? "cursor-pointer group" : "cursor-default"}`}
                      >
                        {isUploadingAvatar && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-10">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                          </div>
                        )}

                        {avatarDisplayUrl ? (
                          <Image
                            src={avatarDisplayUrl}
                            alt={profileDisplayName}
                            width={110}
                            height={110}
                            key={avatarDisplayUrl}
                            unoptimized={avatarDisplayUrl.startsWith("blob:")}
                            className="rounded-full object-cover h-24 w-24 sm:h-28 sm:w-28"
                          />
                        ) : (
                          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl font-semibold text-primary">
                              {(user.firstName?.[0] || "").toUpperCase()}
                              {(user.lastName?.[0] || "").toUpperCase()}
                            </span>
                          </div>
                        )}
                      </button>
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <p className="text-base font-semibold">{profileDisplayName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {(user.city || user.state) && (
                        <p className="text-xs inline-flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {user.city}{user.city && user.state ? ", " : ""}{user.state}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <Button
                          type="button"
                          size="sm"
                          variant="default"
                          onClick={openAvatarFilePicker}
                          disabled={isUploadingAvatar}
                          className="h-8 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:cursor-not-allowed"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Trocar foto
                        </Button>
                        {isMusician && musicianProfile?.id && (
                          <Button size="sm" variant="outline" asChild className="h-8">
                            <a
                              href={`/musico/${musicianProfile.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver perfil público
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    id="avatar-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleAvatarChange}
                    disabled={isUploadingAvatar}
                  />
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
                        className="cursor-pointer"
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
                        className="cursor-pointer"
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
                      className="bg-muted cursor-pointer"
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
                        placeholder="(00) 00000-0000"
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="state" className="text-sm font-medium">
                        Estado
                      </label>
                      <Select
                        value={personalForm.state || "all"}
                        onValueChange={(value) => {
                          const nextState = value === "all" ? "" : value;
                          handlePersonalChange("state", nextState);
                          handlePersonalChange("city", "");
                        }}
                      >
                        <SelectTrigger id="state" className="w-full text-sm cursor-pointer">
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {personalForm.state
                              ? states.find((state) => state.sigla === personalForm.state)?.nome || personalForm.state
                              : "Estado"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="cursor-pointer">Todos os estados</SelectItem>
                          {states.map((state) => (
                            <SelectItem key={state.sigla} value={state.sigla} className="cursor-pointer">
                              {state.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="city" className="text-sm font-medium">
                        Cidade
                      </label>
                      <Select
                        value={personalForm.city || "all"}
                        onValueChange={(value) =>
                          handlePersonalChange("city", value === "all" ? "" : value)
                        }
                        disabled={!personalForm.state}
                      >
                        <SelectTrigger id="city" className="w-full text-sm cursor-pointer">
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {isLoadingCities
                              ? "Carregando cidades..."
                              : personalForm.city || "Cidade"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="cursor-pointer">Todas as cidades</SelectItem>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.nome} className="cursor-pointer">
                              {city.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </form>
              </div>
            )}
            {/* Musical Info Tab */}
            {activeTab === "info-musicais" && (
              <div className="bg-card border rounded-lg p-4 space-y-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-semibold">
                    Informações Musicais
                  </h3>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveMusicalInfo} disabled={isSavingMusical}>
                        {isSavingMusical ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          "Salvar alterações"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSavingMusical}
                        onClick={resetMusicalForm}
                      >
                        Reverter
                      </Button>
                    </div>
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
                            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors cursor-pointer ${
                              checked
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/40 hover:bg-muted/70"
                            }`}
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
                              className="cursor-pointer"
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
                            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors cursor-pointer ${
                              checked
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/40 hover:bg-muted/70"
                            }`}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(val) =>
                                handleMusicalCheckbox("genres", option.value, !!val)
                              }
                              className="cursor-pointer"
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
                      >
                        <SelectTrigger id="experience" className="w-full cursor-pointer">
                          {experienceOptions.find(
                            (o) => o.value === musicalForm.experience
                          )?.label || "Selecione"}
                        </SelectTrigger>
                        <SelectContent>
                          {experienceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="cursor-pointer">
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
                      >
                        <SelectTrigger id="priceRange" className="w-full cursor-pointer">
                          {priceOptions.find(
                            (o) => o.value === musicalForm.priceRange
                          )?.label || "Selecione"}
                        </SelectTrigger>
                        <SelectContent>
                          {priceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="cursor-pointer">
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
                      rows={4}
                    />
                  </div>
                </form>
              </div>
            )}
            {/* Portfolio Tab */}
            {activeTab === "portfolio" && (
              <div className="space-y-6">
                <div className="bg-card border rounded-lg p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Meu Portfólio</h3>
                    {isMusician && (
                      <Button onClick={openUploadModal}>
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
                      <Button onClick={openUploadModal}>
                        <Upload className="h-4 w-4 mr-2" />
                        Adicionar Primeiro Item
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {portfolioItems.map((item) => (
                        <div key={item.id} className="bg-muted/50 rounded-lg overflow-hidden group relative border border-border/60">
                          <button
                            type="button"
                            onClick={() => setPortfolioItemToDelete(item)}
                            className="absolute top-2 right-2 z-10 p-1.5 bg-destructive text-destructive-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remover item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setPortfolioPreviewItem(item)}
                            className="block w-full text-left"
                          >
                            <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
                              {item.type === "IMAGE" ? (
                                <Image
                                  src={item.url}
                                  alt={item.title}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                />
                              ) : item.type === "VIDEO" ? (
                                <>
                                  <video
                                    src={item.url}
                                    muted
                                    playsInline
                                    preload="metadata"
                                    className="h-full w-full object-cover"
                                  >
                                    Seu navegador não suporta a reprodução de vídeo.
                                  </video>
                                  <div className="absolute inset-0 bg-black/25" />
                                </>
                              ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-muted to-muted/60 text-muted-foreground">
                                  <div className="rounded-full bg-background/80 p-3 text-foreground shadow-sm">
                                    {getMediaIcon(item.type)}
                                  </div>
                                  <span className="text-xs font-medium uppercase tracking-[0.18em]">
                                    Áudio
                                  </span>
                                </div>
                              )}

                              <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                <span className="inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                                  <Eye className="h-3.5 w-3.5" />
                                  Ver mídia
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
                                  {getMediaIcon(item.type)}
                                  {item.type === "IMAGE" ? "Foto" : item.type === "VIDEO" ? "Vídeo" : "Áudio"}
                                </span>
                              </div>
                            </div>

                            <div className="p-3 space-y-2">
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
                                    {formatPortfolioDate(item.date)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload Modal */}
                {showUploadModal && (
                  <div
                    className="fixed inset-0 z-[90] flex items-end justify-center bg-black/65 p-0 md:items-center md:p-4 lg:p-6"
                    onClick={closeUploadModal}
                  >
                    <div
                      className="flex h-[100dvh] w-full flex-col overflow-hidden rounded-none border-0 bg-card shadow-2xl md:h-auto md:max-h-[94dvh] md:max-w-6xl md:rounded-[28px] md:border"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="sticky top-0 z-10 border-b bg-card/95 px-4 py-3 backdrop-blur md:px-6 md:py-5 lg:px-8">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                              <Upload className="h-3.5 w-3.5" />
                              Novo item do portfólio
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold tracking-tight sm:text-xl lg:text-2xl">Adicionar ao Portfólio</h3>
                              <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">
                                1) Escolha um arquivo, 2) defina o título, 3) publique.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={closeUploadModal}
                            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            disabled={isUploadingPortfolio}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid flex-1 gap-4 overflow-y-auto p-4 md:gap-5 md:p-6 lg:gap-6 lg:p-8 xl:grid-cols-[360px_minmax(0,1fr)]">
                        <div className="space-y-4">
                          <div
                            className={`rounded-[24px] border-2 border-dashed p-4 transition-colors sm:p-5 ${
                              isDraggingPortfolioFile
                                ? "border-primary bg-primary/5"
                                : "border-border bg-muted/15"
                            }`}
                            role="button"
                            tabIndex={isPortfolioFileSelectionDisabled ? -1 : 0}
                            aria-label="Selecionar arquivo de mídia"
                            onClick={openPortfolioFilePicker}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                openPortfolioFilePicker();
                              }
                            }}
                            onDrop={handlePortfolioFileDrop}
                            onDragOver={handlePortfolioFileDragOver}
                            onDragLeave={handlePortfolioFileDragLeave}
                          >
                            <input
                              type="file"
                              id="portfolio-file"
                              ref={portfolioInputRef}
                              accept={canUploadVideoAudio ? PORTFOLIO_MEDIA_ACCEPT : PORTFOLIO_IMAGE_ACCEPT}
                              onChange={handlePortfolioFileChange}
                              disabled={isPortfolioFileSelectionDisabled}
                              className="sr-only"
                            />

                            <div className="mb-4 flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  Etapa 1
                                </p>
                                <h4 className="mt-1 text-base font-semibold">Escolha a mídia</h4>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Arraste aqui ou clique em <span className="font-medium">Selecionar arquivo</span>.
                                </p>
                              </div>
                              <div className="rounded-full bg-primary/10 p-3 text-primary">
                                <Upload className="h-5 w-5" />
                              </div>
                            </div>

                            {selectedPortfolioFile ? (
                              <div className="space-y-4">
                                {selectedPortfolioPreviewUrl && selectedPortfolioFile.type.startsWith("image/") ? (
                                  <div className="overflow-hidden rounded-2xl border bg-black">
                                    <div
                                      className="aspect-[4/3] bg-contain bg-center bg-no-repeat"
                                      style={{ backgroundImage: `url(${selectedPortfolioPreviewUrl})` }}
                                    />
                                  </div>
                                ) : selectedPortfolioPreviewUrl && selectedPortfolioFile.type.startsWith("video/") ? (
                                  <div className="overflow-hidden rounded-2xl border bg-black">
                                    <video
                                      src={selectedPortfolioPreviewUrl}
                                      muted
                                      playsInline
                                      preload="metadata"
                                      className="aspect-[4/3] w-full object-cover"
                                    >
                                      Seu navegador não suporta a reprodução de vídeo.
                                    </video>
                                  </div>
                                ) : (
                                  <div className="rounded-2xl border bg-background px-5 py-6">
                                    <div className="flex items-center gap-3">
                                      <div className="rounded-full bg-primary/10 p-3 text-primary">
                                        <FileAudio className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p className="font-medium">Arquivo de áudio selecionado</p>
                                        <p className="text-sm text-muted-foreground">
                                          O áudio será publicado com o título que você informar.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="rounded-2xl border bg-background px-4 py-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold">
                                        {selectedPortfolioFile.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {getPortfolioFileKindLabel(selectedPortfolioFile)} • {formatFileSize(selectedPortfolioFile.size)}
                                      </p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        clearSelectedPortfolioFile();
                                      }}
                                      disabled={isUploadingPortfolio}
                                    >
                                      Remover
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-2xl border bg-background/80 px-4 py-8 text-center sm:px-6 sm:py-10">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                  <Upload className="h-7 w-7" />
                                </div>
                                <p className="text-base font-semibold sm:text-lg">Selecione seu arquivo</p>
                                <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                                  Formatos: imagem, vídeo e áudio.
                                </p>
                              </div>
                            )}

                            <div className="mt-5 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPortfolioFilePicker();
                                }}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                                  isPortfolioFileSelectionDisabled
                                    ? "cursor-not-allowed bg-muted text-muted-foreground"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                                }`}
                                disabled={isPortfolioFileSelectionDisabled}
                              >
                                <Upload className="h-4 w-4" />
                                {selectedPortfolioFile ? "Trocar arquivo" : "Selecionar arquivo"}
                              </button>
                              {selectedPortfolioFile && (
                                <p className="self-center text-xs text-muted-foreground">
                                  Próximo passo: informe o título.
                                </p>
                              )}
                            </div>
                          </div>

                          {!canUploadVideoAudio && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                              No seu plano atual, apenas imagens estão liberadas.{" "}
                              {!canUploadPhoto && (
                                <span className="font-semibold">
                                  Limite de {maxPhotosLimit} fotos atingido.{" "}
                                </span>
                              )}
                              <Link href="/planos" className="font-medium underline">
                                Fazer upgrade
                              </Link>
                            </div>
                          )}

                          <div className="rounded-2xl border bg-background px-4 py-3 text-xs text-muted-foreground">
                            <p>
                              <span className="font-medium text-foreground">Formatos aceitos:</span>{" "}
                              Fotos (JPG, PNG, WebP), Vídeos (MP4, WebM, MOV) e Áudios (MP3, WAV, OGG).
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-[24px] border bg-background p-4 sm:p-6">
                            <div className="mb-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Etapa 2
                              </p>
                              <h4 className="mt-1 text-base font-semibold">Preencha os dados da mídia</h4>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-1.5">
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
                                <p className="text-xs text-muted-foreground">
                                  Este texto será exibido no seu portfólio.
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setShowOptionalPortfolioFields((current) => !current)
                                }
                                className="text-xs font-medium text-primary hover:underline"
                              >
                                {showOptionalPortfolioFields
                                  ? "Ocultar campos opcionais"
                                  : "Adicionar detalhes opcionais (descrição, gênero, data, local)"}
                              </button>

                              {showOptionalPortfolioFields && (
                                <div className="space-y-4 rounded-xl border bg-muted/20 p-3 sm:p-4">
                                  <div className="space-y-1.5">
                                    <label htmlFor="portfolio-description" className="text-sm font-medium">
                                      Descrição
                                    </label>
                                    <Textarea
                                      id="portfolio-description"
                                      value={uploadForm.description}
                                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                      placeholder="Descreva brevemente o contexto dessa apresentação"
                                      rows={4}
                                      disabled={isUploadingPortfolio}
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
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

                                    <div className="space-y-1.5">
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

                                  <div className="space-y-1.5">
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
                                </div>
                              )}
                            </div>
                          </div>

                          {selectedPortfolioFile && !uploadForm.title.trim() && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                              Falta apenas o título para liberar o envio.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="sticky bottom-0 border-t bg-background/95 px-4 py-3 backdrop-blur md:px-6 md:py-4 lg:px-8">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <p className="text-xs text-muted-foreground">
                            {!hasPortfolioUploadFile
                              ? "Selecione um arquivo para continuar."
                              : !hasPortfolioTitle
                                ? "Agora preencha o título da mídia."
                                : "Tudo pronto. Clique em enviar para publicar no portfólio."}
                          </p>
                          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={closeUploadModal}
                              disabled={isUploadingPortfolio}
                              className="w-full sm:w-auto"
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              onClick={handleSubmitPortfolioUpload}
                              disabled={isUploadingPortfolio || !isPortfolioUploadReady}
                              className="w-full sm:w-auto"
                            >
                              {isUploadingPortfolio ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4" />
                                  Enviar para o portfólio
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <PortfolioMediaDialog
                  item={
                    isAvatarPreviewOpen && avatarDisplayUrl
                      ? {
                          url: avatarDisplayUrl,
                          type: "IMAGE",
                          title: profileDisplayName,
                          description: "Foto atual do seu perfil.",
                        }
                      : null
                  }
                  onClose={() => setIsAvatarPreviewOpen(false)}
                />

                <PortfolioMediaDialog
                  item={portfolioPreviewItem}
                  onClose={() => setPortfolioPreviewItem(null)}
                />

                <AlertDialog
                  open={!!portfolioItemToDelete}
                  onOpenChange={(open) => {
                    if (!open && !isDeletingPortfolioItem) {
                      setPortfolioItemToDelete(null);
                    }
                  }}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover mídia do portfólio?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {portfolioItemToDelete?.title
                          ? `A mídia "${portfolioItemToDelete.title}" será removida permanentemente do seu portfólio.`
                          : "Esta mídia será removida permanentemente do seu portfólio."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeletingPortfolioItem}>
                        Voltar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => void handleDeletePortfolioItem()}
                        disabled={isDeletingPortfolioItem}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeletingPortfolioItem ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Removendo...
                          </>
                        ) : (
                          "Sim, remover"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            {activeTab === "avaliacoes" && (
              <div className="space-y-6">
                {!isMusician ? (
                  <div className="bg-card border rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold mb-2">Avaliações</h3>
                    <p className="text-sm text-muted-foreground">
                      Apenas perfis de músico possuem avaliações públicas.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-card border rounded-lg p-4 space-y-4 sm:p-6">
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

                    <div className="bg-card border rounded-lg p-4 space-y-4 sm:p-6">
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
                <div className="bg-card border rounded-lg p-4 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
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
                          <span className="text-sm text-muted-foreground">{subscriptionPriceLabel}</span>
                          <span className="font-semibold">
                            R$ {formatCentsToBrl(subscriptionPlanPrice)}
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
          </main>
        </div>
      </section>
    </div>
  );
}
