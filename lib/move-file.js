import fs from 'node:fs';
import path from 'node:path';
import { convertExcelToCSV } from './convert-excel.js';


const findLatestFile = (dir, prefix, extension) => {
    const files = fs.readdirSync(dir).filter(f =>
        f.startsWith(prefix) && f.endsWith(extension)
    );
    if (files.length === 0) throw new Error(`No matching files found in ${dir}`);

    const latest = files
        .map(f => ({
            name: f,
            time: fs.statSync(path.join(dir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time)[0];

    return latest.name;
};

export const bringLatestEmpProfile = async ({ sourceDir, targetDir, targetName, prefix, extension, mode, sheetName }) => {
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const latestFile = findLatestFile(sourceDir, prefix, extension);
    const sourcePath = path.join(sourceDir, latestFile);
    const targetPath = path.join(targetDir, targetName);

    if (mode === 'cp') { // copy mode
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✔ Copied latest file ${latestFile} → ${targetPath}`);
    } else if (mode === 'mov') { // move mode
        fs.renameSync(sourcePath, targetPath);
        console.log(`✔ Moved latest file ${latestFile} → ${targetPath}`);
    } else {
        throw new Error(`Invalid mode: ${mode}. Use 'copy' or 'move'.`);
    }
    if (extension.toLowerCase() === ".xlsx") {
        const csvPath = targetPath.replace(".xlsx", ".csv");

        console.log(`🔄 Converting XLSX → CSV ...`);
        await convertExcelToCSV(targetPath, csvPath, sheetName); // IMPORTANT: await

        console.log(`✔ Converted to CSV → ${csvPath}`);
        return csvPath;
    }
    return targetPath;
};