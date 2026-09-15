"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dashboard";
import { errorMessage } from "@/lib/errors";
import {
  INBOX_COOKIE,
  markAllNotificationsRead,
  markConversationRead,
  markNotificationRead,
  resolveInboxIdentity,
  sendMessage,
  setConversationFlags,
} from "@/lib/messaging";

export async function switchInboxAction(formData: FormData) {
  const { user } = await requireUser();
  const value = String(formData.get("inbox") ?? "personal");
  const identity = await resolveInboxIdentity(
    user.id,
    value === "personal" ? "personal" : value,
  );
  const jar = await cookies();
  jar.set(
    INBOX_COOKIE,
    identity.kind === "personal" ? "personal" : identity.companyId,
    {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    },
  );
  revalidatePath("/messages");
  redirect("/messages");
}

export async function sendMessageAction(formData: FormData) {
  const { user } = await requireUser();
  const jar = await cookies();
  const identity = await resolveInboxIdentity(
    user.id,
    jar.get(INBOX_COOKIE)?.value,
  );
  const conversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("body") ?? "");
  try {
    await sendMessage({
      conversationId,
      senderUserId: user.id,
      body,
      identity,
    });
  } catch (error) {
    throw new Error(errorMessage(error, "Could not send that message."));
  }
  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  redirect(`/messages/${conversationId}`);
}

export async function toggleFavoriteAction(formData: FormData) {
  const { user } = await requireUser();
  const jar = await cookies();
  const identity = await resolveInboxIdentity(
    user.id,
    jar.get(INBOX_COOKIE)?.value,
  );
  const conversationId = String(formData.get("conversationId") ?? "");
  const next = String(formData.get("next") ?? "true") === "true";
  await setConversationFlags({
    conversationId,
    userId: user.id,
    identity,
    isFavorite: next,
  });
  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
}

export async function toggleArchiveAction(formData: FormData) {
  const { user } = await requireUser();
  const jar = await cookies();
  const identity = await resolveInboxIdentity(
    user.id,
    jar.get(INBOX_COOKIE)?.value,
  );
  const conversationId = String(formData.get("conversationId") ?? "");
  const next = String(formData.get("next") ?? "true") === "true";
  await setConversationFlags({
    conversationId,
    userId: user.id,
    identity,
    isArchived: next,
  });
  revalidatePath("/messages");
  redirect("/messages?filter=archive");
}

export async function markConversationReadAction(conversationId: string) {
  const { user } = await requireUser();
  const jar = await cookies();
  const identity = await resolveInboxIdentity(
    user.id,
    jar.get(INBOX_COOKIE)?.value,
  );
  await markConversationRead(conversationId, user.id, identity);
  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
}

export async function markNotificationReadAction(formData: FormData) {
  const { user } = await requireUser();
  const notificationId = String(formData.get("notificationId") ?? "");
  await markNotificationRead(notificationId, user.id);
  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction() {
  const { user } = await requireUser();
  await markAllNotificationsRead(user.id);
  revalidatePath("/notifications");
}
