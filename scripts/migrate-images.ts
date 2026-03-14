/**
 * Migration script: Copy images from Supabase Storage → ImageKit
 * and update all URLs in the database.
 *
 * Usage:
 *   DRY_RUN=true npx tsx scripts/migrate-images.ts   # Preview only
 *   npx tsx scripts/migrate-images.ts                 # Actually migrate
 *
 * Required env vars (from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   IMAGEKIT_PRIVATE_KEY
 *   IMAGEKIT_URL_ENDPOINT
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ─── Load .env.local ────────────────────────────────────────────────────────
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// ─── Config ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY!;
const DRY_RUN = process.env.DRY_RUN === "true";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing SUPABASE env vars. Check .env.local");
  process.exit(1);
}
if (!IMAGEKIT_PRIVATE_KEY) {
  console.error("❌ Missing IMAGEKIT_PRIVATE_KEY. Check .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── ImageKit upload ────────────────────────────────────────────────────────
async function uploadToImageKit(
  imageBuffer: Buffer,
  fileName: string,
): Promise<string> {
  const base64 = imageBuffer.toString("base64");

  const form = new URLSearchParams();
  form.append("file", base64);
  form.append("fileName", fileName);
  form.append("folder", "/account-images/");

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(IMAGEKIT_PRIVATE_KEY + ":").toString("base64")}`,
    },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ImageKit upload failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.url as string;
}

// ─── Download from URL ──────────────────────────────────────────────────────
async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}): ${url}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ─── Extract file name from Supabase URL ────────────────────────────────────
function extractFileName(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1] || `unknown-${Date.now()}.jpg`;
}

// ─── Check if URL is from Supabase Storage ──────────────────────────────────
function isSupabaseUrl(url: string): boolean {
  return url.includes("supabase.co/storage/");
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Image Migration: Supabase → ImageKit");
  console.log(`   Mode: ${DRY_RUN ? "🔍 DRY RUN (no changes)" : "⚡ LIVE"}`);
  console.log("");

  // 1. Fetch all accounts
  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("id, title, images, primary_image_url");

  if (error) {
    console.error("❌ Failed to fetch accounts:", error.message);
    process.exit(1);
  }

  console.log(`📋 Found ${accounts.length} accounts to process\n`);

  // Collect all unique Supabase URLs
  const urlMap = new Map<string, string>(); // old → new
  const allSupabaseUrls = new Set<string>();

  for (const account of accounts) {
    const urls: string[] = [
      ...(account.images ?? []),
      ...(account.primary_image_url ? [account.primary_image_url] : []),
    ];
    for (const url of urls) {
      if (isSupabaseUrl(url)) {
        allSupabaseUrls.add(url);
      }
    }
  }

  console.log(`🔗 Found ${allSupabaseUrls.size} unique Supabase image URLs\n`);

  if (DRY_RUN) {
    for (const url of allSupabaseUrls) {
      console.log(`   📸 Would migrate: ${extractFileName(url)}`);
    }
    console.log("\n✅ Dry run complete. Set DRY_RUN=false to actually migrate.");
    return;
  }

  // 2. Download & upload each unique image
  let successCount = 0;
  let failCount = 0;

  for (const oldUrl of allSupabaseUrls) {
    const fileName = extractFileName(oldUrl);
    try {
      console.log(`   ⬇️  Downloading: ${fileName}`);
      const buffer = await downloadImage(oldUrl);

      console.log(`   ⬆️  Uploading to ImageKit: ${fileName}`);
      const newUrl = await uploadToImageKit(buffer, fileName);

      urlMap.set(oldUrl, newUrl);
      console.log(`   ✅ ${fileName} → ${newUrl}\n`);
      successCount++;
    } catch (err: unknown) {
      console.error(`   ❌ Failed: ${fileName} — ${err instanceof Error ? err.message : "Unknown error"}\n`);
      failCount++;
    }
  }

  console.log(
    `\n📊 Upload results: ${successCount} success, ${failCount} failed\n`,
  );

  if (failCount > 0) {
    console.log("⚠️  Some images failed. Continuing with partial update...\n");
  }

  // 3. Save mapping log
  const logPath = path.resolve(process.cwd(), "scripts/migration-log.json");
  const logData = Object.fromEntries(urlMap);
  fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
  console.log(`📝 Saved URL mapping to: ${logPath}\n`);

  // 4. Update database
  let updatedCount = 0;
  for (const account of accounts) {
    const oldImages: string[] = account.images ?? [];
    const oldPrimary: string | null = account.primary_image_url;

    const newImages = oldImages.map((url: string) => urlMap.get(url) ?? url);
    const newPrimary = oldPrimary
      ? urlMap.get(oldPrimary) ?? oldPrimary
      : null;

    // Only update if something actually changed
    const imagesChanged =
      JSON.stringify(newImages) !== JSON.stringify(oldImages);
    const primaryChanged = newPrimary !== oldPrimary;

    if (imagesChanged || primaryChanged) {
      const { error: updateError } = await supabase
        .from("accounts")
        .update({
          images: newImages,
          primary_image_url: newPrimary,
        })
        .eq("id", account.id);

      if (updateError) {
        console.error(
          `   ❌ DB update failed for "${account.title}": ${updateError.message}`,
        );
      } else {
        console.log(`   ✅ Updated DB for: "${account.title}"`);
        updatedCount++;
      }
    }
  }

  console.log(`\n🎉 Migration complete!`);
  console.log(`   ${successCount} images uploaded to ImageKit`);
  console.log(`   ${updatedCount} accounts updated in database`);
  console.log(
    `   Mapping log saved to: scripts/migration-log.json`,
  );
  console.log(
    `\n💡 Tip: Keep Supabase Storage images for 1-2 weeks as backup, then delete.`,
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
