import { runTask } from "../humatrix-export/exportHumatrix.js";
import { main } from "./index.js";

async function run() {
    try {
        await runTask();
        await main();
        console.log("🏁 Pipeline Finished!")
    } catch (e) {
        console.error("Pipeline Error:", e)
    }
}
run();