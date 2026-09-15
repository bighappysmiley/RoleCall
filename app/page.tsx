import { HomeDiscovery } from "@/components/home-discovery";
import { HomeHero } from "@/components/home-hero";
import { listCompanies, listPublishedJobs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [jobs, companies] = await Promise.all([
    listPublishedJobs(),
    listCompanies(),
  ]);

  return (
    <div>
      <HomeHero />
      <HomeDiscovery jobs={jobs} companies={companies} />
    </div>
  );
}
