import { bringLatestEmpProfile } from "./move-file.js";
import { runQueryFromFile } from "./query.js";
import { exportTXT, exportCSV } from "./exporter.js"
import { buildOutputPath, buildCsvOutputPath, buildS3Upload } from "./archive.js";

const sourceDir = process.env.SOURCE_DIR;

const color = {
    cyan: t => `\x1b[36m${t}\x1b[0m`,
    bold: t => `\x1b[1m${t}\x1b[0m`
};

export const generateAD = async () => {
    const empCsvPath = await bringLatestEmpProfile({
        sourceDir: "./automation/playwright/downloads/",
        targetDir: "./datasource/",
        targetName: "emp_profile.csv",
        prefix: "EmpProfiles_",
        extension: ".csv",
        mode: "cp"
    });

    console.log("Using input file:", empCsvPath);

    const emailMapping = await bringLatestEmpProfile({
        sourceDir,
        targetDir: "./datasource/",
        targetName: "email_mapping.csv",
        prefix: "Replace_email_list_SCB_AD",
        extension: ".csv",
        mode: "cp"
    });

    console.log("Using email mapping file:", emailMapping);

    const OrganizationTXT = await bringLatestEmpProfile({
        sourceDir,
        targetDir: "./output/S3/",
        targetName: "CARDX_ORGANIZATION.txt",
        prefix: "CARDX_ORGANIZATION",
        extension: ".txt",
        mode: "cp"
    });

    console.log("Copy Text File:", OrganizationTXT);

    const non_humatrix = await bringLatestEmpProfile({
        sourceDir,
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
    const csvPath = buildCsvOutputPath();
    exportCSV(rows, csvPath);
    const stagingS3 = buildS3Upload();
    exportTXT(rows, stagingS3);


    console.log(color.cyan(`\n📁 Output file created at:`));
    console.log(color.bold(outPath));
    console.log(color.bold(csvPath));
    console.log(color.bold(stagingS3));

    return {
        txtPath: outPath,
        csvPath: csvPath,
        stagingPath: stagingS3,
        orgPath: OrganizationTXT,
    }
};

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('generateAD.js')) {
    generateAD().catch((err) => console.error(err));
}
