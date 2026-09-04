export class PlanLimitError extends Error {
  readonly code = "PLAN_LIMIT";
  readonly limitName: string;
  readonly currentPlan: string;
  readonly nextPlan: string | null;

  constructor(
    message: string,
    meta: {
      limitName: string;
      currentPlan: string;
      nextPlan: string | null;
    },
  ) {
    super(message);
    this.name = "PlanLimitError";
    this.limitName = meta.limitName;
    this.currentPlan = meta.currentPlan;
    this.nextPlan = meta.nextPlan;
  }
}

export function isPlanLimitError(error: unknown): error is PlanLimitError {
  return error instanceof PlanLimitError;
}

export class InsufficientCreditsError extends Error {
  readonly code = "INSUFFICIENT_CREDITS";

  constructor(message: string) {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

export class StripeNotConfiguredError extends Error {
  readonly code = "STRIPE_NOT_CONFIGURED";

  constructor(
    message = "Stripe test keys are not in .env.local yet. Billing checkout cannot run until they are added.",
  ) {
    super(message);
    this.name = "StripeNotConfiguredError";
  }
}

export function toActionError(error: unknown): { error: string } {
  if (error instanceof PlanLimitError || error instanceof Error) {
    return { error: error.message };
  }
  return { error: "Something went wrong. Try again." };
}

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
