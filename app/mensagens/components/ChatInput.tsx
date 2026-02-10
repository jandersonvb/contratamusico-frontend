"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  onFocusInput?: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, onTyping, onFocusInput, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);

      // Emite typing:start
      onTyping(true);

      // Debounce: para de digitar após 2s sem atividade
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    },
    [onTyping]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    clearTimeout(typingTimeoutRef.current);
    onTyping(false);

    try {
      onSend(trimmed);
      setValue("");
    } finally {
      setIsSending(false);
    }
  };

  // Enviar com Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t bg-background p-3 sm:p-4 flex items-center gap-2"
    >
      <Input
        value={value}
        onChange={handleChange}
        onFocus={onFocusInput}
        onKeyDown={handleKeyDown}
        placeholder="Digite sua mensagem..."
        disabled={disabled || isSending}
        className="flex-1 rounded-full bg-muted/50 border-0 focus-visible:ring-1"
        autoComplete="off"
      />
      <Button
        type="submit"
        disabled={!value.trim() || isSending || disabled}
        size="icon"
        className="rounded-full h-10 w-10 shrink-0"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
