-- Removes the sample data the seed script ships, at the CEO's request: he signed in to a
-- brand-new evaluator account and found six approvals waiting, and three courses he had
-- never authored were live on the public landing page.
--
-- Scope is exact rather than inferred. Every account the seed creates uses @dojo.edu, an
-- address no real user has, and it publishes three courses by fixed title.
--
-- Order matters. Five tables keep a bare user column with no foreign key —
-- QuizAttempt, Enrollment, TopicProgress, Submission and Credential — so deleting a user
-- leaves their rows behind as debris that still counts in the evaluator's queue. They are
-- removed explicitly. Submissions attached to a seeded course must also go before the
-- course does: Prisma's default for an optional relation is SET NULL, so deleting the
-- topics first would strand them pointing at nothing instead of removing them.

CREATE TEMP TABLE seed_users AS
  SELECT id FROM "User" WHERE email LIKE '%@dojo.edu';

CREATE TEMP TABLE seed_tracks AS
  SELECT id FROM "Track"
  WHERE title IN ('The Hardware Course', 'The Software Course', 'The Data Science Course');

CREATE TEMP TABLE seed_modules AS
  SELECT id FROM "Module" WHERE "trackId" IN (SELECT id FROM seed_tracks);

CREATE TEMP TABLE seed_topics AS
  SELECT id FROM "Topic" WHERE "moduleId" IN (SELECT id FROM seed_modules);

-- 1. Work belonging to a seed account, or attached to a seeded course.
DELETE FROM "QuizAttempt" WHERE "userId" IN (SELECT id FROM seed_users);

DELETE FROM "TopicProgress"
  WHERE "userId" IN (SELECT id FROM seed_users)
     OR "topicId" IN (SELECT id FROM seed_topics);

DELETE FROM "Enrollment"
  WHERE "userId" IN (SELECT id FROM seed_users)
     OR "trackId" IN (SELECT id FROM seed_tracks);

DELETE FROM "Submission"
  WHERE "studentId" IN (SELECT id FROM seed_users)
     OR "topicId" IN (SELECT id FROM seed_topics)
     OR "moduleId" IN (SELECT id FROM seed_modules);

-- A certificate for a course that no longer exists would keep verifying with nothing to
-- name, so those go rather than being left subject-less.
DELETE FROM "Credential"
  WHERE "studentId" IN (SELECT id FROM seed_users)
     OR "trackId" IN (SELECT id FROM seed_tracks);

-- 2. The seeded courses. Modules, topics, documents, quizzes, questions, assessments and
--    any attempts against them all cascade from here.
DELETE FROM "Track" WHERE id IN (SELECT id FROM seed_tracks);

-- 3. The seeded accounts. Profiles, refresh tokens, notifications, bookmarks, collections
--    and office-hour records cascade. Audit entries survive with a null actor, which is
--    correct: the record of what happened should outlive the account that did it.
--
--    Guarded so this can never remove the last administrator. If no real admin account
--    exists yet, the seeded one stays and nobody is locked out of the platform.
DELETE FROM "User"
  WHERE id IN (SELECT id FROM seed_users)
    AND EXISTS (
      SELECT 1 FROM "User" admin
      WHERE admin.role::text = 'ADMIN'
        AND admin.email NOT LIKE '%@dojo.edu'
    );

DROP TABLE seed_topics;
DROP TABLE seed_modules;
DROP TABLE seed_tracks;
DROP TABLE seed_users;
