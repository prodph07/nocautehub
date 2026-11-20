import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Intercepta todas as rotas exceto arquivos estáticos e internals do Next.js
     */
    "/((?!api/|_next/|_static/|uploads/|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const rawHost = req.headers.get("host") || "localhost:3000";
  const hostname = rawHost.split(":")[0].toLowerCase();

  const rootDomainEnv = (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN || "nocautehub.com"
  )
    .split(":")[0]
    .toLowerCase();

  const isRootDomain =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "nocautehub.com" ||
    hostname === "www.nocautehub.com" ||
    hostname === rootDomainEnv ||
    hostname === `www.${rootDomainEnv}` ||
    hostname.endsWith(".pages.dev") ||
    hostname.endsWith(".workers.dev") ||
    hostname.endsWith(".vercel.app");

  // Helper para marcar requisições vindas de subdomínio oficial ou domínio próprio
  const rewriteToTenant = (target: string) => {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nocaute-public-host", "1");
    return NextResponse.rewrite(
      new URL(`/sites/${target}${url.pathname}${url.search}`, req.url),
      { request: { headers: requestHeaders } }
    );
  };

  // Subdomínio local (ex: nocaute-fight-club.localhost)
  if (hostname.endsWith(".localhost")) {
    const slug = hostname.replace(".localhost", "");
    if (slug && slug !== "www") {
      return rewriteToTenant(slug);
    }
  }

  // Subdomínio oficial *.nocautehub.com (ex: ftm.nocautehub.com)
  if (hostname.endsWith(".nocautehub.com")) {
    const slug = hostname.replace(".nocautehub.com", "");
    if (slug && slug !== "www") {
      return rewriteToTenant(slug);
    }
  }

  // Subdomínio do domínio principal (ex: alfa.nocautehub.com.br)
  if (
    !isRootDomain &&
    rootDomainEnv !== "localhost" &&
    hostname.endsWith(`.${rootDomainEnv}`)
  ) {
    const slug = hostname.replace(`.${rootDomainEnv}`, "");
    if (slug && slug !== "www") {
      return rewriteToTenant(slug);
    }
  }

  // Domínio principal da plataforma (Institucional + Painel Master + preview /sites/[domain])
  if (isRootDomain) {
    return NextResponse.next();
  }

  // Domínio próprio de cliente (ex: academiaalfa.com.br -> /sites/academiaalfa.com.br)
  const cleanCustomDomain = hostname.replace(/^www\./, "");
  return rewriteToTenant(cleanCustomDomain);
}
