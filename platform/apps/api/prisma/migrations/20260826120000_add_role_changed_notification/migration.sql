-- Admins can now promote a user to another role, and the person is told about it.
-- Postgres 12+ permits ADD VALUE inside a transaction as long as the new value is not
-- used in that same transaction, which is the case here.
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ROLE_CHANGED';
