import { neon } from "@neondatabase/serverless";

export default {
  async fetch(request, env) {
    try {
      const sql = neon(env.DATABASE_URL);
      const rows = await sql`SELECT now()`;
      return Response.json(rows);
    } catch (error) {
      console.error("DB check failed", error);
      return Response.json({ error: "Something went wrong" }, { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
