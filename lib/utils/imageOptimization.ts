/**
 * URLs assinadas (ex.: S3 pre-signed com X-Amz-*) mudam com frequência e
 * podem expirar. Mantemos `unoptimized` nesses casos para evitar cache quebrado.
 */
export function shouldDisableNextImageOptimization(
  imageUrl: string | null | undefined
): boolean {
  if (!imageUrl || typeof imageUrl !== "string") {
    return true;
  }

  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return true;
  }

  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed, "http://localhost");
    const protocol = parsed.protocol.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();

    if (protocol !== "http:" && protocol !== "https:") {
      return true;
    }

    // Serviços de avatar dinâmico costumam ser leves e já cacheáveis na origem.
    // Evitamos proxy pelo _next/image para reduzir chance de erro/loop local.
    if (hostname === "ui-avatars.com") {
      return true;
    }

    for (const key of parsed.searchParams.keys()) {
      if (key.toLowerCase().startsWith("x-amz-")) {
        return true;
      }
    }

    return false;
  } catch {
    return true;
  }
}
