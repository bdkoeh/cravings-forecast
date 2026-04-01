/**
 * Import restaurants from a completed Excel spreadsheet via the v1 API.
 *
 * Usage:
 *   npx tsx scripts/import-restaurants.ts data/restaurants.xlsx
 *   npx tsx scripts/import-restaurants.ts data/restaurants.xlsx --dry-run
 *
 * Expects columns: Restaurant Name, Link, Neighborhood, Cuisine, Description,
 *                   Highlighted Pick, Foggy, Sunny, Night
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

async function postJson(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data;
}

function cellValue(cell: ExcelJS.Cell): string {
  const val = cell.value;
  if (val === null || val === undefined) return '';
  if (typeof val === 'object' && 'text' in val) return String(val.text).trim();
  if (typeof val === 'object' && 'hyperlink' in val) return String((val as any).hyperlink).trim();
  return String(val).trim();
}

function isYes(val: string): boolean {
  return val.toLowerCase() === 'yes' || val.toLowerCase() === 'y' || val === '1';
}

async function main() {
  const args = process.argv.slice(2);
  const filePath = args.find(a => !a.startsWith('--'));
  const dryRun = args.includes('--dry-run');

  if (!filePath) {
    console.error('Usage: npx tsx scripts/import-restaurants.ts <file.xlsx> [--dry-run]');
    process.exit(1);
  }

  if (!API_TOKEN) {
    console.error('Set API_TOKEN environment variable');
    process.exit(1);
  }

  // Load lookup tables
  const cuisines = await fetchJson('/cuisines') as { id: number; name: string }[];
  const neighborhoods = await fetchJson('/neighborhoods') as { id: number; name: string }[];

  const cuisineMap = new Map(cuisines.map(c => [c.name.toLowerCase(), c.id]));
  const neighborhoodMap = new Map(neighborhoods.map(n => [n.name.toLowerCase(), n.id]));

  // Read spreadsheet
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.getWorksheet('Restaurants') || workbook.worksheets[0];

  if (!sheet) {
    console.error('No worksheet found');
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  console.log(dryRun ? '=== DRY RUN ===' : '=== IMPORTING ===');
  console.log('');

  sheet.eachRow((row, rowNum) => {
    // Skip header
    if (rowNum === 1) return;

    const name = cellValue(row.getCell(1));
    if (!name) return; // Skip blank rows

    const link = cellValue(row.getCell(2));
    const neighborhood = cellValue(row.getCell(3));
    const cuisine = cellValue(row.getCell(4));
    const description = cellValue(row.getCell(5));
    const highlighted = cellValue(row.getCell(6));
    const foggy = cellValue(row.getCell(7));
    const sunny = cellValue(row.getCell(8));
    const night = cellValue(row.getCell(9));

    // Build conditions
    const conditions: string[] = [];
    if (isYes(foggy)) conditions.push('foggy');
    if (isYes(sunny)) conditions.push('sunny');
    if (isYes(night)) conditions.push('night');

    // Match neighborhood
    let neighborhoodId: number | null = null;
    if (neighborhood) {
      neighborhoodId = neighborhoodMap.get(neighborhood.toLowerCase()) ?? null;
      if (!neighborhoodId) {
        console.error(`  Row ${rowNum}: Unknown neighborhood "${neighborhood}" — skipping`);
      }
    }

    // Match cuisine
    let cuisineId: number | null = null;
    if (cuisine) {
      cuisineId = cuisineMap.get(cuisine.toLowerCase()) ?? null;
      if (!cuisineId) {
        console.error(`  Row ${rowNum}: Unknown cuisine "${cuisine}" — will set to null`);
      }
    }

    const record = {
      row: rowNum,
      name,
      link: link || null,
      neighborhood_id: neighborhoodId,
      cuisine_id: cuisineId,
      description: description || null,
      highlighted: isYes(highlighted) ? 1 : 0,
      conditions,
    };

    // Validation
    if (!record.neighborhood_id) {
      console.error(`  Row ${rowNum} "${name}": No valid neighborhood — skipping`);
      skipped++;
      return;
    }
    if (conditions.length === 0) {
      console.error(`  Row ${rowNum} "${name}": No conditions marked — skipping`);
      skipped++;
      return;
    }

    if (dryRun) {
      console.log(`  [${rowNum}] ${name} | ${neighborhood} | ${cuisine || '—'} | ${conditions.join(',')} | ${isYes(highlighted) ? '★' : ''}`);
      created++;
    } else {
      // Queue for async processing
      (record as any)._pending = true;
    }
  });

  // Process non-dry-run inserts
  if (!dryRun) {
    const pending: any[] = [];
    sheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      const name = cellValue(row.getCell(1));
      if (!name) return;

      const link = cellValue(row.getCell(2));
      const neighborhood = cellValue(row.getCell(3));
      const cuisine = cellValue(row.getCell(4));
      const description = cellValue(row.getCell(5));
      const highlighted = cellValue(row.getCell(6));
      const foggy = cellValue(row.getCell(7));
      const sunny = cellValue(row.getCell(8));
      const night = cellValue(row.getCell(9));

      const conditions: string[] = [];
      if (isYes(foggy)) conditions.push('foggy');
      if (isYes(sunny)) conditions.push('sunny');
      if (isYes(night)) conditions.push('night');

      const neighborhoodId = neighborhood ? neighborhoodMap.get(neighborhood.toLowerCase()) ?? null : null;
      const cuisineId = cuisine ? cuisineMap.get(cuisine.toLowerCase()) ?? null : null;

      if (!neighborhoodId || conditions.length === 0) return; // Already counted as skipped above

      pending.push({ rowNum, name, link, neighborhoodId, cuisineId, description, highlighted, conditions });
    });

    for (const r of pending) {
      try {
        await postJson('/restaurants', {
          name: r.name,
          link: r.link || null,
          neighborhood_id: r.neighborhoodId,
          cuisine_id: r.cuisineId,
          description: r.description || null,
          highlighted: isYes(r.highlighted) ? 1 : 0,
          conditions: r.conditions,
        });
        console.log(`  ✓ Row ${r.rowNum}: ${r.name}`);
        created++;
      } catch (e: any) {
        console.error(`  ✗ Row ${r.rowNum}: ${r.name} — ${e.message}`);
        errors++;
      }
    }
  }

  console.log('');
  console.log(`Done. Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch(e => { console.error(e); process.exit(1); });
