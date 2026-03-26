import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const client = createClient({ url, authToken });

const statements = [
  // Add latitude/longitude to families
  `ALTER TABLE "families" ADD COLUMN "latitude" REAL;`,
  `ALTER TABLE "families" ADD COLUMN "longitude" REAL;`,

  // SharedList
  `CREATE TABLE IF NOT EXISTS "shared_lists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "family_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "template" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shared_lists_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "shared_lists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "shared_lists_family_id_idx" ON "shared_lists"("family_id");`,

  // SharedListItem
  `CREATE TABLE IF NOT EXISTS "shared_list_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "list_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shared_list_items_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "shared_lists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "shared_list_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "shared_list_items_list_id_idx" ON "shared_list_items"("list_id");`,

  // Reward
  `CREATE TABLE IF NOT EXISTS "rewards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "family_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "points_cost" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rewards_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rewards_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "rewards_family_id_idx" ON "rewards"("family_id");`,

  // Redemption
  `CREATE TABLE IF NOT EXISTS "redemptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reward_id" TEXT NOT NULL,
    "redeemed_by" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approved_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" DATETIME,
    CONSTRAINT "redemptions_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "rewards" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "redemptions_redeemed_by_fkey" FOREIGN KEY ("redeemed_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "redemptions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "redemptions_reward_id_idx" ON "redemptions"("reward_id");`,

  // PushSubscription
  `CREATE TABLE IF NOT EXISTS "push_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");`,
  `CREATE INDEX IF NOT EXISTS "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");`,

  // NotificationPreference
  `CREATE TABLE IF NOT EXISTS "notification_preferences" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "event_reminders" BOOLEAN NOT NULL DEFAULT true,
    "chore_assignments" BOOLEAN NOT NULL DEFAULT true,
    "morning_digest" BOOLEAN NOT NULL DEFAULT true,
    "reward_approvals" BOOLEAN NOT NULL DEFAULT true
  );`,

  // FamilyPreferences
  `CREATE TABLE IF NOT EXISTS "family_preferences" (
    "family_id" TEXT NOT NULL PRIMARY KEY,
    "dietary_restrictions" TEXT,
    "cuisine_preferences" TEXT,
    "household_size" INTEGER
  );`,
];

async function migrate() {
  console.log("Running migration against Turso...\n");

  for (const sql of statements) {
    const label = sql.trim().slice(0, 60);
    try {
      await client.execute(sql);
      console.log(`  ✓ ${label}...`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Ignore "duplicate column" errors from ALTER TABLE
      if (msg.includes("duplicate column") || msg.includes("already exists")) {
        console.log(`  - ${label}... (already exists, skipped)`);
      } else {
        console.error(`  ✗ ${label}...`);
        console.error(`    ${msg}`);
      }
    }
  }

  console.log("\nDone!");
}

migrate();
