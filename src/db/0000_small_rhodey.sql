-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "companies" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "companies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"ats" text NOT NULL,
	"board" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"status_note" text,
	"country" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_ats_board_key" UNIQUE("board","ats"),
	CONSTRAINT "companies_ats_check" CHECK (ats = ANY (ARRAY['greenhouse'::text, 'lever'::text, 'ashby'::text])),
	CONSTRAINT "companies_status_check" CHECK (status = ANY (ARRAY['active'::text, 'paused'::text, 'blocked'::text])),
	CONSTRAINT "companies_country_check" CHECK (country ~ '^[A-Z]{2}$'::text)
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jobs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"company_id" bigint NOT NULL,
	"external_id" text NOT NULL,
	"title" text NOT NULL,
	"location" text,
	"url" text NOT NULL,
	"description" text,
	"note" text,
	"posted_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_company_id_external_id_key" UNIQUE("external_id","company_id")
);
--> statement-breakpoint
CREATE TABLE "eligibility_checks" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "eligibility_checks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"job_id" bigint NOT NULL,
	"source" text NOT NULL,
	"eligible" boolean NOT NULL,
	"region" text,
	"evidence" text,
	"model" text,
	"prompt_version" text,
	"input_tokens" integer,
	"output_tokens" integer,
	"cost_micro_usd" integer,
	"latency_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "eligibility_checks_source_check" CHECK (source = ANY (ARRAY['llm'::text, 'human'::text])),
	CONSTRAINT "eligibility_checks_check" CHECK ((source = 'human'::text) OR ((model IS NOT NULL) AND (prompt_version IS NOT NULL)))
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eligibility_checks" ADD CONSTRAINT "eligibility_checks_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "eligibility_checks_job_id_idx" ON "eligibility_checks" USING btree ("job_id" int8_ops);
*/