import { getSheetsClient, readSheet, appendToSheet, updateSheetRow, deleteSheetRow } from '../lib/gsheets.js'

export default async function handler(req, res) {
  const { sheets, spreadsheetId, sheetNames } = await getSheetsClient()

  if (req.method === 'GET') {
    try {
      const rows = await readSheet(sheets, spreadsheetId, sheetNames.categories)
      const headers = rows[0] || []
      const data = rows.slice(1).map((row, index) => {
        const obj = {}
        headers.forEach((header, i) => {
          obj[header] = row[i] || ''
        })
        obj._rowIndex = index + 2 // 1-based + header row
        return obj
      })
      res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { name } = req.body
      if (!name) {
        return res.status(400).json({ error: 'Name is required' })
      }
      const id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      await appendToSheet(sheets, spreadsheetId, sheetNames.categories, [id, name])
      res.status(201).json({ id, name })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'PUT') {
    try {
      const { rowIndex, name } = req.body
      if (!rowIndex || !name) {
        return res.status(400).json({ error: 'rowIndex and name are required' })
      }
      const rows = await readSheet(sheets, spreadsheetId, sheetNames.categories)
      const currentRow = rows[rowIndex - 1] || []
      if (currentRow.length === 0) {
        return res.status(404).json({ error: 'Category not found' })
      }
      currentRow[1] = name // Update name (column B, index 1)
      await updateSheetRow(sheets, spreadsheetId, sheetNames.categories, rowIndex, currentRow)
      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'DELETE') {
    try {
      const { rowIndex } = req.body
      if (!rowIndex) {
        return res.status(400).json({ error: 'rowIndex is required' })
      }
      await deleteSheetRow(sheets, spreadsheetId, sheetNames.categories, rowIndex)
      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

