-- Migration: Add organization join request table
-- This table stores pending requests from users who want to join existing organizations

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'joinrequeststatus') THEN
        CREATE TYPE joinrequeststatus AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS "organizationJoinRequest" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "userId" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "status" joinrequeststatus DEFAULT 'pending' NOT NULL,
    "message" text,
    "respondedBy" uuid REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "respondedAt" timestamp(3),
    "rejectionReason" text,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS "IX_organizationJoinRequest_organizationId" ON "organizationJoinRequest" USING btree ("organizationId");
CREATE INDEX IF NOT EXISTS "IX_organizationJoinRequest_userId" ON "organizationJoinRequest" USING btree ("userId");
CREATE INDEX IF NOT EXISTS "IX_organizationJoinRequest_status" ON "organizationJoinRequest" USING btree ("status");

-- Unique constraint: one pending request per user per organization
CREATE UNIQUE INDEX IF NOT EXISTS "IX_organizationJoinRequest_org_user_pending"
ON "organizationJoinRequest" ("organizationId", "userId")
WHERE status = 'pending';

-- Enable Row Level Security
ALTER TABLE "organizationJoinRequest" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own join requests
CREATE POLICY "Users can view own join requests"
ON "organizationJoinRequest"
FOR SELECT
TO authenticated
USING (auth.uid() = "userId");

-- Policy: Organization admins can view join requests for their organization
CREATE POLICY "Org admins can view org join requests"
ON "organizationJoinRequest"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "membership"
        WHERE "membership"."organizationId" = "organizationJoinRequest"."organizationId"
        AND "membership"."userId" = auth.uid()
        AND "membership"."role" = 'admin'
    )
);

-- Policy: Users can create join requests for themselves
CREATE POLICY "Users can create own join requests"
ON "organizationJoinRequest"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = "userId");

-- Policy: Organization admins can update (approve/reject) join requests
CREATE POLICY "Org admins can update join requests"
ON "organizationJoinRequest"
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "membership"
        WHERE "membership"."organizationId" = "organizationJoinRequest"."organizationId"
        AND "membership"."userId" = auth.uid()
        AND "membership"."role" = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "membership"
        WHERE "membership"."organizationId" = "organizationJoinRequest"."organizationId"
        AND "membership"."userId" = auth.uid()
        AND "membership"."role" = 'admin'
    )
);

-- Policy: Users can delete their own pending join requests
CREATE POLICY "Users can delete own pending requests"
ON "organizationJoinRequest"
FOR DELETE
TO authenticated
USING (
    auth.uid() = "userId"
    AND status = 'pending'
);

-- Policy: Service role bypasses RLS (for server-side operations)
CREATE POLICY "Service role has full access"
ON "organizationJoinRequest"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
