/*
 * Plain-CommonJS twin of copy-database.ts, for machines where tsx cannot run.
 *
 * tsx shells out to esbuild, which forks a helper process — on a machine low on memory
 * that fails with "spawn UNKNOWN" before any of our code executes. This version is run
 * directly by node, so there is no transpiler and nothing to fork.
 *
 *   $env:SOURCE_DATABASE_URL = "postgres://...render..."
 *   $env:TARGET_DATABASE_URL = "postgres://...supabase..."
 *   node scripts/copy-database.cjs --dry-run
 *   node scripts/copy-database.cjs
 *
 * The target must already have the schema (`prisma migrate deploy` against it first).
 * Writes use createMany with skipDuplicates, so a re-run after a partial failure resumes
 * rather than double-inserting.
 */
const { PrismaClient } = require('@prisma/client');

const SOURCE = process.env.SOURCE_DATABASE_URL;
const TARGET = process.env.TARGET_DATABASE_URL;
const DRY_RUN = process.argv.includes('--dry-run');

if (!SOURCE || (!TARGET && !DRY_RUN)) {
  console.error('Set SOURCE_DATABASE_URL and TARGET_DATABASE_URL (TARGET not needed for --dry-run).');
  process.exit(1);
}

/*
 * Insert order matters: a row cannot reference a row that does not exist yet. Independent
 * tables first, then everything that points at them.
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
];

// Moved in pieces so a slow connection cannot time out mid-table.
const BATCH = 200;

async function main() {
  const source = new PrismaClient({ datasources: { db: { url: SOURCE } } });
  const target = DRY_RUN ? null : new PrismaClient({ datasources: { db: { url: TARGET } } });

  const summary = [];

  try {
    for (const table of TABLES) {
      const src = source[table];
      const total = await src.count();

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

      const dst = target[table];
      let copied = 0;

      for (let skip = 0; skip < total; skip += BATCH) {
        const rows = await src.findMany({ skip, take: BATCH });
        const result = await dst.createMany({ data: rows, skipDuplicates: true });
        copied += result.count;
      }

      summary.push({ table, source: total, copied });
      const flag = copied === total ? 'ok' : `${total - copied} already present`;
      console.log(
        `${table.padEnd(24)} ${String(total).padStart(5)} -> ${String(copied).padStart(5)}  ${flag}`,
      );
    }

    console.log('\n--- summary ---');
    console.log(`rows in source: ${summary.reduce((n, r) => n + r.source, 0)}`);
    if (!DRY_RUN) {
      console.log(`rows written  : ${summary.reduce((n, r) => n + r.copied, 0)}`);
    }

    // Count the target rather than trusting the write counts: skipDuplicates makes a
    // re-run report fewer writes than rows, which would look like a failure.
    if (target) {
      console.log('\n--- verification: counts in the target database ---');
      let mismatch = false;
      for (const row of summary) {
        const actual = await target[row.table].count();
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
    if (target) await target.$disconnect();
  }
}

main().catch((err) => {
  console.error('\nCopy failed:', err && err.message ? err.message : err);
  console.error('Nothing was switched over — the source database is untouched.');
  process.exit(1);
});
