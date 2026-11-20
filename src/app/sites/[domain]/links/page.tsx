import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { repository } from "@/lib/repository";
import { getPlanCapabilities } from "@/lib/plans";
import { LinkBioClient } from "@/components/site/LinkBioClient";
import { SuspendedScreen } from "@/components/site/SuspendedScreen";
import { PreviewLockedScreen } from "@/components/site/PreviewLockedScreen";
import { PreviewBanner } from "@/components/site/PreviewBanner";

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

  const reqHeaders = await headers();
  const isPublicHost = reqHeaders.get("x-nocaute-public-host") === "1";

  if (tenant.status === "preview" && isPublicHost) {
    return (
      <PreviewLockedScreen
        academyName={tenant.name}
        slug={tenant.slug}
        paymentLinkUrl={tenant.pagarme_payment_link_url}
      />
    );
  }

  if (!getPlanCapabilities(tenant.plan_tier).linkBio) {
    redirect(`/sites/${tenant.slug}`);
  }

  return (
    <>
      {tenant.status === "preview" && !isPublicHost && (
        <PreviewBanner
          slug={tenant.slug}
          paymentLinkUrl={tenant.pagarme_payment_link_url}
        />
      )}
      <LinkBioClient tenant={tenant} />
    </>
  );
}

