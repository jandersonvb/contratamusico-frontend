"use client";

import type { Message } from "@/api/chat";
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

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2 shadow-sm ${
          isMine
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {String(message.content || "")}
        </p>
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
