"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Paperclip, X } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => Promise<void> | void;
  onSendMedia: (file: File, content?: string) => Promise<void> | void;
  onTyping: (isTyping: boolean) => void;
  onFocusInput?: () => void;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onSendMedia,
  onTyping,
  onFocusInput,
  disabled,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const hasText = trimmed.length > 0;
    const hasFile = Boolean(selectedFile);
    if ((!hasText && !hasFile) || isSending) return;

    setIsSending(true);
    clearTimeout(typingTimeoutRef.current);
    onTyping(false);

    try {
      if (selectedFile) {
        await onSendMedia(selectedFile, hasText ? trimmed : undefined);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        await onSend(trimmed);
      }
      setValue("");
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      className="relative border-t bg-background p-3 sm:p-4 flex items-center gap-2"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isSending}
      />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isSending}
        className="rounded-full h-10 w-10 shrink-0"
        aria-label="Anexar arquivo"
        title="Anexar arquivo"
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      <Input
        value={value}
        onChange={handleChange}
        onFocus={onFocusInput}
        onKeyDown={handleKeyDown}
        placeholder={selectedFile ? "Adicionar legenda (opcional)..." : "Digite sua mensagem..."}
        disabled={disabled || isSending}
        className="flex-1 rounded-full bg-muted/50 border-0 focus-visible:ring-1"
        autoComplete="off"
      />
      <Button
        type="submit"
        disabled={(!value.trim() && !selectedFile) || isSending || disabled}
        size="icon"
        className="rounded-full h-10 w-10 shrink-0"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>

      {selectedFile && (
        <div className="absolute -top-9 left-4 right-4 flex items-center justify-between gap-2 rounded-lg border bg-background px-3 py-1.5 text-xs shadow-sm">
          <span className="truncate">{selectedFile.name}</span>
          <button
            type="button"
            onClick={clearSelectedFile}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Remover arquivo selecionado"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </form>
  );
}
