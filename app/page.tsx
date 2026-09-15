import { HomeDiscovery } from "@/components/home-discovery";
import { HomeHero } from "@/components/home-hero";
import { listPublicPeople } from "@/lib/messaging";
import { listCompanies, listPublishedJobs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [jobs, companies, people] = await Promise.all([
    listPublishedJobs(),
    listCompanies(),
    listPublicPeople(),
  ]);

  return (
    <div>
      <HomeHero />
      <HomeDiscovery jobs={jobs} companies={companies} people={people} />
    </div>
  );
}
