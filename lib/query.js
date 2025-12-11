import fs from "fs/promises";
import { getConnection } from "./duckdb.js";

// Run SQL from string
export const runQuery = async (sql) => {
  const conn = await getConnection();
  const result = await conn.run(sql);
  return await result.getRows();
}

// Run SQL from .sql file
export const runQueryFromFile = async (sqlPath) => {
  const sql = await fs.readFile(sqlPath, "utf8");
  return await runQuery(sql);
}
