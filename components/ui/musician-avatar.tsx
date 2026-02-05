"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MusicianAvatarProps {
  src: string | null | undefined;
  name: string;
  size?: number;
  className?: string;
  fill?: boolean;
}

/**
 * Gera URL do avatar com iniciais do nome
 */
function getAvatarUrl(name: string, size: number = 400): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=random&color=fff`;
}

/**
 * Verifica se a URL da imagem é válida (não vazia e começa com http)
 */
function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed !== "" && (trimmed.startsWith("http://") || trimmed.startsWith("https://"));
}

/**
 * Componente de avatar para músicos com fallback automático.
 * Se a imagem falhar ao carregar ou a URL for inválida,
 * exibe um avatar gerado com as iniciais do nome.
 */
export function MusicianAvatar({ 
  src, 
  name, 
  size = 400, 
  className,
  fill = false 
}: MusicianAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [src]);
  
  const hasValidImage = isValidImageUrl(src) && !imageError;
  const imageUrl = hasValidImage ? src! : getAvatarUrl(name, size);

  // Always use unoptimized for external URLs to avoid Next.js optimization issues
  const shouldUnoptimize = !imageUrl.includes('localhost') && !imageUrl.includes(process.env.NEXT_PUBLIC_SITE_URL || '');

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (fill) {
    return (
      <>
        {isLoading && (
          <div className={cn("absolute inset-0 bg-muted animate-pulse", className)} />
        )}
        <Image
          src={imageUrl}
          alt={`Foto de ${name}`}
          fill
          className={cn("object-cover", isLoading && "opacity-0", className)}
          onError={handleError}
          onLoad={handleLoad}
          unoptimized={shouldUnoptimize}
        />
      </>
    );
  }

  return (
    <>
      {isLoading && (
        <div 
          className={cn("bg-muted animate-pulse", className)} 
          style={{ width: size, height: size }}
        />
      )}
      <Image
        src={imageUrl}
        alt={`Foto de ${name}`}
        width={size}
        height={size}
        className={cn("object-cover", isLoading && "opacity-0", className)}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={shouldUnoptimize}
      />
    </>
  );
}
