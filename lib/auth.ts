import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

/**
 * Get the current user from the local database.
 * If the user is authenticated with Clerk but doesn't exist in our DB yet
 * (e.g., webhook hasn't fired), we auto-provision them as a fallback.
 */
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Try to find user in local DB
  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerk_id, userId),
  });

  if (existingUser) {
    return existingUser;
  }

  // User is authenticated with Clerk but not in our DB yet.
  // Auto-provision them (webhook may not have fired yet).
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) return null;

    const [newUser] = await db
      .insert(users)
      .values({
        clerk_id: userId,
        email,
      })
      .onConflictDoNothing({ target: users.clerk_id })
      .returning();

    // If onConflictDoNothing kicked in, re-fetch
    if (!newUser) {
      return db.query.users.findFirst({
        where: eq(users.clerk_id, userId),
      }) ?? null;
    }

    return newUser;
  } catch (error) {
    console.error("Auto-provision user failed:", error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
