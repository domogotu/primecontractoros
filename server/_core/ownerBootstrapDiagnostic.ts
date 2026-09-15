import mysql from "mysql2/promise";

export async function logOwnerBootstrapDiagnostic() {
  if (process.env.NODE_ENV !== "production" || !process.env.DATABASE_URL) return;

  const url = new URL(process.env.DATABASE_URL);
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
    const [rows] = await connection.execute(
      "SELECT id, name, email, openId, role, loginMethod, lastSignedIn FROM users ORDER BY id LIMIT 20",
    );
    console.log(`[owner-bootstrap-diagnostic] users=${JSON.stringify(rows)}`);
  } finally {
    await connection.end();
  }
}
