import { relations } from "drizzle-orm/relations";
import { companies, jobs, eligibilityChecks } from "./schema";

export const jobsRelations = relations(jobs, ({one, many}) => ({
	company: one(companies, {
		fields: [jobs.companyId],
		references: [companies.id]
	}),
	eligibilityChecks: many(eligibilityChecks),
}));

export const companiesRelations = relations(companies, ({many}) => ({
	jobs: many(jobs),
}));

export const eligibilityChecksRelations = relations(eligibilityChecks, ({one}) => ({
	job: one(jobs, {
		fields: [eligibilityChecks.jobId],
		references: [jobs.id]
	}),
}));