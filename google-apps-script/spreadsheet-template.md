# 📊 Google Sheets Database Setup for ReWear

This guide will help you set up the Google Sheets database structure for the ReWear platform.

## 🚀 Step 1: Create Google Sheets Database

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "ReWear Database"
4. Copy the spreadsheet ID from the URL (the long string between /d/ and /edit)

## 📋 Step 2: Create Required Sheets

Create the following sheets in your spreadsheet:

### Sheet 1: Users
**Headers (Row 1):**
```
ID | Email | DisplayName | Password | Points | JoinedAt | IsAdmin | Banned
```

### Sheet 2: Items
**Headers (Row 1):**
```
ID | Title | Description | Category | Size | Condition | PointsRequired | Tags | Images | OwnerID | OwnerName | CreatedAt | UpdatedAt | Status | Featured
```

### Sheet 3: SwapRequests
**Headers (Row 1):**
```
ID | ItemID | RequesterID | RequesterName | OwnerID | OwnerName | Status | Message | CreatedAt | CompletedAt
```

### Sheet 4: Categories
**Headers (Row 1):**
```
ID | Name | Icon | Count | Active
```

### Sheet 5: Sessions
**Headers (Row 1):**
```
SessionToken | UserID | ExpiresAt
```

## 🔧 Step 3: Configure Apps Script

1. In your Google Sheets, go to **Extensions** → **Apps Script**
2. Replace the default code with the content from `Code.gs`
3. Update the `SPREADSHEET_ID` in the CONFIG object with your actual spreadsheet ID
4. Save the script

## 🚀 Step 4: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Choose **Web app**
3. Set the following:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Copy the Web App URL

## 📝 Step 5: Update Frontend Configuration

Update the `APPS_SCRIPT_URL` in your frontend code with the Web App URL from step 4.

## 🔒 Step 6: Security Considerations

- The spreadsheet should be shared only with necessary users
- Consider using Google Apps Script's built-in security features
- Regularly backup your data
- Monitor usage and set up alerts if needed

## 📊 Sample Data Structure

### Users Sheet Example:
```
user_1234567890_abc123 | john@gmail.com | John Doe | hashed_password | 150 | 2024-01-15T10:30:00Z | false | false
user_1234567891_def456 | admin@gmail.com | Admin User | hashed_password | 500 | 2024-01-10T09:00:00Z | true | false
```

### Items Sheet Example:
```
item_1234567890_xyz789 | Vintage Denim Jacket | Classic vintage denim jacket in excellent condition | Outerwear | M | excellent | 45 | vintage,denim,casual | image1.jpg,image2.jpg | user_1234567890_abc123 | John Doe | 2024-01-15T11:00:00Z | 2024-01-15T11:00:00Z | available | true
```

### Categories Sheet Example:
```
cat_1 | Tops | shirt-icon | 234 | true
cat_2 | Dresses | dress-icon | 156 | true
cat_3 | Pants | pants-icon | 189 | true
cat_4 | Shoes | shoe-icon | 112 | true
cat_5 | Accessories | accessory-icon | 98 | true
cat_6 | Outerwear | jacket-icon | 76 | true
```

## 🛠️ Maintenance Tips

1. **Regular Backups**: Export your spreadsheet regularly
2. **Data Validation**: Use Google Sheets data validation rules
3. **Monitoring**: Set up alerts for unusual activity
4. **Cleanup**: Regularly clean up expired sessions
5. **Performance**: Keep the spreadsheet organized and avoid unnecessary data

## 🚨 Important Notes

- Google Sheets has a limit of 10 million cells per spreadsheet
- Apps Script has execution time limits (6 minutes for web apps)
- Consider data archiving for old records
- Monitor API quotas and usage limits

## 📈 Scaling Considerations

For larger applications, consider:
- Using Google Cloud SQL instead of Sheets
- Implementing caching strategies
- Breaking data into multiple spreadsheets
- Using Google Cloud Functions for complex operations 