import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

const url = new URL(connectionString);
const sslRequested = ["true", "1", "require"].includes(
  (url.searchParams.get("ssl") || "").toLowerCase(),
);

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: sslRequested
    ? {
        host: url.hostname,
        port: Number(url.port || 3306),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, ""),
        ssl: {
          minVersion: "TLSv1.2",
        },
      }
    : {
        url: connectionString,
      },
});
