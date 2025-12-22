import { bringLatestEmpProfile } from "./lib/move-file.js";
import { runQueryFromFile } from "./lib/query.js";
import { exportTXT, exportCSV } from "./lib/exporter.js"
import { buildOutputPath, buildCsvOutputPath } from "./lib/archive.js";

const color = {
    cyan: t => `\x1b[36m${t}\x1b[0m`,
    bold: t => `\x1b[1m${t}\x1b[0m`
};

export const main = async () => {
    const empCsvPath = bringLatestEmpProfile({
        sourceDir: "./downloads/",
        targetDir: "./datasource/",
        targetName: "emp_profile.csv",
        prefix: "EmpProfiles_",
        extension: ".csv",
        mode: "cp"
    });

    console.log("Using input file:", empCsvPath);

    const emailMapping = bringLatestEmpProfile({
        sourceDir: "../../../Card X Company Limited/HRIS&SS - Interface SCB AD/",
        targetDir: "./datasource/",
        targetName: "email_mapping.csv",
        prefix: "Replace_email_list_SCB_AD",
        extension: ".csv",
        mode: "cp"
    });

    console.log("Using email mapping file:", emailMapping);

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
    const rows = await runQueryFromFile("./duck/emp_ad.sql");
    const outPath = buildOutputPath();
    exportTXT(rows, outPath);
    const csvPath = await buildCsvOutputPath();
    exportCSV(rows, csvPath);

    console.log(color.cyan(`\n📁 Output file created at:`));
    console.log(color.bold(outPath));
    console.log(color.bold(csvPath));
};

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('index.js')) {
    main().catch((err) => console.error(err));
}
