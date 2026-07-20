import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Simple in-memory rate limiter for Edge
const rateLimit = new Map<string, { count: number; timestamp: number }>();

export async function updateSession(request: NextRequest) {
  // 1. Rate Limiting Check (Bypassed in local development to avoid blocking Next.js internal requests)
  if (process.env.NODE_ENV !== 'development') {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100; // Limit each IP to 100 requests per window

    const requestData = rateLimit.get(ip);

    if (requestData && now - requestData.timestamp < windowMs) {
      if (requestData.count >= maxRequests) {
        return new NextResponse("Too Many Requests", { status: 429 });
      }
      requestData.count += 1;
      rateLimit.set(ip, requestData);
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now });
    }
  }

  // 2. Session Management
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}
