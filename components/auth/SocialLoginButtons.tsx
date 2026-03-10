"use client";

import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/stores/userStore";
import { SocialLoginProvider, UserType } from "@/lib/types/user";
import { cn } from "@/lib/utils";

interface SocialLoginButtonsProps {
  rememberMe?: boolean;
  userType?: UserType;
  terms?: boolean;
  enforceSignupRequirements?: boolean;
  successMessage?: string;
  onSuccess?: () => void;
  className?: string;
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface GooglePromptMomentNotification {
  isNotDisplayed?: () => boolean;
  isSkippedMoment?: () => boolean;
  isDismissedMoment?: () => boolean;
}

interface GoogleInitializeConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  cancel_on_tap_outside?: boolean;
  ux_mode?: "popup" | "redirect";
}

interface FacebookLoginResponse {
  authResponse?: {
    accessToken?: string;
  } | null;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: GoogleInitializeConfig) => void;
          prompt: (
            listener?: (notification: GooglePromptMomentNotification) => void
          ) => void;
        };
      };
    };
    FB?: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options?: { scope?: string }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim() || "";
const FACEBOOK_GRAPH_VERSION =
  process.env.NEXT_PUBLIC_FACEBOOK_GRAPH_VERSION?.trim() || "v20.0";
const FACEBOOK_LOGIN_ENABLED = false;

const isGoogleServerConfigError = (message: string) => {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes("google_client_id") ||
    lowerMessage.includes("google client id") ||
    lowerMessage.includes("google nao configurado") ||
    lowerMessage.includes("google não configurado")
  );
};

const isFacebookServerConfigError = (message: string) => {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes("facebook_app_id") ||
    lowerMessage.includes("facebook app id") ||
    lowerMessage.includes("facebook nao configurado") ||
    lowerMessage.includes("facebook não configurado")
  );
};

function GoogleBrandIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303C33.654,32.657,29.21,36,24,36c-6.627,0-12-5.373-12-12
        s5.373-12,12-12c3.059,0,5.842,1.154,7.953,3.047l5.657-5.657C34.054,6.053,29.27,4,24,4C12.955,4,4,12.955,4,24
        s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.953,3.047l5.657-5.657
        C34.054,6.053,29.27,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.153,35.091,26.715,36,24,36
        c-5.17,0-9.598-3.315-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.084,5.571c0.001-0.001,0.002-0.001,0.003-0.002
        l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

function FacebookBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22 12.073C22 6.505 17.523 2 12 2S2 6.505 2 12.073C2 17.104 5.657 21.274 10.438 22v-7.042H7.899v-2.885h2.539V9.845
        c0-2.515 1.492-3.906 3.777-3.906c1.094 0 2.238 0.196 2.238 0.196v2.469h-1.261c-1.243 0-1.63 0.777-1.63 1.574v1.895h2.773
        l-0.443 2.885h-2.33V22C18.343 21.274 22 17.104 22 12.073z"
      />
    </svg>
  );
}

export function SocialLoginButtons({
  rememberMe,
  userType,
  terms,
  enforceSignupRequirements = false,
  successMessage = "Login realizado com sucesso!",
  onSuccess,
  className,
}: SocialLoginButtonsProps) {
  const socialLogin = useUserStore((state) => state.socialLogin);

  const [googleReady, setGoogleReady] = useState(false);
  const [facebookReady, setFacebookReady] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState(true);
  const [facebookAvailable, setFacebookAvailable] = useState(true);
  const [loadingProvider, setLoadingProvider] = useState<SocialLoginProvider | null>(
    null
  );

  const hasGoogleConfig = GOOGLE_CLIENT_ID.length > 0;
  const hasFacebookConfig = FACEBOOK_LOGIN_ENABLED && FACEBOOK_APP_ID.length > 0;
  const canUseGoogle = hasGoogleConfig && googleAvailable;
  const canUseFacebook = hasFacebookConfig && facebookAvailable;

  const initializeFacebookSdk = useCallback(() => {
    if (typeof window === "undefined" || !window.FB || !hasFacebookConfig) {
      return;
    }

    window.FB.init({
      appId: FACEBOOK_APP_ID,
      cookie: true,
      xfbml: false,
      version: FACEBOOK_GRAPH_VERSION,
    });

    setFacebookReady(true);
  }, [hasFacebookConfig]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.google?.accounts?.id) {
      setGoogleReady(true);
    }

    if (window.FB && hasFacebookConfig) {
      initializeFacebookSdk();
    }
  }, [hasFacebookConfig, initializeFacebookSdk]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasFacebookConfig || window.FB) {
      return;
    }

    window.fbAsyncInit = initializeFacebookSdk;

    return () => {
      if (window.fbAsyncInit === initializeFacebookSdk) {
        delete window.fbAsyncInit;
      }
    };
  }, [hasFacebookConfig, initializeFacebookSdk]);

  const validateSignupRequirements = useCallback(() => {
    if (!enforceSignupRequirements) {
      return true;
    }

    if (terms !== true) {
      toast.error("Aceite os termos para continuar com login social.");
      return false;
    }

    if (!userType) {
      toast.error("Selecione se você é contratante ou músico antes de continuar.");
      return false;
    }

    return true;
  }, [enforceSignupRequirements, terms, userType]);

  const submitSocialToken = useCallback(
    async (provider: SocialLoginProvider, token: string) => {
      try {
        await socialLogin({
          provider,
          token,
          rememberMe,
          ...(enforceSignupRequirements ? { userType, terms } : {}),
        });
        toast.success(successMessage);
        onSuccess?.();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Falha ao realizar login social.";

        if (provider === SocialLoginProvider.GOOGLE && isGoogleServerConfigError(message)) {
          setGoogleAvailable(false);
          toast.error(
            "Login com Google indisponível no momento. Tente entrar com e-mail e senha."
          );
          return;
        }

        if (
          provider === SocialLoginProvider.FACEBOOK &&
          isFacebookServerConfigError(message)
        ) {
          setFacebookAvailable(false);
          toast.error(
            "Login com Facebook indisponível no momento. Tente entrar com e-mail e senha."
          );
          return;
        }

        toast.error(message);
      } finally {
        setLoadingProvider(null);
      }
    },
    [
      enforceSignupRequirements,
      onSuccess,
      rememberMe,
      socialLogin,
      successMessage,
      terms,
      userType,
    ]
  );

  const handleGoogleLogin = useCallback(() => {
    if (!validateSignupRequirements()) {
      return;
    }

    if (!canUseGoogle) {
      toast.error("Login com Google indisponível no momento.");
      return;
    }

    const googleIdentity = window.google?.accounts?.id;

    if (!googleIdentity) {
      toast.error("Google Login indisponível no momento. Recarregue a página.");
      return;
    }

    setLoadingProvider(SocialLoginProvider.GOOGLE);

    let callbackHandled = false;

    googleIdentity.initialize({
      client_id: GOOGLE_CLIENT_ID,
      cancel_on_tap_outside: false,
      ux_mode: "popup",
      callback: (response: GoogleCredentialResponse) => {
        callbackHandled = true;

        if (!response.credential) {
          setLoadingProvider(null);
          toast.error("Não foi possível obter o token do Google.");
          return;
        }

        void submitSocialToken(SocialLoginProvider.GOOGLE, response.credential);
      },
    });

    googleIdentity.prompt((notification) => {
      const notDisplayed = notification.isNotDisplayed?.() ?? false;
      const skipped = notification.isSkippedMoment?.() ?? false;
      const dismissed = notification.isDismissedMoment?.() ?? false;

      if (!callbackHandled && (notDisplayed || skipped || dismissed)) {
        callbackHandled = true;
        setLoadingProvider(null);

        if (notDisplayed) {
          toast.error("Não foi possível abrir o login do Google.");
        }
      }
    });

    window.setTimeout(() => {
      if (!callbackHandled) {
        callbackHandled = true;
        setLoadingProvider((current) =>
          current === SocialLoginProvider.GOOGLE ? null : current
        );
      }
    }, 15000);
  }, [canUseGoogle, submitSocialToken, validateSignupRequirements]);

  const handleFacebookLogin = useCallback(() => {
    if (!validateSignupRequirements()) {
      return;
    }

    if (window.location.protocol !== "https:") {
      toast.error(
        "Login com Facebook exige HTTPS. Rode o frontend com HTTPS para continuar."
      );
      return;
    }

    if (!canUseFacebook) {
      toast.error("Login com Facebook indisponível no momento.");
      return;
    }

    if (!facebookReady || !window.FB) {
      toast.error("Facebook Login indisponível no momento. Recarregue a página.");
      return;
    }

    setLoadingProvider(SocialLoginProvider.FACEBOOK);

    window.FB.login(
      (response) => {
        const accessToken = response.authResponse?.accessToken;

        if (!accessToken) {
          setLoadingProvider(null);
          toast.error("Login do Facebook cancelado ou não autorizado.");
          return;
        }

        void submitSocialToken(SocialLoginProvider.FACEBOOK, accessToken);
      },
      { scope: "public_profile,email" }
    );
  }, [
    facebookReady,
    canUseFacebook,
    submitSocialToken,
    validateSignupRequirements,
  ]);

  const disableGoogleButton =
    loadingProvider !== null || !canUseGoogle || (hasGoogleConfig && !googleReady);
  const disableFacebookButton =
    loadingProvider !== null || !canUseFacebook || (hasFacebookConfig && !facebookReady);

  return (
    <div className={cn("flex flex-col gap-3 mt-4", className)}>
      {hasGoogleConfig && (
        <Script
          id="google-identity-services"
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGoogleReady(true)}
        />
      )}

      {hasFacebookConfig && (
        <Script
          id="facebook-sdk"
          src="https://connect.facebook.net/pt_BR/sdk.js"
          strategy="afterInteractive"
          onLoad={initializeFacebookSdk}
        />
      )}

      <div className="relative flex items-center justify-center">
        <div className="h-px w-full bg-border" />
        <span className="absolute bg-card px-2 text-xs text-muted-foreground">
          ou continue com
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-11 w-full rounded-xl border text-[15px] font-semibold",
          canUseGoogle
            ? "border-[#DADCE0] bg-white text-[#3C4043] hover:bg-[#F8F9FA]"
            : "border-border bg-muted text-muted-foreground hover:bg-muted"
        )}
        onClick={handleGoogleLogin}
        disabled={disableGoogleButton}
      >
        <span className="flex items-center gap-2 justify-center">
          {loadingProvider === SocialLoginProvider.GOOGLE ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleBrandIcon />
          )}
          {!hasGoogleConfig
            ? "Google indisponível"
            : !googleAvailable
              ? "Google indisponível"
              : !googleReady
                ? "Carregando Google..."
                : "Continuar com Google"}
        </span>
      </Button>

      {FACEBOOK_LOGIN_ENABLED && (
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-11 w-full rounded-xl border text-[15px] font-semibold",
            canUseFacebook
              ? "border-transparent bg-[#1877F2] text-white hover:bg-[#166FE5]"
              : "border-border bg-muted text-muted-foreground hover:bg-muted"
          )}
          onClick={handleFacebookLogin}
          disabled={disableFacebookButton}
        >
          <span className="flex items-center gap-2 justify-center">
            {loadingProvider === SocialLoginProvider.FACEBOOK ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                <FacebookBrandIcon />
              </span>
            )}
            {!hasFacebookConfig
              ? "Facebook indisponível"
              : !facebookAvailable
                ? "Facebook indisponível"
                : !facebookReady
                  ? "Carregando Facebook..."
                  : "Continuar com Facebook"}
          </span>
        </Button>
      )}
    </div>
  );
}
