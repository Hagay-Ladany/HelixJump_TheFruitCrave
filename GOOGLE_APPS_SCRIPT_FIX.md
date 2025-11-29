# Fix CORS Issue in Google Apps Script

**The error `setHeaders is not a function` occurs because `ContentService` doesn't support that method.**

## ✅ CORRECT Solution (Simple & Working)

Google Apps Script Web Apps **automatically handle CORS** when deployed correctly. You don't need to manually set headers!

### Updated Apps Script Code

**⚠️ IMPORTANT:** When copying the code below, copy ONLY the JavaScript code (the part between the backticks). Do NOT copy the ` ```javascript ` or ` ``` ` lines - those are just markdown formatting!

Replace your entire `Code.gs` with this **working code using ContentService**:

```javascript
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  
  // Handle FormData (avoids CORS preflight)
  let name, score;
  if (e.parameter) {
    // FormData comes as parameters
    name = e.parameter.name || 'Anonymous';
    score = parseInt(e.parameter.score) || 0;
  } else {
    // Fallback: try JSON parsing
    try {
      const body = JSON.parse(e.postData.contents);
      name = body.name || 'Anonymous';
      score = parseInt(body.score) || 0;
    } catch(err) {
      name = 'Anonymous';
      score = 0;
    }
  }
  
  sheet.appendRow([name, score, new Date()]);
  
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

**Note:** This uses `ContentService` which works for GET requests. For POST to work, you MUST set "Who has access: Anyone" in deployment settings.

**Why HtmlService?** `HtmlService` handles CORS preflight requests (OPTIONS) automatically when deployed with "Anyone" access, while `ContentService` does not. This is the most reliable solution for POST requests with JSON.

## 🔑 CRITICAL: Deployment Settings

The CORS fix requires **BOTH** the code above (with `doOptions`) **AND** correct deployment settings!

### Steps to Fix:

1. **Update your code** with the code above (includes `doOptions` function)
2. **Deploy → Manage deployments**
3. Click the **pencil icon (edit)** next to your deployment
4. **VERIFY these settings:**
   - **Execute as:** `Me`
   - **Who has access:** `Anyone` ⚠️ **THIS IS CRITICAL!**
5. Click **New version**
6. Click **Deploy**
7. **Copy the new deployment URL** (it should end with `/exec`)
8. **Wait 2-3 minutes** for the deployment to propagate

### Why This Works

- `HtmlService` automatically handles CORS preflight requests (OPTIONS) when deployed with "Anyone" access
- Setting "Who has access: Anyone" allows cross-origin requests
- `setXFrameOptionsMode(ALLOWALL)` enables cross-origin access
- Together, they enable both GET and POST requests from your GitHub Pages site

## ✅ Deployment Configuration

After deploying your Apps Script, make sure the Web App URL is configured in your `index.html` file in the `LEADERBOARD_URL` constant.

**Note:** The deployment URL is already public in your `index.html` file, so it will be visible to anyone who views your game's source code.

## Troubleshooting

If CORS still doesn't work after setting "Anyone":

1. **Clear browser cache** - old responses might be cached
2. **Wait 2-3 minutes** - deployment changes can take time to propagate
3. **Check the deployment URL** - make sure you're using the `/exec` version, not `/dev`
4. **Test in incognito mode** - to rule out browser extensions blocking requests

## Why HtmlService Instead of ContentService?

`ContentService` doesn't handle CORS preflight (OPTIONS) requests properly, even with "Anyone" access. `HtmlService` with `setXFrameOptionsMode(ALLOWALL)` is the recommended solution for cross-origin POST requests with JSON content.

This is the standard approach recommended by Google for handling CORS in Apps Script Web Apps.
