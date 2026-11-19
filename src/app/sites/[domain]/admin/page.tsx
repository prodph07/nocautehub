import { notFound } from "next/navigation";
import { repository } from "@/lib/repository";
import { isTenantAdminAuthenticated } from "@/lib/client-auth";
import { ClientAdminLogin } from "@/components/admin/ClientAdminLogin";
import { ClientAdminDashboard } from "@/components/admin/ClientAdminDashboard";

export const dynamic = "force-dynamic";

interface TenantAdminPageProps {
  params: Promise<{ domain: string }>;
}

export default async function TenantAdminPage({
  params,
}: TenantAdminPageProps) {
  const { domain } = await params;
  const tenant = await repository.getTenantByDomainOrSlug(
    decodeURIComponent(domain)
  );

  if (!tenant) {
    notFound();
  }

  const authed = await isTenantAdminAuthenticated(tenant.id);
  if (!authed) {
    return (
      <ClientAdminLogin
        tenantId={tenant.id}
        tenantName={tenant.name}
        slug={tenant.slug}
        primaryColor={tenant.theme_config?.primary || "#E11D48"}
        defaultHintEmail={tenant.admin_email || `dono@${tenant.slug}.com.br`}
        localMode={repository.isLocalMode()}
      />
    );
  }

  const [leads, analytics] = await Promise.all([
    repository.listLeads(tenant.id),
    repository.getWeeklyAnalytics(tenant.id),
  ]);

  return (
    <ClientAdminDashboard
      initialTenant={tenant}
      initialLeads={leads}
      analytics={analytics}
    />
  );
}

