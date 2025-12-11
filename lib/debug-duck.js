// lib/duckdb.js
import { DuckDBInstance } from "@duckdb/node-api";

async function main() {
  try {
    const instance = await DuckDBInstance.create(":memory:");
    const connection = await instance.connect();
    
    const result = await connection.run("SELECT 10 * 2 AS result");
    const rows = await result.getRows();
    console.log("Query result:", rows);
    
    // ดู methods ที่มี
    console.log("\nConnection methods:", 
      Object.getOwnPropertyNames(Object.getPrototypeOf(connection))
        .filter(m => !m.startsWith('_'))
    );
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main();