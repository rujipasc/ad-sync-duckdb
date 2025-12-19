import fs from 'node:fs';
import path from 'node:path';
import iconv from 'iconv-lite';

export const SCB_AD_HEADERS = [
    "PERSON_ID",
    "EMPLOYEE_NUMBER",
    "FIRST_NAME",
    "LAST_NAME",
    "TITLE",
    "EMAIL_ADDRESS",
    "JOB_TITLE",
    "COPORATE_TITLE",
    "ORGANIZATION_ID",
    "OFFICE_BUILDING",
    "OFFICE_FLOOR",
    "OFFICE_ZONE",
    "OFFICE_ROOM",
    "LOCATION_ADDRESS_NO",
    "LOCATION_ROAD",
    "LOCATION_SUB_DISTRICT",
    "LOCATION_DISTRICT",
    "LOCATION_STATE_PROVINCE",
    "LOCATION_COUNTRY",
    "LOCATION_POSTAL_CODE",
    "PHONE_NUMBER",
    "MOBILE_NUMBER",
    "FAX_NUMBER",
    "PAGER_NUMBER",
    "EFFECTIVE_START_DATE",
    "EFFECTIVE_END_DATE",
    "LAST_UPDATE_DATE",
    "STATUS",
    "MIDDLE_NAMES",
    "HIRE_DATE",
    "TITLE_TH",
    "FIRST_NAME_TH",
    "LAST_NAME_TH",
    "JOB_CODE",
    "SUPERVISOR_NO",
    "EVPUP_NO",
    "YOS",
    "CORP_SEQUENCE",
    "CORPORATE_TITLE_TH",
    "JOB_TITLE_TH",
    "ON_LEAVE",
    "ACTUAL_TERMINATION_DATE",
    "EMPLOYEE_STATUS",
    "SVPUP_NO"
];

export const exportTXT = (rows, outPath, delimiter = '|') => {
    if (!rows || rows.length === 0) {
        throw new Error('No data to export.');
    }
    const lines = [];

    for (const row of rows) {
        const values = Object.values(row).map(v => v ?? "");
        lines.push(values.join(delimiter));
    }

    const content = lines.join("\r\n");
    const encoded = iconv.encode(content, 'win874')

    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});

    fs.writeFileSync(outPath, encoded);
    console.log("✔ Exported:", outPath);
}

export const exportCSV = (rows, outPath, encoding = 'utf8') => {
    if (!rows || rows.length === 0) {
        throw new Error ("No Data to Export.");
    }

    const lines = [];
    
    lines.push(SCB_AD_HEADERS.join(","));

    for (const row of rows) {
        const values = SCB_AD_HEADERS.map((_, idx) => {
            let v = row[idx] ?? "";
            v = String(v).replace(/"/g, '""');
            if (v.includes(",") || v.includes('"') || v.includes("\n")) {
                v = `"${v}"`;
            }
            return v;
        });
        lines.push(values.join(","));
    }

    const content = lines.join("\r\n");

    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});

    fs.writeFileSync(outPath, content, encoding);
    console.log("✔ Exported CSV:", outPath)
};