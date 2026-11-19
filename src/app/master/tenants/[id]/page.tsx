import { notFound, redirect } from "next/navigation";
import { isMasterAuthenticated } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { TenantEditorClient } from "@/components/master/TenantEditorClient";

export const dynamic = "force-dynamic";

interface EditTenantPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTenantPage({ params }: EditTenantPageProps) {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    redirect("/master/login");
  }

  const { id } = await params;
  const tenant = await repository.getTenantById(id);
  if (!tenant) {
    notFound();
  }

  const leads = await repository.listLeads(id);
  return <TenantEditorClient initialTenant={tenant} initialLeads={leads} />;
}

