import { google } from 'googleapis'

// Initialize Google Sheets client
export async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.SERVICE_ACCOUNT_KEY || '{}'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const authClient = await auth.getClient()
  const sheets = google.sheets({ version: 'v4', auth: authClient })

  return {
    sheets,
    spreadsheetId: process.env.SPREADSHEET_ID || '1Pg7MJ_e37O0Zu6b7-giqpB4rhtc26gEDyBqD5HCFvEE',
    sheetNames: {
      products: process.env.SHEET_NAME || 'Products',
      categories: process.env.CATEGORIES_SHEET_NAME || 'Categories',
      types: process.env.TYPES_SHEET_NAME || 'ProductTypes',
      phones: 'Phones', // Assuming phones sheet name
    },
  }
}

// Read all rows from a sheet
export async function readSheet(sheets, spreadsheetId, sheetName) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    })
    return response.data.values || []
  } catch (error) {
    console.error(`Error reading sheet ${sheetName}:`, error)
    return []
  }
}

// Write rows to a sheet
export async function appendToSheet(sheets, spreadsheetId, sheetName, values) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [values] },
    })
    return { success: true }
  } catch (error) {
    console.error(`Error appending to sheet ${sheetName}:`, error)
    return { success: false, error: error.message }
  }
}

// Update a row in a sheet (by row index, 1-based)
export async function updateSheetRow(sheets, spreadsheetId, sheetName, rowIndex, values) {
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowIndex}:Z${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [values] },
    })
    return { success: true }
  } catch (error) {
    console.error(`Error updating row in sheet ${sheetName}:`, error)
    return { success: false, error: error.message }
  }
}

// Delete a row from a sheet (by row index, 1-based)
export async function deleteSheetRow(sheets, spreadsheetId, sheetName, rowIndex) {
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: await getSheetId(sheets, spreadsheetId, sheetName),
                dimension: 'ROWS',
                startIndex: rowIndex - 1,
                endIndex: rowIndex,
              },
            },
          },
        ],
      },
    })
    return { success: true }
  } catch (error) {
    console.error(`Error deleting row from sheet ${sheetName}:`, error)
    return { success: false, error: error.message }
  }
}

// Get sheet ID by name
async function getSheetId(sheets, spreadsheetId, sheetName) {
  try {
    const response = await sheets.spreadsheets.get({ spreadsheetId })
    const sheet = response.data.sheets.find((s) => s.properties.title === sheetName)
    return sheet?.properties.sheetId
  } catch (error) {
    console.error(`Error getting sheet ID for ${sheetName}:`, error)
    return null
  }
}

// Initialize sheets with headers if they don't exist
export async function initializeSheets() {
  const { sheets, spreadsheetId, sheetNames } = await getSheetsClient()

  // Initialize Categories sheet
  const categoriesData = await readSheet(sheets, spreadsheetId, sheetNames.categories)
  if (categoriesData.length === 0) {
    await appendToSheet(sheets, spreadsheetId, sheetNames.categories, ['id', 'name'])
  }

  // Initialize ProductTypes sheet
  const typesData = await readSheet(sheets, spreadsheetId, sheetNames.types)
  if (typesData.length === 0) {
    await appendToSheet(sheets, spreadsheetId, sheetNames.types, ['id', 'name'])
  }

  // Initialize Phones sheet
  const phonesData = await readSheet(sheets, spreadsheetId, sheetNames.phones)
  if (phonesData.length === 0) {
    await appendToSheet(sheets, spreadsheetId, sheetNames.phones, ['id', 'typeId', 'name'])
  }

  // Initialize Products sheet
  const productsData = await readSheet(sheets, spreadsheetId, sheetNames.products)
  if (productsData.length === 0) {
    await appendToSheet(sheets, spreadsheetId, sheetNames.products, [
      'id',
      'name',
      'categoryId',
      'typeId',
      'phoneId',
      'color',
      'stock',
      'image',
    ])
  }
}

