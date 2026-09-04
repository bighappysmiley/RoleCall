import { isAuthConfigured } from "@/lib/auth/server";
import { usingLiveDatabase } from "@/lib/queries";

export function SetupBanner() {
  const db = usingLiveDatabase();
  const auth = isAuthConfigured();

  if (db && auth) {
    return null;
  }

  const missing = [
    !db ? "the database" : null,
    !auth ? "sign-in" : null,
  ].filter((item): item is string => item !== null);

  return (
    <div className="border-b border-line bg-fog px-4 py-2 text-center font-mono text-[11px] tracking-wide text-muted-foreground">
      This is not connected to Neon yet. Add the keys in{" "}
      <span className="text-ink">Vercel → Settings → Environment Variables</span>
      {" "}(or <span className="text-ink">.env.local</span> on your Mac) to turn on{" "}
      {missing.join(" and ")}.
    </div>
  );
}
