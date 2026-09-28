import * as XLSX from 'xlsx';
import { InventoryRow } from '../types/inventory';
import { getAgeUnit } from './ageClassifier';

/**
 * Creates a formatted worksheet from rows.
 * Column structure:
 * A: S.No
 * B: Prefix
 * C: Item Code
 * D: Part Code -- Year (e.g. TSUT-126--11-12)
 * E: Unit ('months' if 0-3, 3-6, 6-9, 9-12, 6-12, 12-18, 18-24; 'years' if 1-2, 2-3, 3-4, etc.)
 * F: Qty
 * G: Bin No
 * Text format (@) is enforced so Excel never auto-converts to dates.
 */
function createFormattedSheet(rows: InventoryRow[], label: string) {
  const headers = [
    'S.No',
    'Prefix',
    'Item Code',
    'Part Code -- Year',
    'Unit',
    'Qty',
    'Bin No',
  ];

  const dataRows = rows.map((row, index) => {
    const fullCode = row.fullCode || `${row.prefix}-${row.itemCode}`;
    const partCodeWithYear = `${fullCode}--${row.year}`;
    const unit = row.ageType || getAgeUnit(row.year);

    return [
      index + 1,
      row.prefix,
      row.itemCode,
      partCodeWithYear, // Joined D and E with '--'
      unit,             // Column added right before Qty: 'months' or 'year'
      Number(row.quantity) || 1,
      row.binNumber,
    ];
  });

  const totalQty = rows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const summaryRow = ['TOTAL', '', '', `${rows.length} Items`, '', totalQty, label];

  const worksheetData = [headers, ...dataRows, summaryRow];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  worksheet['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 10 }, // Prefix
    { wch: 12 }, // Item Code
    { wch: 24 }, // Part Code -- Year
    { wch: 12 }, // Unit (months / year)
    { wch: 8 },  // Qty
    { wch: 12 }, // Bin No
  ];

  // Force string format on text columns
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:G1');
  for (let R = 1; R <= range.e.r; ++R) {
    // Column 3 is Part Code -- Year (0-indexed: 3)
    const codeYearCell = worksheet[XLSX.utils.encode_cell({ r: R, c: 3 })];
    if (codeYearCell && codeYearCell.v !== undefined && R <= rows.length) {
      codeYearCell.t = 's';
      codeYearCell.z = '@';
    }

    // Column 4 is Unit (0-indexed: 4)
    const unitCell = worksheet[XLSX.utils.encode_cell({ r: R, c: 4 })];
    if (unitCell && unitCell.v !== undefined && R <= rows.length) {
      unitCell.t = 's';
      unitCell.z = '@';
    }

    // Column 1 is Prefix (0-indexed: 1)
    const prefixCell = worksheet[XLSX.utils.encode_cell({ r: R, c: 1 })];
    if (prefixCell && prefixCell.v !== undefined && R <= rows.length) {
      prefixCell.t = 's';
      prefixCell.z = '@';
    }

    // Column 2 is Item Code (0-indexed: 2)
    const itemCell = worksheet[XLSX.utils.encode_cell({ r: R, c: 2 })];
    if (itemCell && itemCell.v !== undefined && R <= rows.length) {
      itemCell.t = 's';
      itemCell.z = '@';
    }

    // Column 6 is Bin No (0-indexed: 6)
    const binCell = worksheet[XLSX.utils.encode_cell({ r: R, c: 6 })];
    if (binCell && binCell.v !== undefined && R <= rows.length) {
      binCell.t = 's';
      binCell.z = '@';
    }
  }

  return worksheet;
}

/**
 * Exports inventory rows to a well-formatted .xlsx file with D and E joined by '--',
 * and the Unit ('months' / 'year') column placed right before Qty.
 */
export function exportToExcel(
  rows: InventoryRow[],
  defaultPrefix: string = 'TSUT',
  defaultBin: string = '2162',
  filename?: string
) {
  if (!rows || rows.length === 0) {
    return;
  }

  const workbook = XLSX.utils.book_new();

  // 1. All Sections combined sheet
  const allSheet = createFormattedSheet(rows, 'All Bins');
  XLSX.utils.book_append_sheet(workbook, allSheet, 'All_Sections');

  // 2. Separate sheet per bin if multiple bins exist
  const binsMap = new Map<string, InventoryRow[]>();
  rows.forEach((r) => {
    const bin = r.binNumber || defaultBin;
    if (!binsMap.has(bin)) {
      binsMap.set(bin, []);
    }
    binsMap.get(bin)!.push(r);
  });

  if (binsMap.size > 1) {
    binsMap.forEach((binRows, bin) => {
      const sheetName = `Bin_${bin}`.slice(0, 31);
      const binSheet = createFormattedSheet(binRows, `Bin ${bin}`);
      XLSX.utils.book_append_sheet(workbook, binSheet, sheetName);
    });
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const defaultFilename = filename || `Stock_Slip_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, defaultFilename);
}

/**
 * Copies rows to clipboard with D and E joined as 'Part Code -- Year',
 * and Unit ('months' / 'year') column right before Qty.
 */
export async function copyForExcelClipboard(rows: InventoryRow[]): Promise<boolean> {
  try {
    const headers = ['S.No\tPrefix\tItem Code\tPart Code -- Year\tUnit\tQty\tBin No'];
    const lines = rows.map((r, idx) => {
      const fullCode = r.fullCode || `${r.prefix}-${r.itemCode}`;
      const codeYear = `${fullCode}--${r.year}`;
      const unit = r.ageType || getAgeUnit(r.year);
      return `${idx + 1}\t${r.prefix}\t${r.itemCode}\t${codeYear}\t${unit}\t${r.quantity}\t${r.binNumber}`;
    });
    const tsvContent = [...headers, ...lines].join('\n');
    await navigator.clipboard.writeText(tsvContent);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

/**
 * Generates and downloads a CSV file with Unit ('months' / 'year') column right before Qty.
 */
export function downloadCSV(rows: InventoryRow[], filename: string = 'inventory_slip.csv') {
  const headers = ['S.No', 'Prefix', 'Item Code', 'Part Code -- Year', 'Unit', 'Qty', 'Bin No'];
  const lines = rows.map((r, idx) => {
    const fullCode = r.fullCode || `${r.prefix}-${r.itemCode}`;
    const codeYear = `${fullCode}--${r.year}`;
    const unit = r.ageType || getAgeUnit(r.year);
    return [
      idx + 1,
      `"${r.prefix}"`,
      `"${r.itemCode}"`,
      `"${codeYear}"`,
      `"${unit}"`,
      r.quantity,
      `"${r.binNumber}"`,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...lines].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
