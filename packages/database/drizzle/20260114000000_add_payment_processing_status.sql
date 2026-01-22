-- Add payment_processing status to orderstatus enum for ACH/bank transfer payments
-- This status indicates a bank payment has been initiated but not yet cleared (3-5 business days)
ALTER TYPE orderstatus ADD VALUE IF NOT EXISTS 'payment_processing' AFTER 'pending';
