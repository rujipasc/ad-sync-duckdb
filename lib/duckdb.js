// lib/duckdb.js
import { DuckDBInstance } from "@duckdb/node-api";

let instance = null;
let connection = null;

// สร้าง connection แบบ singleton
export const getConnection = async () => {
  if (!instance) {
    instance = await DuckDBInstance.create(":memory:"); 
    // หรือใช้ไฟล์จริง เช่น "./storage/mydb.duckdb"
  }

  if (!connection) {
    connection = await instance.connect();
  }

  return connection;
}

// test run (รันเฉพาะไฟล์นี้)
if (import.meta.url === `file://${process.argv[1]}`) {
  const conn = await getConnection();
  const result = await conn.run("SELECT 99 AS test_value");
  console.log(await result.getRows());
}


