-- Migration: Add isSponsorship column to order table
-- Note: This column was manually added to production. This migration exists to sync Drizzle state.
-- If column already exists, these statements will be skipped by the DO block.

DO $$
BEGIN
    -- Add isSponsorship column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'order' AND column_name = 'isSponsorship'
    ) THEN
        ALTER TABLE "order" ADD COLUMN "isSponsorship" boolean DEFAULT false NOT NULL;
    END IF;

    -- Add index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'order' AND indexname = 'IX_order_isSponsorship'
    ) THEN
        CREATE INDEX "IX_order_isSponsorship" ON "order" USING btree ("isSponsorship");
    END IF;
END $$;
