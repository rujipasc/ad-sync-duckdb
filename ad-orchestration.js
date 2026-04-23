import "dotenv/config";
import { humatrixExport } from "./automation/playwright/humatrix-pipeline.js";
import { generateAD } from "./lib/generateAD.js";

const color = {
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  bold: (t) => `\x1b[1m${t}\x1b[0m`,
};

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor(ms % 1000);

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const mmm = String(milliseconds).padStart(3, "0");

  return `${hh}:${mm}:${ss}.${mmm}`;
}

export const runHumatrixOrchestration = async () => {
  const totalStart = Date.now();

  console.log(color.cyan("🚀 Starting Humatrix orchestration pipeline..."));

  try {
    const humatrixStart = Date.now();
    await humatrixExport();
    const humatrixEnd = Date.now();

    console.log(color.green("✅ Humatrix export completed."));
    console.log(
      color.yellow(
        `⏱ Humatrix export duration: ${formatDuration(humatrixEnd - humatrixStart)}`
      )
    );

    const generateAdStart = Date.now();
    const result = await generateAD();
    const generateAdEnd = Date.now();

    console.log(color.green("✅ AD generation completed."));
    console.log(
      color.yellow(
        `⏱ AD generation duration: ${formatDuration(generateAdEnd - generateAdStart)}`
      )
    );

    const totalEnd = Date.now();

    console.log(color.cyan("\n📦 Final output summary:"));
    console.log(color.bold(`TXT: ${result.txtPath}`));
    console.log(color.bold(`CSV: ${result.csvPath}`));
    console.log(color.bold(`Staging TXT: ${result.stagingPath}`));
    console.log(color.bold(`Org TXT: ${result.orgPath}`));
    console.log(
      color.bold(`⏱ Total duration: ${formatDuration(totalEnd - totalStart)}`)
    );

    return result;
  } catch (err) {
    const totalEnd = Date.now();
    console.error("❌ Humatrix orchestration failed:", err);
    console.log(
      color.yellow(`⏱ Failed after: ${formatDuration(totalEnd - totalStart)}`)
    );
    throw err;
  }
};

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("ad-orchestration.js")
) {
  runHumatrixOrchestration().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}