import "dotenv/config";
import { runTask } from "../humatrix-export/exportHumatrix.js";
import { main } from "./index.js";
import { uploadToS3, listObjectS3 } from "./lib/s3-helper.js";
import path from "path";

async function run() {
    try {
        await runTask();
        const result = await main();
        const uploadQueue = [
            result.stagingPath,
            result.orgPath,
        ].filter(Boolean);
        console.log(`\n☁️ [Step 3] Syncing ${uploadQueue.length} files to AWS S3...`);
        for (const localFile of uploadQueue) {
            const fileName = path.basename(localFile);
            const s3Key = `lgc/scb/inbound/AD/${fileName}`; // กำหนด path บน S3
            
            await uploadToS3(localFile, s3Key);
        }
        console.log("\n✅ --- ALL PIPELINE TASKS COMPLETED ---");
        await listObjectS3();
        console.log("🏁 Pipeline Finished!")
        process.exit(0);
    } catch (e) {
        console.error("Pipeline Error:", e);
        process.exit(1);
    }
}
run();