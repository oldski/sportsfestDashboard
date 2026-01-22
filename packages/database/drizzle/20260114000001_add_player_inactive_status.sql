-- Add inactive status to playerstatus enum for soft delete functionality
ALTER TYPE playerstatus ADD VALUE IF NOT EXISTS 'inactive';
