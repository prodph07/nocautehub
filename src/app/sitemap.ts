import type { MetadataRoute } from "next";
import { repository } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3001";
  const protocol = rootDomain.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${rootDomain}`;

  const tenants = await repository.listTenants();
  const activeTenants = tenants.filter((t) => t.status === "active");

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...activeTenants.map((tenant) => ({
      url: tenant.custom_domain
        ? `https://${tenant.custom_domain}`
        : `${baseUrl}/sites/${tenant.slug}`,
      lastModified: new Date(tenant.updated_at || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}

