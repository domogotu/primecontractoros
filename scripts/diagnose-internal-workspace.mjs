import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;
const internalEmails = [
  (process.env.OWNER_EMAIL || "dominiquereed35@gmail.com").trim().toLowerCase(),
  "reedssolutionsllc@gmail.com",
];

if (!databaseUrl) {
  console.log("[internal-workspace-diagnostic] DATABASE_URL not set; skipping.");
  process.exit(0);
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
  for (const email of internalEmails) {
    const [users] = await connection.execute(
      "SELECT id, email, openId, role FROM users WHERE LOWER(TRIM(email)) = ? ORDER BY id",
      [email],
    );

    if (!Array.isArray(users) || users.length === 0) {
      console.log(`[internal-workspace-diagnostic] email=${email} user=missing`);
      continue;
    }

    for (const user of users) {
      const [owned] = await connection.execute(
        "SELECT id, name, companyName, ownerId, status FROM workspaces WHERE ownerId = ? ORDER BY id",
        [user.id],
      );
      const [memberships] = await connection.execute(
        "SELECT wm.workspaceId, wm.role, w.name, w.companyName, w.ownerId, w.status FROM workspaceMembers wm JOIN workspaces w ON w.id = wm.workspaceId WHERE wm.userId = ? ORDER BY wm.workspaceId",
        [user.id],
      );

      console.log(
        `[internal-workspace-diagnostic] email=${email} userId=${user.id} role=${user.role} openId=${user.openId || "none"} owned=${JSON.stringify(owned)} memberships=${JSON.stringify(memberships)}`,
      );
    }
  }

  const [reedsCandidates] = await connection.execute(
    "SELECT id, name, companyName, ownerId, status FROM workspaces WHERE LOWER(COALESCE(companyName, '')) LIKE '%reed%solution%' OR LOWER(name) LIKE '%reed%solution%' ORDER BY id",
  );
  console.log(`[internal-workspace-diagnostic] reedsWorkspaceCandidates=${JSON.stringify(reedsCandidates)}`);
} finally {
  await connection.end();
}
