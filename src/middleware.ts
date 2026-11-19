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

  const rootDomainEnv = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000")
    .split(":")[0]
    .toLowerCase();

  const isRootDomain =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === rootDomainEnv ||
    hostname === `www.${rootDomainEnv}` ||
    hostname.endsWith(".pages.dev") ||
    hostname.endsWith(".vercel.app");

  // Subdomínio local (ex: nocaute-fight-club.localhost)
  if (hostname.endsWith(".localhost")) {
    const slug = hostname.replace(".localhost", "");
    if (slug && slug !== "www") {
      return NextResponse.rewrite(
        new URL(`/sites/${slug}${url.pathname}${url.search}`, req.url)
      );
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
      return NextResponse.rewrite(
        new URL(`/sites/${slug}${url.pathname}${url.search}`, req.url)
      );
    }
  }

  // Domínio principal da plataforma (Institucional + Painel Master + preview /_sites/[domain])
  if (isRootDomain) {
    return NextResponse.next();
  }

  // Domínio próprio de cliente (ex: academiaalfa.com.br -> /_sites/academiaalfa.com.br)
  const cleanCustomDomain = hostname.replace(/^www\./, "");
  return NextResponse.rewrite(
    new URL(`/sites/${cleanCustomDomain}${url.pathname}${url.search}`, req.url)
  );
}
