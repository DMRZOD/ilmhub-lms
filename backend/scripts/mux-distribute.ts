/**
 * Randomly point every "broken" VIDEO lesson at one of the working Mux assets.
 *
 * The free Mux plan caps the account at 10 assets. We currently have 10 real,
 * playable assets (uploaded into the HTML/CSS course). Every *other* video
 * lesson was seeded with playback IDs that live on a different / dead Mux
 * account, so they don't play. This spreads the 10 working videos randomly
 * (even distribution, random order) across those broken lessons so the whole
 * catalogue plays. Lessons already pointing at a live asset are left untouched.
 *
 *   node --env-file=.env -r ts-node/register/transpile-only scripts/mux-distribute.ts          # dry-run
 *   node --env-file=.env -r ts-node/register/transpile-only scripts/mux-distribute.ts --apply  # write to DB
 */
import Mux from '@mux/mux-node';
import { PrismaClient } from '@prisma/client';

const APPLY = process.argv.includes('--apply');

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function main() {
  const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
  });
  const prisma = new PrismaClient();

  // Working assets = ready, with a public playback id.
  const assets: Array<{ id: string; playbackId: string; duration: number }> = [];
  for await (const a of mux.video.assets.list({ limit: 100 })) {
    const playbackId = a.playback_ids?.[0]?.id;
    if (a.status === 'ready' && playbackId) {
      assets.push({ id: a.id, playbackId, duration: Math.round(a.duration ?? 0) });
    }
  }
  if (assets.length === 0) throw new Error('No ready Mux assets with playback IDs found');
  const liveIds = new Set(assets.map((a) => a.id));
  console.log(`Working Mux assets: ${assets.length}`);

  // Broken video lessons = type VIDEO not already pointing at a live asset.
  const lessons = await prisma.lesson.findMany({
    where: { type: 'VIDEO' },
    select: {
      id: true,
      videoAssetId: true,
      section: { select: { course: { select: { title: true } } } },
    },
  });
  const broken = lessons.filter((l) => !l.videoAssetId || !liveIds.has(l.videoAssetId));
  console.log(`Video lessons total: ${lessons.length}, leaving working ones, fixing: ${broken.length}\n`);

  // Even-ish random distribution: deal from a reshuffled bag.
  const order = shuffle(broken);
  let bag: typeof assets = [];
  const counts = new Map<string, number>();
  const plan: Array<{ lessonId: string; course: string; asset: (typeof assets)[number] }> = [];
  for (const lesson of order) {
    if (bag.length === 0) bag = shuffle(assets);
    const asset = bag.pop()!;
    counts.set(asset.id, (counts.get(asset.id) ?? 0) + 1);
    plan.push({ lessonId: lesson.id, course: lesson.section.course.title, asset });
  }

  console.log('Distribution per asset:');
  for (const a of assets) {
    console.log(`  ${a.playbackId}  (${a.duration}s)  → ${counts.get(a.id) ?? 0} lessons`);
  }

  if (!APPLY) {
    console.log(`\nDRY-RUN. ${plan.length} lessons would be updated. Re-run with --apply to write.`);
    await prisma.$disconnect();
    return;
  }

  console.log(`\nApplying to ${plan.length} lessons…`);
  let done = 0;
  for (const { lessonId, asset } of plan) {
    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        videoAssetId: asset.id,
        muxPlaybackId: asset.playbackId,
        durationSeconds: asset.duration,
        muxAssetStatus: 'READY',
        muxUploadId: null,
      },
    });
    done += 1;
  }
  console.log(`Done. Updated ${done} lessons.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
