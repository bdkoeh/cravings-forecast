/**
 * Generate the restaurant import Excel template with dropdown validations.
 * Pulls current cuisines and neighborhoods from the API.
 *
 * Usage: npx tsx scripts/generate-template.ts
 * Output: data/restaurant-template.xlsx
 */

import ExcelJS from 'exceljs';

const API_BASE = process.env.API_BASE || 'http://localhost:3001/api/v1';
const API_TOKEN = process.env.API_TOKEN || '';

async function fetchJson(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function main() {
  if (!API_TOKEN) {
    console.error('Set API_TOKEN environment variable (or add to .env and source it)');
    process.exit(1);
  }

  // Fetch current lookup data
  const cuisines = (await fetchJson('/cuisines') as { name: string }[]).map(c => c.name).sort();
  const neighborhoods = (await fetchJson('/neighborhoods') as { name: string }[]).map(n => n.name).sort();

  console.log(`Cuisines: ${cuisines.length}, Neighborhoods: ${neighborhoods.length}`);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SF Cravings Forecast';

  // --- Main data sheet ---
  const sheet = workbook.addWorksheet('Restaurants', {
    views: [{ state: 'frozen', ySplit: 1 }], // Freeze header row
  });

  // Column definitions
  sheet.columns = [
    { header: 'Restaurant Name', key: 'name', width: 30 },
    { header: 'Link', key: 'link', width: 35 },
    { header: 'Neighborhood', key: 'neighborhood', width: 20 },
    { header: 'Cuisine', key: 'cuisine', width: 18 },
    { header: 'Description', key: 'description', width: 45 },
    { header: 'Highlighted Pick', key: 'highlighted', width: 16 },
    { header: 'Foggy', key: 'foggy', width: 10 },
    { header: 'Sunny', key: 'sunny', width: 10 },
    { header: 'Night', key: 'night', width: 10 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  headerRow.alignment = { horizontal: 'center' };

  // Apply data validations to rows 2-500
  const dataRows = 500;

  // Neighborhood dropdown (column C)
  for (let row = 2; row <= dataRows; row++) {
    sheet.getCell(`C${row}`).dataValidation = {
      type: 'list',
      formulae: [`"${neighborhoods.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Invalid Neighborhood',
      error: 'Please select a neighborhood from the dropdown.',
    };
  }

  // Cuisine dropdown (column D)
  for (let row = 2; row <= dataRows; row++) {
    sheet.getCell(`D${row}`).dataValidation = {
      type: 'list',
      formulae: [`"${cuisines.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Invalid Cuisine',
      error: 'Please select a cuisine from the dropdown.',
    };
  }

  // Yes/No dropdowns for Highlighted, Foggy, Sunny, Night (columns F-I)
  const yesNoCols = ['F', 'G', 'H', 'I'];
  for (const col of yesNoCols) {
    for (let row = 2; row <= dataRows; row++) {
      sheet.getCell(`${col}${row}`).dataValidation = {
        type: 'list',
        formulae: ['"Yes,No"'],
        showErrorMessage: true,
        errorTitle: 'Invalid Value',
        error: 'Please select Yes or No.',
      };
    }
  }

  const outPath = 'data/restaurant-template.xlsx';
  await workbook.xlsx.writeFile(outPath);
  console.log(`Template created: ${outPath}`);
  console.log(`Neighborhoods: ${neighborhoods.join(', ')}`);
  console.log(`Cuisines: ${cuisines.join(', ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
