/**
 * Database Reset Utility for ReWear Platform
 * Multi-spreadsheet support: Users, Swaps, etc. in REWEAR_SPREADSHEET_ID; Items in ITEMS_SPREADSHEET_ID
 * 
 * Note: This file uses CONFIG and SHEETS constants from Code.gs
 */

/**
 * Diagnostic function to check spreadsheets and sheets
 */
function diagnoseSpreadsheets() {
  try {
    console.log('🔍 Starting spreadsheet diagnosis...');
    console.log('CONFIG:', CONFIG);
    console.log('SHEETS:', SHEETS);
    
    // Check ReWear spreadsheet
    console.log('\n📊 Checking ReWear Spreadsheet...');
    const rewearSpreadsheet = SpreadsheetApp.openById(CONFIG.REWEAR_SPREADSHEET_ID);
    if (rewearSpreadsheet) {
      console.log('✅ ReWear spreadsheet found');
      const rewearSheets = rewearSpreadsheet.getSheets();
      console.log('Available sheets in ReWear spreadsheet:');
      rewearSheets.forEach(sheet => {
        console.log(`  - ${sheet.getName()}`);
      });
      
      // Check each expected sheet
      Object.values(SHEETS).forEach(sheetName => {
        if (sheetName !== SHEETS.ITEMS) { // Skip Items sheet (it's in the other spreadsheet)
          const sheet = rewearSpreadsheet.getSheetByName(sheetName);
          if (sheet) {
            console.log(`✅ Found sheet: ${sheetName}`);
          } else {
            console.log(`❌ Missing sheet: ${sheetName}`);
          }
        }
      });
    } else {
      console.log('❌ ReWear spreadsheet not found');
    }
    
    // Check Items spreadsheet
    console.log('\n📊 Checking Items Spreadsheet...');
    const itemsSpreadsheet = SpreadsheetApp.openById(CONFIG.ITEMS_SPREADSHEET_ID);
    if (itemsSpreadsheet) {
      console.log('✅ Items spreadsheet found');
      const itemsSheets = itemsSpreadsheet.getSheets();
      console.log('Available sheets in Items spreadsheet:');
      itemsSheets.forEach(sheet => {
        console.log(`  - ${sheet.getName()}`);
      });
      
      // Check Items sheet
      const itemsSheet = itemsSpreadsheet.getSheetByName(SHEETS.ITEMS);
      if (itemsSheet) {
        console.log(`✅ Found sheet: ${SHEETS.ITEMS}`);
      } else {
        console.log(`❌ Missing sheet: ${SHEETS.ITEMS}`);
      }
    } else {
      console.log('❌ Items spreadsheet not found');
    }
    
    return 'Diagnosis completed. Check console for details.';
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
    return 'Error during diagnosis: ' + error.message;
  }
}

/**
 * Create missing sheets if they don't exist
 */
function createMissingSheets() {
  try {
    console.log('🔧 Creating missing sheets...');
    
    // Create sheets in ReWear spreadsheet
    const rewearSpreadsheet = SpreadsheetApp.openById(CONFIG.REWEAR_SPREADSHEET_ID);
    if (rewearSpreadsheet) {
      const sheetsToCreate = [SHEETS.USERS, SHEETS.SWAP_REQUESTS, SHEETS.SESSIONS, SHEETS.CATEGORIES];
      
      sheetsToCreate.forEach(sheetName => {
        let sheet = rewearSpreadsheet.getSheetByName(sheetName);
        if (!sheet) {
          sheet = rewearSpreadsheet.insertSheet(sheetName);
          console.log(`✅ Created sheet: ${sheetName}`);
          
          // Add headers based on sheet type
          if (sheetName === SHEETS.USERS) {
            sheet.getRange(1, 1, 1, 8).setValues([['ID', 'Email', 'DisplayName', 'Password', 'Points', 'JoinedAt', 'IsAdmin', 'Banned']]);
          } else if (sheetName === SHEETS.SWAP_REQUESTS) {
            sheet.getRange(1, 1, 1, 9).setValues([['ID', 'ItemId', 'RequesterId', 'RequesterName', 'OwnerId', 'OwnerName', 'Status', 'Message', 'CreatedAt']]);
          } else if (sheetName === SHEETS.SESSIONS) {
            sheet.getRange(1, 1, 1, 3).setValues([['SessionToken', 'UserId', 'ExpiresAt']]);
          } else if (sheetName === SHEETS.CATEGORIES) {
            sheet.getRange(1, 1, 1, 2).setValues([['ID', 'Name']]);
          }
        } else {
          console.log(`ℹ️ Sheet already exists: ${sheetName}`);
        }
      });
    }
    
    // Create Items sheet in Items spreadsheet
    const itemsSpreadsheet = SpreadsheetApp.openById(CONFIG.ITEMS_SPREADSHEET_ID);
    if (itemsSpreadsheet) {
      let itemsSheet = itemsSpreadsheet.getSheetByName(SHEETS.ITEMS);
      if (!itemsSheet) {
        itemsSheet = itemsSpreadsheet.insertSheet(SHEETS.ITEMS);
        console.log(`✅ Created sheet: ${SHEETS.ITEMS}`);
        
        // Add headers for Items sheet
        itemsSheet.getRange(1, 1, 1, 15).setValues([['ID', 'Title', 'Description', 'Category', 'Size', 'Condition', 'PointsRequired', 'Tags', 'Images', 'OwnerId', 'OwnerName', 'CreatedAt', 'UpdatedAt', 'Status', 'Featured']]);
      } else {
        console.log(`ℹ️ Sheet already exists: ${SHEETS.ITEMS}`);
      }
    }
    
    console.log('🎉 Sheet creation completed!');
    return 'Sheet creation completed!';
    
  } catch (error) {
    console.error('❌ Error creating sheets:', error);
    return 'Error creating sheets: ' + error.message;
  }
}

/**
 * Reset all data from both spreadsheets (keep headers)
 */
function resetDatabase() {
  try {
    console.log('🔄 Starting database reset...');
    
    // Clear Users sheet (keep header) - ReWear spreadsheet
    const usersSheet = getSheet(SHEETS.USERS);
    if (usersSheet) {
      const lastRow = usersSheet.getLastRow();
      if (lastRow > 1) {
        usersSheet.deleteRows(2, lastRow - 1);
        console.log('✅ Users sheet cleared');
      } else {
        console.log('ℹ️ Users sheet already empty');
      }
    } else {
      console.log('⚠️ Users sheet not found');
    }
    
    // Clear Items sheet (keep header) - Items spreadsheet
    const itemsSheet = getSheet(SHEETS.ITEMS);
    if (itemsSheet) {
      const lastRow = itemsSheet.getLastRow();
      if (lastRow > 1) {
        itemsSheet.deleteRows(2, lastRow - 1);
        console.log('✅ Items sheet cleared');
      } else {
        console.log('ℹ️ Items sheet already empty');
      }
    } else {
      console.log('⚠️ Items sheet not found');
    }
    
    // Clear Swap Requests sheet (keep header) - ReWear spreadsheet
    const swapsSheet = getSheet(SHEETS.SWAP_REQUESTS);
    if (swapsSheet) {
      const lastRow = swapsSheet.getLastRow();
      if (lastRow > 1) {
        swapsSheet.deleteRows(2, lastRow - 1);
        console.log('✅ Swap Requests sheet cleared');
      } else {
        console.log('ℹ️ Swap Requests sheet already empty');
      }
    } else {
      console.log('⚠️ Swap Requests sheet not found');
    }
    
    // Clear Sessions sheet (keep header) - ReWear spreadsheet
    const sessionsSheet = getSheet(SHEETS.SESSIONS);
    if (sessionsSheet) {
      const lastRow = sessionsSheet.getLastRow();
      if (lastRow > 1) {
        sessionsSheet.deleteRows(2, lastRow - 1);
        console.log('✅ Sessions sheet cleared');
      } else {
        console.log('ℹ️ Sessions sheet already empty');
      }
    } else {
      console.log('⚠️ Sessions sheet not found');
    }
    
    console.log('🎉 Database reset completed successfully!');
    return 'Database reset completed successfully!';
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    return 'Error resetting database: ' + error.message;
  }
}

/**
 * Test function to verify database is empty
 */
function testDatabaseReset() {
  try {
    console.log('🧪 Testing database reset...');
    
    const users = getAllUsers();
    const items = getAllItems();
    const swaps = getAllSwapRequests();
    
    console.log('📊 Database status after reset:');
    console.log('   Users:', users.length);
    console.log('   Items:', items.length);
    console.log('   Swaps:', swaps.length);
    
    if (users.length === 0 && items.length === 0 && swaps.length === 0) {
      console.log('✅ Database is completely empty - ready for first admin user!');
      return 'Database is ready for first admin user!';
    } else {
      console.log('❌ Database still contains data - reset may have failed');
      return 'Database reset may have failed - check manually';
    }
    
  } catch (error) {
    console.error('❌ Error testing database reset:', error);
    return 'Error testing database reset: ' + error.message;
  }
}

/**
 * Create admin user manually (for testing)
 */
function createTestAdmin() {
  try {
    console.log('👤 Creating test admin user...');
    
    const adminData = {
      id: 'admin_' + Date.now(),
      email: 'admin@rewear.com',
      displayName: 'Admin User',
      password: hashPassword('admin123456'),
      points: CONFIG.WELCOME_POINTS,
      joinedAt: new Date().toISOString(),
      isAdmin: true,
      banned: false
    };
    
    const success = createUser(adminData);
    if (success) {
      console.log('✅ Test admin user created successfully');
      return 'Test admin user created: admin@rewear.com / admin123456';
    } else {
      console.log('❌ Failed to create test admin user');
      return 'Failed to create test admin user';
    }
    
  } catch (error) {
    console.error('❌ Error creating test admin:', error);
    return 'Error creating test admin: ' + error.message;
  }
}

 