import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/settings");

  // DB bağlı değilse auth bypass (geliştirme modu)
  const dbConnected = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("XXXX");

  if (!dbConnected) {
    // Auth sayfalarından dashboard'a yönlendir (DB yoksa login gereksiz)
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // DB bağlı — gerçek auth kontrolü
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Auth sayfasındayken giriş yapmışsa dashboard'a yönlendir
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Korumalı sayfada giriş yapmamışsa login'e yönlendir
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/login", "/register"],
};
