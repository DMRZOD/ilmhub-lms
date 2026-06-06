/**
 * Mux asset cleanup / inspection.
 *
 * The free Mux plan caps the account at 10 assets. Re-uploading a lesson video
 * leaves the *previous* asset on Mux (we only null out `videoAssetId`), so over
 * time orphaned assets pile up and Mux starts rejecting new direct uploads with
 * "Free plan is limited to 10 assets".
 *
 * This script lists every Mux asset and cross-references it against the lessons
 * that actually point at it (`Lesson.videoAssetId`). Anything not referenced is
 * an orphan and can be safely deleted.
 *
 *   ts-node scripts/mux-cleanup.ts            # dry-run: report only, deletes nothing
 *   ts-node scripts/mux-cleanup.ts --delete   # actually delete the orphans
 */
import Mux from '@mux/mux-node';
import { PrismaClient } from '@prisma/client';

const APPLY = process.argv.includes('--delete');

async function main() {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error('MUX_TOKEN_ID / MUX_TOKEN_SECRET are not set');
  }
  const mux = new Mux({ tokenId, tokenSecret });
  const prisma = new PrismaClient();

  // Every asset id a lesson currently points at = "in use".
  const lessons = await prisma.lesson.findMany({
    where: { videoAssetId: { not: null } },
    select: { videoAssetId: true },
  });
  const referenced = new Set(lessons.map((l) => l.videoAssetId as string));

  // Page through all Mux assets.
  const assets: Array<{ id: string; created_at: string; status?: string; passthrough?: string }> = [];
  for await (const a of mux.video.assets.list({ limit: 100 })) {
    assets.push({
      id: a.id,
      created_at: a.created_at,
      status: a.status,
      passthrough: a.passthrough,
    });
  }

  const orphans = assets.filter((a) => !referenced.has(a.id));
  const inUse = assets.length - orphans.length;

  console.log(`\nMux assets total : ${assets.length}`);
  console.log(`  in use (lesson): ${inUse}`);
  console.log(`  orphaned       : ${orphans.length}\n`);

  if (orphans.length === 0) {
    console.log('Nothing to clean up.');
    await prisma.$disconnect();
    return;
  }

  for (const a of orphans) {
    const created = new Date(Number(a.created_at) * 1000).toISOString();
    console.log(
      `  - ${a.id}  status=${a.status ?? '?'}  passthrough=${a.passthrough ?? '—'}  created=${created}`,
    );
  }

  if (!APPLY) {
    console.log(`\nDRY-RUN. Re-run with --delete to remove the ${orphans.length} orphaned asset(s).`);
    await prisma.$disconnect();
    return;
  }

  console.log(`\nDeleting ${orphans.length} orphaned asset(s)…`);
  let deleted = 0;
  for (const a of orphans) {
    try {
      await mux.video.assets.delete(a.id);
      deleted += 1;
      console.log(`  deleted ${a.id}`);
    } catch (err) {
      console.error(`  FAILED ${a.id}:`, (err as Error).message);
    }
  }
  console.log(`\nDone. Deleted ${deleted}/${orphans.length}.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
