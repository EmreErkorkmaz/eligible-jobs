import { defineConfig } from "drizzle-kit";

process.loadEnvFile(".dev.vars");

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/db/schema.ts',
    out: './src/db',
    dbCredentials: {
        url: process.env.DATABASE_URL!
    }

});