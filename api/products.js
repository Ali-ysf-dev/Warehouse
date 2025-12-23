import { getSheetsClient, readSheet, appendToSheet, updateSheetRow, deleteSheetRow } from '../lib/gsheets.js'

export default async function handler(req, res) {
  const { sheets, spreadsheetId, sheetNames } = await getSheetsClient()

  if (req.method === 'GET') {
    try {
      const rows = await readSheet(sheets, spreadsheetId, sheetNames.products)
      const headers = rows[0] || []
      const data = rows.slice(1).map((row, index) => {
        const obj = {}
        headers.forEach((header, i) => {
          obj[header] = row[i] || ''
        })
        // Convert stock to number
        if (obj.stock) obj.stock = Number(obj.stock) || 0
        obj._rowIndex = index + 2
        return obj
      })
      res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, categoryId, typeId, phoneId, color, stock, image } = req.body
      if (!name || !categoryId || !typeId || !phoneId || !color || stock === undefined) {
        return res.status(400).json({ error: 'Missing required fields' })
      }
      const id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const defaultImage =
        image ||
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'
      await appendToSheet(sheets, spreadsheetId, sheetNames.products, [
        id,
        name,
        categoryId,
        typeId,
        phoneId,
        color,
        String(stock),
        defaultImage,
      ])
      res.status(201).json({
        id,
        name,
        categoryId,
        typeId,
        phoneId,
        color,
        stock: Number(stock),
        image: defaultImage,
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'PUT') {
    try {
      const { rowIndex, stock } = req.body
      if (rowIndex === undefined || stock === undefined) {
        return res.status(400).json({ error: 'rowIndex and stock are required' })
      }
      // Read current row
      const rows = await readSheet(sheets, spreadsheetId, sheetNames.products)
      const currentRow = rows[rowIndex - 1] || []
      if (currentRow.length === 0) {
        return res.status(404).json({ error: 'Product not found' })
      }
      // Update stock (column G, index 6)
      currentRow[6] = String(stock)
      await updateSheetRow(sheets, spreadsheetId, sheetNames.products, rowIndex, currentRow)
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
      await deleteSheetRow(sheets, spreadsheetId, sheetNames.products, rowIndex)
      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

