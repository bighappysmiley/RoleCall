import { getAuth, isAuthConfigured } from "@/lib/auth/server";

type RouteContext = { params: Promise<{ path: string[] }> };

function notConfigured() {
  return Response.json(
    { error: "Neon Auth is not configured." },
    { status: 503 },
  );
}

export async function GET(request: Request, context: RouteContext) {
  if (!isAuthConfigured()) {
    return notConfigured();
  }
  return getAuth().handler().GET(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  if (!isAuthConfigured()) {
    return notConfigured();
  }
  return getAuth().handler().POST(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  if (!isAuthConfigured()) {
    return notConfigured();
  }
  return getAuth().handler().PUT(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isAuthConfigured()) {
    return notConfigured();
  }
  return getAuth().handler().PATCH(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isAuthConfigured()) {
    return notConfigured();
  }
  return getAuth().handler().DELETE(request, context);
}
