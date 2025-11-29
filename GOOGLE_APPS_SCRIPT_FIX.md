# Fix CORS Issue in Google Apps Script

**The error `setHeaders is not a function` occurs because `ContentService` doesn't support that method.**

## ✅ CORRECT Solution (Simple & Working)

Google Apps Script Web Apps **automatically handle CORS** when deployed correctly. You don't need to manually set headers!

### Updated Apps Script Code

**⚠️ IMPORTANT:** When copying the code below, copy ONLY the JavaScript code (the part between the backticks). Do NOT copy the ` ```javascript ` or ` ``` ` lines - those are just markdown formatting!

Replace your entire `Code.gs` with this **simple, working code**:

```javascript
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const body = JSON.parse(e.postData.contents);
  
  sheet.appendRow([body.name, body.score, new Date()]);
  
  return ContentService
    .createTextOutput(JSON.stringify({status: "OK"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  data.shift(); // remove header row
  
  const leaderboard = data
    .map(r => ({
      name: r[0] || 'Anonymous',
      score: parseInt(r[1]) || 0,
      timestamp: r[2] ? new Date(r[2]).toISOString() : new Date().toISOString()
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50); // Return top 50
  
  return ContentService
    .createTextOutput(JSON.stringify(leaderboard))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 🔑 CRITICAL: Deployment Settings

The CORS fix happens in the **deployment settings**, not in the code!

### Steps to Fix:

1. **Update your code** with the code above
2. **Deploy → Manage deployments**
3. Click the **pencil icon (edit)** next to your deployment
4. **VERIFY these settings:**
   - **Execute as:** `Me`
   - **Who has access:** `Anyone` ⚠️ **THIS IS CRITICAL!**
5. Click **New version**
6. Click **Deploy**
7. **Copy the new deployment URL** (it should end with `/exec`)

### Why This Works

When you set "Who has access: Anyone", Google Apps Script automatically:
- Adds CORS headers to responses
- Allows cross-origin requests
- Works with your GitHub Pages site

**You don't need to manually set headers in the code!**

## ✅ Deployment Configuration

After deploying your Apps Script, make sure the Web App URL is configured in your `index.html` file in the `LEADERBOARD_URL` constant.

**Note:** The deployment URL is already public in your `index.html` file, so it will be visible to anyone who views your game's source code.

## Troubleshooting

If CORS still doesn't work after setting "Anyone":

1. **Clear browser cache** - old responses might be cached
2. **Wait 2-3 minutes** - deployment changes can take time to propagate
3. **Check the deployment URL** - make sure you're using the `/exec` version, not `/dev`
4. **Test in incognito mode** - to rule out browser extensions blocking requests

## Alternative: If "Anyone" Doesn't Work

If for some reason "Anyone" access doesn't work, you can use this workaround that uses HtmlService:

```javascript
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const body = JSON.parse(e.postData.contents);
  sheet.appendRow([body.name, body.score, new Date()]);
  return createCorsHtmlResponse({status: "OK"});
}

function doGet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  data.shift();
  const leaderboard = data
    .map(r => ({name: r[0] || 'Anonymous', score: parseInt(r[1]) || 0, timestamp: r[2] ? new Date(r[2]).toISOString() : new Date().toISOString()}))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
  return createCorsHtmlResponse(leaderboard);
}

function createCorsHtmlResponse(obj) {
  return HtmlService.createHtmlOutput(JSON.stringify(obj))
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setContentType('application/json');
}
```

But the simple ContentService version should work fine with "Anyone" access!
