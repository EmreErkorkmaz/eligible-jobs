import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { companies, jobs } from "./db/schema";
import { and, eq, sql } from "drizzle-orm";

type GreenhouseJob = {
  id: number;
  title: string;
  location: { name: string };
  absolute_url: string;
  first_published: string | null;
  updated_at: string;
};

export default {
  async fetch(request, env) {
    try {
      const client = neon(env.DATABASE_URL);
      const db = drizzle({ client });
      const rows = await db
        .select({ id: companies.id, board: companies.board })
        .from(companies)
        .where(
          and(eq(companies.ats, "greenhouse"), eq(companies.status, "active"))
        )
        .limit(1);
      if (rows.length === 0) {
        console.error("No active Greenhouse company");
        return Response.json({ error: "No active company" }, { status: 404 });
      }
      const [{ board, id: companyId }] = rows;
      const response = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${board}/jobs`,
        {
          headers: {
            "User-Agent": env.USER_AGENT,
          },
        }
      );
      if (!response.ok) {
        console.error("Greenhouse request failed", board, response.status);
        return Response.json(
          { error: `Jobs not found (${response.status})` },
          { status: 502 }
        );
      }
      const data = (await response.json()) as { jobs: GreenhouseJob[] };
      await db
        .insert(jobs)
        .values(
          data.jobs.map((job) => ({
            externalId: String(job.id),
            title: job.title,
            location: job.location.name,
            url: job.absolute_url,
            postedAt: job.first_published,
            companyId,
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
      return Response.json({ board, count: data.jobs.length });
    } catch (error) {
      console.error("Scan failed", error);
      return Response.json({ error: "Something went wrong" }, { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
