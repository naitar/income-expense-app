import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { formatCurrency, formatDate } from './format'

/**
 * Prepare transaction data for export — normalizes rows into
 * clean column headers suitable for CSV / Excel.
 */
function buildRows(transactions) {
  return transactions.map((tx) => ({
    'ရက်စွဲ': formatDate(tx.date),
    'အမျိုးအစား': tx.type === 'income' ? 'ဝင်ငွေ' : 'သုံးငွေ',
    'ကဏ္ဍ': tx.category,
    'ဖော်ပြချက်': tx.description || '',
    'ပမာဏ (MMK)': Number(tx.amount),
    'ပမာဏ (သင်္ကကတ)': formatCurrency(tx.amount),
  }))
}

/**
 * Build a summary footer row (totals).
 */
function buildSummary(transactions) {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0)
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0)

  return {
    'ရက်စွဲ': 'စုစုပေါင်း',
    'အမျိုးအစား': '',
    'ကဏ္ဍ': '',
    'ဖော်ပြချက်': '',
    'ပမာဏ (MMK)': '',
    'ပမာဏ (သင်္ကကတ)': '',
    _summary: { income, expense, balance: income - expense },
  }
}

/**
 * Download helper — creates an invisible <a> and clicks it.
 */
function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export transactions to CSV and trigger download.
 * @param {Array} transactions — filtered transaction array
 * @param {string} [filenamePrefix] — file name prefix (date is auto-appended)
 */
export function exportToCSV(transactions, filenamePrefix = 'transactions') {
  const rows = buildRows(transactions)
  const summary = buildSummary(transactions)

  // Append summary rows
  rows.push(
    {},
    {
      'ရက်စွဲ': 'ဝင်ငွေစုစုပေါင်း',
      'ပမာဏ (MMK)': summary._summary.income,
      'ပမာဏ (သင်္ကကတ)': formatCurrency(summary._summary.income),
    },
    {
      'ရက်စွဲ': 'သုံးငွေစုစုပေါင်း',
      'ပမာဏ (MMK)': summary._summary.expense,
      'ပမာဏ (သင်္ကကတ)': formatCurrency(summary._summary.expense),
    },
    {
      'ရက်စွဲ': 'လက်ကျန်',
      'ပမာဏ (MMK)': summary._summary.balance,
      'ပမာဏ (သင်္ကကတ)': formatCurrency(summary._summary.balance),
    }
  )

  const csv = Papa.unparse(rows, { header: true })
  const bom = '﻿' // BOM for proper Myanmar text in Excel
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const dateStr = new Date().toISOString().slice(0, 10)
  download(blob, `${filenamePrefix}_${dateStr}.csv`)
}

/**
 * Export transactions to Excel (.xlsx) and trigger download.
 * @param {Array} transactions — filtered transaction array
 * @param {string} [filenamePrefix] — file name prefix
 */
export function exportToExcel(transactions, filenamePrefix = 'transactions') {
  const rows = buildRows(transactions)
  const summary = buildSummary(transactions)

  // Summary section
  rows.push(
    {},
    {
      'ရက်စွဲ': 'ဝင်ငွေစုစုပေါင်း',
      'ပမာဏ (MMK)': summary._summary.income,
      'ပမာဏ (သင်္ကကတ)': formatCurrency(summary._summary.income),
    },
    {
      'ရက်စွဲ': 'သုံးငွေစုစုပေါင်း',
      'ပမာဏ (MMK)': summary._summary.expense,
      'ပမာဏ (သင်္ကကတ)': formatCurrency(summary._summary.expense),
    },
    {
      'ရက်စွဲ': 'လက်ကျန်',
      'ပမာဏ (MMK)': summary._summary.balance,
      'ပမာဏ (သင်္ကကတ)': formatCurrency(summary._summary.balance),
    }
  )

  const ws = XLSX.utils.json_to_sheet(rows, { header: Object.keys(rows[0] || {}) })

  // Column widths
  ws['!cols'] = [
    { wch: 14 }, // ရက်စွဲ
    { wch: 10 }, // အမျိုးအစား
    { wch: 16 }, // ကဏ္ဍ
    { wch: 24 }, // ဖော်ပြချက်
    { wch: 16 }, // ပမာဏ (MMK)
    { wch: 18 }, // ပမာဏ (သင်္ကကတ)
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions')

  // Add a summary sheet
  const summaryData = [
    ['အကျဉ်းချုပ်', ''],
    ['ဝင်ငွေ', formatCurrency(summary._summary.income)],
    ['သုံးငွေ', formatCurrency(summary._summary.expense)],
    ['လက်ကျန်', formatCurrency(summary._summary.balance)],
    ['', ''],
    ['စုစုပေါင်း အရေအတွက်', `${transactions.length} ခု`],
    [
      'ဝင်ငွေ အရေအတွက်',
      `${transactions.filter((t) => t.type === 'income').length} ခု`,
    ],
    [
      'သုံးငွေ အရေအတွက်',
      `${transactions.filter((t) => t.type === 'expense').length} ခု`,
    ],
  ]
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
  summaryWs['!cols'] = [{ wch: 22 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

  XLSX.writeFile(wb, `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
