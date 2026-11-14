import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import scanAll from "./handlers/scanAll";

export default {
  async fetch(request, env) {
    try {
      const client = neon(env.DATABASE_URL);
      const db = drizzle({ client });

      const results = await scanAll(db, env);
      return Response.json({ results }, { status: 200 });
    } catch (error) {
      console.error("Scan failed", error);
      return Response.json({ error: "Something went wrong" }, { status: 500 });
    }
  },
  async scheduled(controller, env, ctx) {
    const client = neon(env.DATABASE_URL);
    const db = drizzle({ client });

    const results = await scanAll(db, env);
    console.log(results);
  },
} satisfies ExportedHandler<Env>;
