/**
 * Gera a URL pública correta de uma academia tanto em ambiente local (localhost -> /sites/<slug>)
 * quanto em produção (https://<slug>.nocautehub.com ou https://<custom_domain>).
 */
export function getTenantUrl(
  tenant: { slug: string; custom_domain?: string | null },
  subPath = ""
): string {
  const cleanSub = subPath.startsWith("/") || subPath.startsWith("#") || !subPath
    ? subPath
    : `/${subPath}`;

  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();

    // Ambiente local
    if (host === "localhost" || host === "127.0.0.1" || host.startsWith("172.") || host.startsWith("192.")) {
      if (cleanSub.startsWith("#")) {
        return `/sites/${tenant.slug}${cleanSub}`;
      }
      return `/sites/${tenant.slug}${cleanSub}`;
    }

    // Se já estamos dentro do próprio subdomínio (.nocautehub.com ou .localhost) ou domínio próprio
    if (
      host === `${tenant.slug}.nocautehub.com` ||
      host === `${tenant.slug}.localhost` ||
      (tenant.custom_domain && host === tenant.custom_domain.toLowerCase())
    ) {
      if (!cleanSub) return "/";
      if (cleanSub.startsWith("#")) return `/${cleanSub}`;
      return cleanSub;
    }
  }

  // Em produção a partir do domínio raiz (nocautehub.com) ou SSR
  if (tenant.custom_domain) {
    return `https://${tenant.custom_domain}${cleanSub.startsWith("#") ? `/${cleanSub}` : cleanSub}`;
  }

  return `https://${tenant.slug}.nocautehub.com${
    cleanSub.startsWith("#") ? `/${cleanSub}` : cleanSub
  }`;
}

/**
 * URL de demonstração (preview) no domínio raiz (/sites/<slug>),
 * usada enquanto a academia ainda não foi ativada no subdomínio oficial.
 */
export function getTenantPreviewUrl(
  tenant: { slug: string },
  subPath = ""
): string {
  const cleanSub =
    subPath.startsWith("/") || subPath.startsWith("#") || !subPath
      ? subPath
      : `/${subPath}`;
  return `/sites/${tenant.slug}${cleanSub}`;
}

