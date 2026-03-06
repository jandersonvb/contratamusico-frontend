"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ExternalLink,
  FileAudio,
  Image as ImageIcon,
  MapPin,
  Music,
  Video,
  X,
} from "lucide-react";

type PortfolioMediaType = "IMAGE" | "VIDEO" | "AUDIO";

export interface PortfolioMediaDialogItem {
  url: string;
  type: PortfolioMediaType;
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  genre?: string;
}

interface PortfolioMediaDialogProps {
  item: PortfolioMediaDialogItem | null;
  onClose: () => void;
}

const MEDIA_TYPE_LABELS: Record<PortfolioMediaType, string> = {
  IMAGE: "Foto",
  VIDEO: "Vídeo",
  AUDIO: "Áudio",
};

function formatPortfolioDate(date?: string) {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("pt-BR");
}

function getMediaTypeIcon(type: PortfolioMediaType) {
  switch (type) {
    case "VIDEO":
      return <Video className="h-4 w-4" />;
    case "AUDIO":
      return <FileAudio className="h-4 w-4" />;
    default:
      return <ImageIcon className="h-4 w-4" />;
  }
}

export function PortfolioMediaDialog({
  item,
  onClose,
}: PortfolioMediaDialogProps) {
  const [imageLayout, setImageLayout] = useState<"portrait" | "landscape">("landscape");

  useEffect(() => {
    if (!item) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose]);

  useEffect(() => {
    if (!item || item.type !== "IMAGE") {
      setImageLayout("landscape");
      return;
    }

    let isCancelled = false;
    const imageProbe = new window.Image();

    imageProbe.onload = () => {
      if (isCancelled) {
        return;
      }

      setImageLayout(
        imageProbe.naturalHeight > imageProbe.naturalWidth ? "portrait" : "landscape"
      );
    };

    imageProbe.onerror = () => {
      if (!isCancelled) {
        setImageLayout("landscape");
      }
    };

    imageProbe.src = item.url;

    return () => {
      isCancelled = true;
    };
  }, [item]);

  if (!item) {
    return null;
  }

  const formattedDate = formatPortfolioDate(item.date);
  const isPortraitImage = item.type === "IMAGE" && imageLayout === "portrait";
  const metadataItems = [
    item.genre
      ? {
          label: item.genre,
          icon: <Music className="h-4 w-4 text-primary" />,
        }
      : null,
    item.location
      ? {
          label: item.location,
          icon: <MapPin className="h-4 w-4 text-primary" />,
        }
      : null,
    formattedDate
      ? {
          label: formattedDate,
          icon: <Calendar className="h-4 w-4 text-primary" />,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; icon: ReactNode }>;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title || "Visualização de mídia"}
    >
      <div
        className={`h-[100dvh] max-h-[100dvh] w-full overflow-hidden rounded-none border-0 bg-card shadow-2xl sm:h-auto sm:max-h-[96vh] sm:rounded-[28px] sm:border ${
          isPortraitImage
            ? "max-w-[calc(100vw-1rem)] sm:max-w-[980px]"
            : "max-w-[calc(100vw-1rem)] sm:max-w-6xl"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b bg-muted/20 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {getMediaTypeIcon(item.type)}
              {MEDIA_TYPE_LABELS[item.type]}
            </div>
            <div>
              <h3 className="text-lg font-semibold sm:text-xl">
                {item.title || "Mídia do portfólio"}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar visualização"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(100dvh-73px)] overflow-y-auto sm:max-h-[calc(96vh-88px)]">
          <div
            className={`flex items-center justify-center px-3 py-3 sm:px-6 sm:py-6 ${
              item.type === "IMAGE"
                ? "bg-gradient-to-br from-muted/80 via-background to-muted/60"
                : "bg-black"
            }`}
          >
            {item.type === "IMAGE" ? (
              <div
                className={`w-full ${
                  isPortraitImage ? "max-w-[320px] sm:max-w-[520px]" : "max-w-5xl"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.title || "Mídia do portfólio"}
                  className="mx-auto max-h-[52vh] w-auto max-w-full rounded-xl object-contain shadow-2xl ring-1 ring-black/10 sm:max-h-[60vh] sm:rounded-2xl"
                />
              </div>
            ) : item.type === "VIDEO" ? (
              <video
                src={item.url}
                controls
                playsInline
                preload="metadata"
                className="max-h-[52vh] w-full rounded-xl bg-black sm:max-h-[60vh]"
              >
                Seu navegador não suporta a reprodução de vídeo.
              </video>
            ) : (
              <div className="w-full max-w-xl rounded-2xl bg-card p-4 sm:p-8">
                <div className="mb-5 flex items-center gap-3 sm:mb-6 sm:gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-14 sm:w-14">
                    <FileAudio className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold sm:text-base">
                      {item.title || "Áudio do portfólio"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Reprodução disponível no player abaixo.
                    </p>
                  </div>
                </div>
                <audio src={item.url} controls className="w-full">
                  Seu navegador não suporta a reprodução de áudio.
                </audio>
              </div>
            )}
          </div>

          <div className="border-t bg-background px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Descrição
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {item.description?.trim() || "Nenhuma descrição informada para esta mídia."}
                  </p>
                </div>

                {metadataItems.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Informações
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {metadataItems.map((metadataItem) => (
                        <div
                          key={`${metadataItem.label}`}
                          className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground sm:text-sm"
                        >
                          {metadataItem.icon}
                          <span>{metadataItem.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full lg:w-auto lg:min-w-[240px]">
                <Button asChild variant="outline" className="w-full">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Abrir mídia em nova aba
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
