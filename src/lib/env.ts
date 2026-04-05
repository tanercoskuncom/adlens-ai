/**
 * Ortam değişkenlerinin durumunu kontrol et.
 * Uygulamanın hangi modda çalıştığını belirler.
 */
export function getEnvStatus() {
  const hasDatabase =
    !!process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("XXXX") &&
    !process.env.DATABASE_URL.includes("localhost:5432/adlens_ai");

  const hasAiKey =
    !!process.env.ANTHROPIC_API_KEY &&
    !process.env.ANTHROPIC_API_KEY.includes("PLACEHOLDER");

  const hasAuthSecret =
    !!process.env.NEXTAUTH_SECRET &&
    process.env.NEXTAUTH_SECRET !== "buraya-gizli-bir-key-yaz";

  return {
    hasDatabase,
    hasAiKey,
    hasAuthSecret,
    isProduction: process.env.NODE_ENV === "production",
    mode: hasDatabase && hasAiKey ? "full" : hasAiKey ? "ai-only" : "demo",
  } as const;
}
