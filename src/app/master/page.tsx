import { redirect } from "next/navigation";
import { isMasterAuthenticated } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { MasterDashboardClient } from "@/components/master/MasterDashboardClient";

export const dynamic = "force-dynamic";

export default async function MasterDashboardPage() {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    redirect("/master/login");
  }

  const tenants = await repository.listTenants();
  return (
    <MasterDashboardClient
      initialTenants={tenants}
      localMode={repository.isLocalMode()}
    />
  );
}

