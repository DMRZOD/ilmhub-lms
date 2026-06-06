/**
 * Read-only inspection of Mux assets vs. video lessons.
 *   node --env-file=.env -r ts-node/register/transpile-only scripts/mux-inspect.ts
 */
import Mux from '@mux/mux-node';
import { PrismaClient } from '@prisma/client';

async function main() {
  const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
  });
  const prisma = new PrismaClient();

  // --- Mux assets currently on the account ---
  const assets: Array<{
    id: string;
    playbackId: string | null;
    status?: string;
    duration: number;
    passthrough?: string;
  }> = [];
  for await (const a of mux.video.assets.list({ limit: 100 })) {
    assets.push({
      id: a.id,
      playbackId: a.playback_ids?.[0]?.id ?? null,
      status: a.status,
      duration: Math.round(a.duration ?? 0),
      passthrough: a.passthrough,
    });
  }
  console.log(`\n=== Mux assets on account: ${assets.length} ===`);
  for (const a of assets) {
    console.log(
      `  ${a.id}  playback=${a.playbackId ?? '—'}  status=${a.status}  dur=${a.duration}s  passthrough=${a.passthrough ?? '—'}`,
    );
  }
  const liveAssetIds = new Set(assets.map((a) => a.id));

  // --- Video lessons in DB ---
  const videoLessons = await prisma.lesson.findMany({
    where: { type: 'VIDEO' },
    select: {
      id: true,
      title: true,
      videoAssetId: true,
      muxPlaybackId: true,
      muxAssetStatus: true,
      section: {
        select: { course: { select: { id: true, title: true, status: true } } },
      },
    },
  });
  const onLiveAccount = videoLessons.filter(
    (l) => l.videoAssetId && liveAssetIds.has(l.videoAssetId),
  );
  const broken = videoLessons.filter(
    (l) => !l.videoAssetId || !liveAssetIds.has(l.videoAssetId),
  );

  console.log(`\n=== Video lessons: ${videoLessons.length} ===`);
  console.log(`  point at a LIVE Mux asset (working): ${onLiveAccount.length}`);
  console.log(`  broken / off-account / empty       : ${broken.length}`);

  // group by course
  const byCourse = new Map<string, { title: string; status: string; total: number; working: number }>();
  for (const l of videoLessons) {
    const c = l.section.course;
    const e = byCourse.get(c.id) ?? { title: c.title, status: c.status, total: 0, working: 0 };
    e.total += 1;
    if (l.videoAssetId && liveAssetIds.has(l.videoAssetId)) e.working += 1;
    byCourse.set(c.id, e);
  }
  console.log(`\n=== By course ===`);
  for (const [, c] of byCourse) {
    console.log(`  [${c.status}] ${c.title} — ${c.total} video lessons, ${c.working} working`);
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
