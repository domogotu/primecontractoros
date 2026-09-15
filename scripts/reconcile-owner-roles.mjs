import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;
const ownerEmail = (process.env.OWNER_EMAIL || "").trim().toLowerCase();
const businessWorkspaceEmail = "reedssolutionsllc@gmail.com";

if (!databaseUrl) {
  console.log("[owner-role-reconcile] DATABASE_URL not set; skipping.");
  process.exit(0);
}

if (!ownerEmail) {
  console.error("[owner-role-reconcile] OWNER_EMAIL is required in production.");
  process.exit(1);
}

const url = new URL(databaseUrl);
const sslRequested = ["true", "1", "require"].includes(
  (url.searchParams.get("ssl") || "").toLowerCase(),
);

const connection = await mysql.createConnection({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  ssl: sslRequested ? { minVersion: "TLSv1.2" } : undefined,
});

try {
  // Global `admin` is reserved for the PrimeContractorOS platform owner.
  // Reeds Solutions remains the owner/admin of its own workspace through
  // workspace ownership/membership records, not the global platform role.
  await connection.execute(
    "UPDATE users SET role = 'admin' WHERE LOWER(TRIM(email)) = ?",
    [ownerEmail],
  );

  if (businessWorkspaceEmail !== ownerEmail) {
    await connection.execute(
      "UPDATE users SET role = 'user' WHERE LOWER(TRIM(email)) = ?",
      [businessWorkspaceEmail],
    );
  }

  console.log(
    `[owner-role-reconcile] Canonical platform owner=${ownerEmail}; business workspace account=${businessWorkspaceEmail}.`,
  );
} finally {
  await connection.end();
}
