/*
 * One-time copy of every row from one PostgreSQL database into another.
 *
 * Written because the machine doing the migration has no pg_dump and no PostgreSQL
 * install, and running Docker on it is not practical. Prisma already knows the whole
 * schema, so it can do the copy with tooling that is already present.
 *
 * Usage — both URLs are read from the environment so neither ends up in shell history:
 *
 *   SOURCE_DATABASE_URL="postgres://...render..."   \
 *   TARGET_DATABASE_URL="postgres://...supabase..." \
 *   npx tsx scripts/copy-database.ts
 *
 * Add --dry-run to count the source rows and write nothing.
 *
 * The target must already have the schema (run `prisma migrate deploy` against it first).
 * The copy is additive and uses createMany with skipDuplicates, so re-running it after a
 * partial failure resumes rather than double-inserting.
 */
import { PrismaClient } from '@prisma/client';

const SOURCE = process.env.SOURCE_DATABASE_URL;
const TARGET = process.env.TARGET_DATABASE_URL;
const DRY_RUN = process.argv.includes('--dry-run');

if (!SOURCE || (!TARGET && !DRY_RUN)) {
  console.error(
    'Set SOURCE_DATABASE_URL and TARGET_DATABASE_URL (TARGET not needed for --dry-run).',
  );
  process.exit(1);
}

/*
 * Insert order matters: a row cannot reference a row that does not exist yet. This list
 * is ordered so every foreign key already has its target by the time it is written —
 * independent tables first, then the things that point at them.
 */
const TABLES = [
  'level',
  'category',
  'user',
  'refreshToken',
  'studentProfile',
  'track',
  'module',
  'topic',
  'competency',
  'moduleQuiz',
  'trackAssessment',
  'quizQuestion',
  'quizAttempt',
  'enrollment',
  'topicProgress',
  'submission',
  'submissionRubricCheck',
  'storedFile',
  'credential',
  'auditLog',
  'officeHourSlot',
  'officeHourBooking',
  'bookmark',
  'collection',
  'collectionItem',
  'notification',
] as const;

type TableName = (typeof TABLES)[number];

// Big tables are moved in pieces so a slow connection cannot time out mid-table.
const BATCH = 200;

async function main() {
  const source = new PrismaClient({ datasources: { db: { url: SOURCE } } });
  const target = DRY_RUN
    ? null
    : new PrismaClient({ datasources: { db: { url: TARGET } } });

  const summary: { table: string; source: number; copied: number }[] = [];

  try {
    for (const table of TABLES) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const src = (source as any)[table];
      const total: number = await src.count();

      if (total === 0) {
        summary.push({ table, source: 0, copied: 0 });
        console.log(`${table.padEnd(24)} 0`);
        continue;
      }

      if (DRY_RUN || !target) {
        summary.push({ table, source: total, copied: 0 });
        console.log(`${table.padEnd(24)} ${total}`);
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dst = (target as any)[table];
      let copied = 0;

      for (let skip = 0; skip < total; skip += BATCH) {
        const rows = await src.findMany({ skip, take: BATCH });
        const result = await dst.createMany({ data: rows, skipDuplicates: true });
        copied += result.count;
      }

      summary.push({ table, source: total, copied });
      const flag = copied === total ? 'ok' : `${total - copied} already present`;
      console.log(`${table.padEnd(24)} ${String(total).padStart(5)} -> ${String(copied).padStart(5)}  ${flag}`);
    }

    console.log('\n--- summary ---');
    const totalSource = summary.reduce((n, r) => n + r.source, 0);
    const totalCopied = summary.reduce((n, r) => n + r.copied, 0);
    console.log(`rows in source: ${totalSource}`);
    if (!DRY_RUN) console.log(`rows written  : ${totalCopied}`);

    // Verify against the target rather than trusting the write counts, since
    // skipDuplicates makes a re-run report fewer writes than rows.
    if (target) {
      console.log('\n--- verification: counts in the target database ---');
      let mismatch = false;
      for (const row of summary) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const actual: number = await (target as any)[row.table].count();
        const ok = actual === row.source;
        if (!ok) mismatch = true;
        console.log(
          `${row.table.padEnd(24)} source ${String(row.source).padStart(5)}  target ${String(actual).padStart(5)}  ${ok ? 'match' : 'MISMATCH'}`,
        );
      }
      console.log(
        mismatch
          ? '\nSome tables do not match. Do NOT switch DATABASE_URL yet.'
          : '\nEvery table matches. Safe to switch DATABASE_URL.',
      );
      process.exitCode = mismatch ? 1 : 0;
    }
  } finally {
    await source.$disconnect();
    await target?.$disconnect();
  }
}

main().catch((err) => {
  console.error('\nCopy failed:', err instanceof Error ? err.message : err);
  console.error('Nothing was switched over — the source database is untouched.');
  process.exit(1);
});
