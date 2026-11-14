ALTER TABLE "companies" ADD COLUMN "etag" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "last_scanned_at" timestamp with time zone;