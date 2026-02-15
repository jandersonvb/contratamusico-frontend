"use client";

import type { Message } from "@/api/chat";
import Image from "next/image";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const messageType = message.type ?? "TEXT";
  const content = String(message.content || "").trim();
  const mediaUrl = message.media?.url ?? null;
  const hasMedia = Boolean(message.media);

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2 shadow-sm ${
          isMine
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        }`}
      >
        {hasMedia && (
          <div className="mb-1.5">
            {(messageType === "IMAGE" || message.media?.mimeType?.startsWith("image/")) && mediaUrl && (
              <Image
                src={mediaUrl}
                alt={message.media?.fileName || "Imagem enviada"}
                width={720}
                height={720}
                unoptimized
                className="rounded-xl max-h-64 w-auto object-cover"
                loading="lazy"
              />
            )}

            {(messageType === "VIDEO" || message.media?.mimeType?.startsWith("video/")) && mediaUrl && (
              <video
                src={mediaUrl}
                controls
                className="rounded-xl max-h-72 w-full"
                preload="metadata"
              />
            )}

            {(messageType === "AUDIO" || message.media?.mimeType?.startsWith("audio/")) && mediaUrl && (
              <audio
                src={mediaUrl}
                controls
                className="w-full max-w-xs"
                preload="metadata"
              />
            )}

            {!mediaUrl && (
              <p className="text-xs opacity-80">Arquivo de mídia indisponível.</p>
            )}
          </div>
        )}

        {content && (
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {content}
          </p>
        )}

        {!content && !hasMedia && (
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            Mensagem
          </p>
        )}

        <div
          className={`flex items-center gap-1 mt-1 ${
            isMine ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className={`text-[10px] ${
              isMine ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {time}
          </span>
          {isMine && (
            <span className="text-primary-foreground/70">
              {message.isRead ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
