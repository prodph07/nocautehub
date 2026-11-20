import { redirect } from "next/navigation";
import { isMasterAuthenticated } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { getPlatformSettings } from "@/lib/platform-settings";
import { MasterDashboardClient } from "@/components/master/MasterDashboardClient";

export const dynamic = "force-dynamic";

export default async function MasterDashboardPage() {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    redirect("/master/login");
  }

  const [tenants, platformSettings] = await Promise.all([
    repository.listTenants(),
    getPlatformSettings(),
  ]);

  return (
    <MasterDashboardClient
      initialTenants={tenants}
      initialPlatformSettings={platformSettings}
      localMode={repository.isLocalMode()}
    />
  );
}

