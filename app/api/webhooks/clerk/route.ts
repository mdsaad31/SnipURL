import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "../../../../lib/db";
import { users } from "../../../../lib/db/schema";
import { env } from "../../../../lib/env";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.warn("CLERK_WEBHOOK_SECRET not configured — skipping webhook verification");
    return new Response("Webhook secret not configured", { status: 200 });
  }

  // Get the headers (must be awaited in Next.js 14.2+)
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // ─── Handle events ─────────────────────────────────────────────

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses } = evt.data;
    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id
    );

    if (primaryEmail) {
      try {
        // Upsert — handles both creation and updates, and prevents duplicate errors on retries
        const existing = await db.query.users.findFirst({
          where: eq(users.clerk_id, id),
        });

        if (existing) {
          await db
            .update(users)
            .set({
              email: primaryEmail.email_address,
              updated_at: new Date(),
            })
            .where(eq(users.clerk_id, id));
        } else {
          await db.insert(users).values({
            clerk_id: id,
            email: primaryEmail.email_address,
          });
        }
      } catch (err) {
        console.error("Error upserting user:", err);
        return new Response("Error syncing user", { status: 500 });
      }
    }
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      try {
        await db.delete(users).where(eq(users.clerk_id, id));
      } catch (err) {
        console.error("Error deleting user:", err);
        return new Response("Error deleting user", { status: 500 });
      }
    }
  }

  return new Response("", { status: 200 });
}
