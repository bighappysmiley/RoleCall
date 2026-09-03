import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/account-forms";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="font-heading text-3xl">Reset password</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        We will email a link that expires in 15 minutes.
      </p>
      <ResetPasswordForm />
    </div>
  );
}
