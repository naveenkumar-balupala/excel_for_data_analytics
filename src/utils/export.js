// CSV and Excel export helpers.
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// rows: array of flat objects with the same keys.
export function exportToCSV(rows, filename = 'report.csv') {
  if (!rows || rows.length === 0) return
  const headers = Object.keys(rows[0])
  const escape = (v) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, filename)
}

export function exportToExcel(rows, filename = 'report.xlsx', sheetName = 'Results') {
  if (!rows || rows.length === 0) return
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename)
}

// Read a CSV/XLSX file (from an <input type="file">) into an array of row
// objects keyed by the header cells. Used by the bulk student import.
export async function readSpreadsheet(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) return []
  // defval:'' keeps empty cells as '' so column keys stay consistent per row.
  return XLSX.utils.sheet_to_json(ws, { defval: '', raw: false })
}
