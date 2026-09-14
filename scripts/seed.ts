/**
 * RoleCall does not ship placeholder companies or jobs.
 * Real listings come from employers who create accounts and publish roles.
 *
 * This script is intentionally a no-op so `npm run seed` cannot repopulate
 * fake board data.
 */

async function main() {
  console.log(
    "Seed is disabled. RoleCall has no demo companies or jobs — publish real roles from the dashboard.",
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
