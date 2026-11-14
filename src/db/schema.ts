import { pgTable, unique, check, bigint, text, timestamp, foreignKey, index, boolean, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const companies = pgTable("companies", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "companies_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	name: text().notNull(),
	ats: text().notNull(),
	board: text().notNull(),
	status: text().default('active').notNull(),
	statusNote: text("status_note"),
	country: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	etag: text(),
	lastScannedAt: timestamp("last_scanned_at", { withTimezone: true, mode: "string" })
}, (table) => [
	unique("companies_ats_board_key").on(table.board, table.ats),
	check("companies_ats_check", sql`ats = ANY (ARRAY['greenhouse'::text, 'lever'::text, 'ashby'::text])`),
	check("companies_status_check", sql`status = ANY (ARRAY['active'::text, 'paused'::text, 'blocked'::text])`),
	check("companies_country_check", sql`country ~ '^[A-Z]{2}$'::text`),
]);

export const jobs = pgTable("jobs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "jobs_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	companyId: bigint("company_id", { mode: "number" }).notNull(),
	externalId: text("external_id").notNull(),
	title: text().notNull(),
	location: text(),
	url: text().notNull(),
	description: text(),
	note: text(),
	postedAt: timestamp("posted_at", { withTimezone: true, mode: 'string' }),
	lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "jobs_company_id_fkey"
		}).onDelete("cascade"),
	unique("jobs_company_id_external_id_key").on(table.externalId, table.companyId),
]);

export const eligibilityChecks = pgTable("eligibility_checks", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "eligibility_checks_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jobId: bigint("job_id", { mode: "number" }).notNull(),
	source: text().notNull(),
	eligible: boolean().notNull(),
	region: text(),
	evidence: text(),
	model: text(),
	promptVersion: text("prompt_version"),
	inputTokens: integer("input_tokens"),
	outputTokens: integer("output_tokens"),
	costMicroUsd: integer("cost_micro_usd"),
	latencyMs: integer("latency_ms"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("eligibility_checks_job_id_idx").using("btree", table.jobId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "eligibility_checks_job_id_fkey"
		}).onDelete("cascade"),
	check("eligibility_checks_source_check", sql`source = ANY (ARRAY['llm'::text, 'human'::text])`),
	check("eligibility_checks_check", sql`(source = 'human'::text) OR ((model IS NOT NULL) AND (prompt_version IS NOT NULL))`),
]);
