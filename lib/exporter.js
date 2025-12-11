import fs from 'node:fs';
import path from 'node:path';
import iconv from 'iconv-lite';

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