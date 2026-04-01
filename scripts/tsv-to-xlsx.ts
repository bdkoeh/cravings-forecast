/**
 * Convert TSV restaurant data to Excel format for import.
 * Usage: npx tsx scripts/tsv-to-xlsx.ts /tmp/sf-restaurants-100.tsv data/sf-restaurants-100.xlsx
 */
import ExcelJS from 'exceljs';
import { readFileSync } from 'node:fs';

const [tsvPath, outPath] = process.argv.slice(2);
if (!tsvPath || !outPath) {
  console.error('Usage: npx tsx scripts/tsv-to-xlsx.ts <input.tsv> <output.xlsx>');
  process.exit(1);
}

const lines = readFileSync(tsvPath, 'utf-8').split('\n').filter(l => l.trim());
const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Restaurants');

for (const [i, line] of lines.entries()) {
  const cols = line.split('\t');
  if (i === 0) {
    sheet.addRow(cols);
  } else {
    sheet.addRow(cols);
  }
}

workbook.xlsx.writeFile(outPath).then(() => {
  console.log(`Written ${lines.length - 1} rows to ${outPath}`);
});
