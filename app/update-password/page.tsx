import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/account-forms";

export const metadata: Metadata = { title: "New password" };

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="font-heading text-3xl">Set a new password</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        Use the token from your reset email.
      </p>
      {token ? (
        <UpdatePasswordForm token={token} />
      ) : (
        <p className="text-sm text-destructive">
          This page needs a reset token. Request a new link from forgot
          password.
        </p>
      )}
    </div>
  );
}
