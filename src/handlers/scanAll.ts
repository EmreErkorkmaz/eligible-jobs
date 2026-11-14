import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import scanCompany, { ScanResult } from "./scanCompany";
import { companies } from "../db/schema";
import { and, eq } from "drizzle-orm";

type CompanyScanResult = { board: string } & ScanResult;

const scanAll = async (
  db: NeonHttpDatabase,
  env: Env
): Promise<CompanyScanResult[]> => {
  const rows = await db
    .select({
      id: companies.id,
      board: companies.board,
      etag: companies.etag,
    })
    .from(companies)
    .where(
      and(eq(companies.ats, "greenhouse"), eq(companies.status, "active"))
    );
  if (rows.length === 0) {
    console.error("No active company");
    return [];
  }

  const results: CompanyScanResult[] = [];

  for (const company of rows) {
    try {
      const result = await scanCompany(db, env, company);
      results.push({ board: company.board, ...result });
    } catch (error) {
      console.error("Scan failed", company.board, error);
      results.push({ board: company.board, status: "failed", count: 0 });
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  return results;
};

export default scanAll;
