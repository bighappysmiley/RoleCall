import { isAuthConfigured } from "@/lib/auth/server";
import { usingLiveDatabase } from "@/lib/queries";

export function SetupBanner() {
  const db = usingLiveDatabase();
  const auth = isAuthConfigured();

  if (db && auth) {
    return null;
  }

  return (
    <div className="border-b border-line bg-fog px-4 py-2 text-center text-sm text-muted-foreground">
      RoleCall is temporarily unavailable. Please try again soon.
    </div>
  );
}
