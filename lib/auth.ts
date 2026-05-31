import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerk_id, userId),
  });

  return user || null;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
