import "dotenv/config";
import { runTask } from "../humatrix-export/exportHumatrix.js";
import { main } from "./index.js";
import { uploadToS3, listObjectS3 } from "./lib/s3-helper.js";
import path from "path";

async function run() {
    try {
        // await runTask();
        const paths = await main();

        if (paths && paths.stagingPath) {
            console.log("\n🚀 Starting Cloud Sync...");

            const s3Key = `lgc/scb/inbound/AD/${path.basename(paths.stagingPath)}`;

            await uploadToS3(paths.stagingPath, s3Key);
        }

        await listObjectS3();
        console.log("🏁 Pipeline Finished!")
    } catch (e) {
        console.error("Pipeline Error:", e)
    }
}
run();