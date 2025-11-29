# Fix CORS Issue in Google Apps Script

Your Google Apps Script needs to return CORS headers to work with your website. Here's the updated code:

## Updated Apps Script Code

Replace your current `Code.gs` with this:

```javascript
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  
  // Parse the request body
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (e) {
    body = e.parameter; // Fallback for form data
  }
  
  const name = body.name || 'Anonymous';
  const score = parseInt(body.score) || 0;
  
  sheet.appendRow([name, score, new Date()]);
  
  // Return JSON with CORS headers
  return ContentService
    .createTextOutput(JSON.stringify({status: "OK"}))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

function doGet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // Remove header row
  data.shift();
  
  const leaderboard = data
    .map(r => ({
      name: r[0] || 'Anonymous',
      score: parseInt(r[1]) || 0,
      timestamp: r[2] ? new Date(r[2]).toISOString() : new Date().toISOString()
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50); // Return top 50
  
  // Return JSON with CORS headers
  return ContentService
    .createTextOutput(JSON.stringify(leaderboard))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

// Handle OPTIONS request for CORS preflight
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600'
    });
}
```

## Steps to Update

1. Go to your Google Sheet
2. Click **Extensions → Apps Script**
3. Replace all the code in `Code.gs` with the code above
4. Click **Deploy → Manage deployments**
5. Click the pencil icon (edit) next to your existing deployment
6. Click **New version**
7. Click **Deploy**
8. Test your game again

## Important Notes

- The `setHeaders()` method adds CORS headers to allow your website to access the script
- `Access-Control-Allow-Origin: *` allows any website to access it (you can restrict this to your domain if needed)
- After updating, it may take a few minutes for changes to propagate

## Alternative: Restrict to Your Domain

If you want to restrict access to only your GitHub Pages domain, change:
```javascript
'Access-Control-Allow-Origin': '*'
```
to:
```javascript
'Access-Control-Allow-Origin': 'https://hagay-ladany.github.io'
```

