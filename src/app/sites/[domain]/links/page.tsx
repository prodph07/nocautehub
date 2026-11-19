import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { repository } from "@/lib/repository";
import { LinkBioClient } from "@/components/site/LinkBioClient";
import { SuspendedScreen } from "@/components/site/SuspendedScreen";

export const dynamic = "force-dynamic";

interface LinksPageProps {
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({
  params,
}: LinksPageProps): Promise<Metadata> {
  const { domain } = await params;
  const tenant = await repository.getTenantByDomainOrSlug(
    decodeURIComponent(domain)
  );
  if (!tenant) return { title: "Links | Nocaute Hub" };
  return {
    title: `${tenant.name} — Links Oficiais`,
    description: `Agende sua aula experimental gratuita na ${tenant.name} (${tenant.neighborhood}, ${tenant.city}).`,
  };
}

export default async function TenantLinksPage({ params }: LinksPageProps) {
  const { domain } = await params;
  const tenant = await repository.getTenantByDomainOrSlug(
    decodeURIComponent(domain)
  );

  if (!tenant) notFound();
  if (tenant.status === "suspended") {
    return <SuspendedScreen academyName={tenant.name} />;
  }

  return <LinkBioClient tenant={tenant} />;
}

