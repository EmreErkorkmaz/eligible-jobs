import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { companies, jobs } from "../db/schema";
import { eq, sql } from "drizzle-orm";

type Company = { id: number; board: string; etag: string | null };
export type ScanResult = { status: "updated" | "unchanged" | "failed"; count: number };
type GreenhouseJob = {
  id: number;
  title: string;
  location: { name: string };
  absolute_url: string;
  first_published: string | null;
  updated_at: string;
};

const scanCompany = async (
  db: NeonHttpDatabase,
  env: Env,
  company: Company
): Promise<ScanResult> => {
  const headers: Record<string, string> = { "User-Agent": env.USER_AGENT };
  if (company.etag) headers["If-None-Match"] = company.etag;

  const response = await fetch(
    `https://boards-api.greenhouse.io/v1/boards/${company.board}/jobs`,
    {
      headers,
    }
  );

  if (response.status === 304) {
    await db
      .update(companies)
      .set({ lastScannedAt: sql`now()` })
      .where(eq(companies.id, company.id));
    return { status: "unchanged", count: 0 };
  }

  if (!response.ok) {
    console.error("Greenhouse request failed", company.board, response.status);
    return { status: "failed", count: 0 };
  }
  const data = (await response.json()) as { jobs: GreenhouseJob[] };
  if (data.jobs.length > 0) {
    await db
      .insert(jobs)
      .values(
        data.jobs.map((job) => ({
          externalId: String(job.id),
          title: job.title,
          location: job.location.name,
          url: job.absolute_url,
          postedAt: job.first_published,
          companyId: company.id,
        }))
      )
      .onConflictDoUpdate({
        target: [jobs.companyId, jobs.externalId],
        set: {
          title: sql`excluded.title`,
          location: sql`excluded.location`,
          url: sql`excluded.url`,
          postedAt: sql`excluded.posted_at`,
          lastSeenAt: sql`now()`,
          updatedAt: sql`now()`,
        },
      });
  }

  await db
    .update(companies)
    .set({ etag: response.headers.get("etag"), lastScannedAt: sql`now()` })
    .where(eq(companies.id, company.id));
  return { status: "updated", count: data.jobs.length };
};

export default scanCompany;
