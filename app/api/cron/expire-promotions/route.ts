import { NextResponse } from "next/server";
import { expirePromotions } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (secret) {
    return header === `Bearer ${secret}`;
  }
  return process.env.NODE_ENV !== "production";
}

async function run(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const expired = await expirePromotions();
  return NextResponse.json({ ok: true, expired });
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
