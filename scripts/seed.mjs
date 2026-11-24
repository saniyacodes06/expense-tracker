import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// the demo password comes from .env.local, never from the code
const password = process.env.SEED_PASSWORD;
if (!password || password.length < 8) {
  console.error("Set SEED_PASSWORD (8+ characters) in .env.local");
  process.exit(1);
}

const users = [
  {
    name: "Admin",
    email: "admin@test.com",
    role: "ADMIN",
    expenses: [["Team lunch", 1200, "Food"]],
  },
  {
    name: "Asha",
    email: "asha@test.com",
    role: "USER",
    expenses: [
      ["Groceries", 850, "Shopping"],
      ["Auto to office", 120, "Travel"],
      ["Phone bill", 499, "Bills"],
    ],
  },
  {
    name: "Ravi",
    email: "ravi@test.com",
    role: "USER",
    expenses: [
      ["Lunch", 200, "Food"],
      ["Metro card", 500, "Travel"],
      ["Electricity bill", 1500, "Bills"],
    ],
  },
];

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();

  for (const user of users) {
    // a fresh hash per user, so the same password gives different hashes
    const passwordHash = await bcrypt.hash(password, 10);

    // create the user, or reset them if they already exist (safe to run again)
    const { rows } = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE
         SET name = EXCLUDED.name,
             password_hash = EXCLUDED.password_hash,
             role = EXCLUDED.role,
             is_active = TRUE
       RETURNING id`,
      [user.name, user.email, passwordHash, user.role]
    );
    const userId = rows[0].id;

    await client.query("DELETE FROM expenses WHERE user_id = $1", [userId]);
    for (const [title, amount, category] of user.expenses) {
      await client.query(
        "INSERT INTO expenses (user_id, title, amount, category) VALUES ($1, $2, $3, $4)",
        [userId, title, amount, category]
      );
    }

    console.log(`${user.role.padEnd(5)}  ${user.email}  (${user.expenses.length} expenses)`);
  }

  console.log("Seed done");
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
