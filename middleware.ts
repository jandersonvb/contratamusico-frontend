import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/env";

function getRequestHostname(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = forwardedHost || request.headers.get("host");

  if (!hostHeader) {
    return request.nextUrl.hostname.toLowerCase();
  }

  return hostHeader.split(":")[0].toLowerCase();
}

export function middleware(request: NextRequest) {
  const canonicalUrl = new URL(getSiteUrl());
  const wwwHost = `www.${canonicalUrl.hostname}`;
  const requestHostname = getRequestHostname(request);

  if (requestHostname !== wwwHost) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.hostname = canonicalUrl.hostname;
  redirectUrl.protocol = canonicalUrl.protocol;
  redirectUrl.port = canonicalUrl.port;

  return NextResponse.redirect(redirectUrl, 308);
}
