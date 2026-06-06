const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function check() {
  try {
    const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log("Tables in public schema:");
    result.forEach(row => console.log("- " + row.table_name));
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

check();
