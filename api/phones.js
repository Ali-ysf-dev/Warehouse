import { getSheetsClient, readSheet, appendToSheet, deleteSheetRow } from '../lib/gsheets.js'

export default async function handler(req, res) {
  const { sheets, spreadsheetId, sheetNames } = await getSheetsClient()

  if (req.method === 'GET') {
    try {
      const rows = await readSheet(sheets, spreadsheetId, sheetNames.phones)
      const headers = rows[0] || []
      const data = rows.slice(1).map((row, index) => {
        const obj = {}
        headers.forEach((header, i) => {
          obj[header] = row[i] || ''
        })
        obj._rowIndex = index + 2
        return obj
      })
      res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, typeId } = req.body
      if (!name || !typeId) {
        return res.status(400).json({ error: 'Name and typeId are required' })
      }
      const id = `phone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      await appendToSheet(sheets, spreadsheetId, sheetNames.phones, [id, typeId, name])
      res.status(201).json({ id, typeId, name })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'DELETE') {
    try {
      const { rowIndex } = req.body
      if (!rowIndex) {
        return res.status(400).json({ error: 'rowIndex is required' })
      }
      await deleteSheetRow(sheets, spreadsheetId, sheetNames.phones, rowIndex)
      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
    res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

