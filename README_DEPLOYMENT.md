# Google Sheets Integration - Deployment Guide

This project is configured to use Google Sheets as the data source and is ready for Vercel deployment.

## Setup Instructions

### 1. Google Sheets Setup

1. Create a Google Sheet with the following tabs:
   - **Categories** - Columns: `id`, `name`
   - **ProductTypes** - Columns: `id`, `name`
   - **Phones** - Columns: `id`, `typeId`, `name`
   - **Products** - Columns: `id`, `name`, `categoryId`, `typeId`, `phoneId`, `color`, `stock`, `image`

2. Get your Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```
   

### 2. Google Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name and create
   - Click on the service account > "Keys" > "Add Key" > "Create new key"
   - Choose JSON format and download the key file
5. Share your Google Sheet with the service account email (found in the JSON file, field `client_email`)

### 3. Vercel Deployment

1. Push your code to GitHub/GitLab/Bitbucket

2. Import the project to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. Configure Environment Variables in Vercel:
   - Go to Project Settings > Environment Variables
   - Add the following variables:

   ```
   SPREADSHEET_ID=your_spreadsheet_id_here
   SHEET_NAME=Products
   CATEGORIES_SHEET_NAME=Categories
   TYPES_SHEET_NAME=ProductTypes
   SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
   ```

   **Important for SERVICE_ACCOUNT_KEY:**
   - Copy the entire JSON content from your downloaded service account key file
   - In Vercel's environment variable editor, paste it as a single-line JSON string
   - Make sure all quotes are properly escaped, or use Vercel's JSON editor which handles this automatically

4. Deploy:
   - Vercel will automatically detect the project structure
   - The `/api` folder will be deployed as serverless functions
   - The frontend will be built and deployed automatically

### 4. Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```
   SPREADSHEET_ID=your_spreadsheet_id
   SHEET_NAME=Products
   CATEGORIES_SHEET_NAME=Categories
   TYPES_SHEET_NAME=ProductTypes
   SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   ```

3. For local API testing, you may need to use Vercel CLI:
   ```bash
   npm install -g vercel
   vercel dev
   ```

   Or use a local server that supports serverless functions (like the Vite dev server with a proxy, or a separate Express server for development).

### 5. API Endpoints

The following API endpoints are available:

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Add a category
- `DELETE /api/categories` - Delete a category

- `GET /api/types` - Get all product types
- `POST /api/types` - Add a product type
- `DELETE /api/types` - Delete a product type

- `GET /api/phones` - Get all phones
- `POST /api/phones` - Add a phone
- `DELETE /api/phones` - Delete a phone

- `GET /api/products` - Get all products
- `POST /api/products` - Add a product
- `PUT /api/products` - Update product stock
- `DELETE /api/products` - Delete a product

### Troubleshooting

1. **"Failed to fetch data" error:**
   - Check that SERVICE_ACCOUNT_KEY is properly set in Vercel
   - Verify the service account email has access to the Google Sheet
   - Check that the spreadsheet ID is correct

2. **"Module not found" errors:**
   - Ensure `googleapis` is installed: `npm install googleapis`
   - Check that the `lib/gsheets.js` file exists

3. **API routes not working:**
   - Verify the `/api` folder structure is correct
   - Check Vercel function logs in the dashboard
   - Ensure environment variables are set for production

### Notes

- The service account key file (`newwarehouse-482013-e8990b64b2ea.json`) should NOT be committed to git
- Add it to `.gitignore` if it's not already there
- Use environment variables for all sensitive data
- The frontend uses `/api` as the base URL, which works automatically on Vercel

