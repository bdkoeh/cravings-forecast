/**
 * Populate the restaurant template with data from a TSV file.
 * Preserves all dropdown validations from the template.
 *
 * Usage: npx tsx scripts/populate-template.ts <input.tsv> <template.xlsx> <output.xlsx>
 */
import ExcelJS from 'exceljs';
import { readFileSync } from 'node:fs';

const [tsvPath, templatePath, outPath] = process.argv.slice(2);
if (!tsvPath || !templatePath || !outPath) {
  console.error('Usage: npx tsx scripts/populate-template.ts <input.tsv> <template.xlsx> <output.xlsx>');
  process.exit(1);
}

async function main() {
  // Read TSV data
  const lines = readFileSync(tsvPath, 'utf-8').split('\n').filter(l => l.trim());
  const dataRows = lines.slice(1); // skip header

  // Open template (preserves validations, formatting, frozen panes)
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);
  const sheet = workbook.getWorksheet('Restaurants')!;

  for (let i = 0; i < dataRows.length; i++) {
    const cols = dataRows[i].split('\t');
    const row = i + 2; // row 1 is header

    // Columns: Restaurant Name, Link, Neighborhood, Cuisine, Description, Highlighted Pick, Foggy, Sunny, Night
    sheet.getCell(`A${row}`).value = cols[0] || '';
    sheet.getCell(`B${row}`).value = cols[1] || '';
    sheet.getCell(`C${row}`).value = cols[2] || '';
    sheet.getCell(`D${row}`).value = cols[3] || '';
    sheet.getCell(`E${row}`).value = cols[4] || '';
    sheet.getCell(`F${row}`).value = cols[5] || 'No';
    sheet.getCell(`G${row}`).value = cols[6] || 'No';
    sheet.getCell(`H${row}`).value = cols[7] || 'No';
    sheet.getCell(`I${row}`).value = cols[8] || 'No';
  }

  await workbook.xlsx.writeFile(outPath);
  console.log(`Populated ${dataRows.length} rows into ${outPath} (validations preserved)`);
}

main().catch(e => { console.error(e); process.exit(1); });
