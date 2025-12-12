import { bringLatestEmpProfile } from "./lib/move-file.js";
import { runQueryFromFile } from "./lib/query.js";
import { exportTXT } from "./lib/exporter.js"
import { buildOutputPath } from "./lib/archive.js";

// const empCsvPath = bringLatestEmpProfile({
//     sourceDir: "../humatrix-export/downloads/",
//     targetDir: "./datasource/",
//     targetName: "emp_profile.csv",
//     prefix: "EmpProfiles_",
//     extension: ".csv",
//     mode: "cp"
// });

// console.log("Using input file:", empCsvPath);

// const emailMapping = bringLatestEmpProfile({
//     sourceDir: "../../../Card X Company Limited/HRIS&SS - Interface SCB AD/",
//     targetDir: "./datasource/",
//     targetName: "email_mapping.csv",
//     prefix: "Replace_email_list_SCB_AD",
//     extension: ".csv",
//     mode: "cp"
// });

// console.log("Using email mapping file:", emailMapping);

const non_humatrix = await bringLatestEmpProfile({
    sourceDir: "../../../Card X Company Limited/HRIS&SS - Interface SCB AD/",
    targetDir: "./datasource/",
    targetName: "non_humatrix_profile.csv",
    prefix: "Gen_EmpID&Email",
    extension: ".xlsx",
    mode: "cp",
    sheetName: "Auto_Gen"
});

console.log("Convert Excel to CSV:", non_humatrix);

// const color = {
//   cyan: t => `\x1b[36m${t}\x1b[0m`,
//   bold: t => `\x1b[1m${t}\x1b[0m`
// };
// const main = async () => {
//     const rows = await runQueryFromFile("./duck/emp_ad.sql");
//     const outPath = buildOutputPath();
//     exportTXT(rows, outPath);

//     console.log(color.cyan(`\n📁 Output file created at:`));
//     console.log(color.bold(outPath));
// };

// main().catch((err) => console.error(err));
