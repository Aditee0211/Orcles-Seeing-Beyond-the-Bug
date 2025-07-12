#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 ReWear - Update Spreadsheet ID');
console.log('=====================================\n');

// Get spreadsheet ID from user
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function updateSpreadsheetId() {
  try {
    console.log('📋 Please provide your Google Sheets ID:');
    console.log('   (You can find this in the URL of your Google Sheet)');
    console.log('   Example: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit');
    console.log('   The ID is: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms\n');
    
    const spreadsheetId = await askQuestion('Enter your Spreadsheet ID: ');
    
    if (!spreadsheetId) {
      console.log('❌ Spreadsheet ID cannot be empty');
      rl.close();
      return;
    }
    
    // Validate spreadsheet ID format (basic check)
    if (!/^[a-zA-Z0-9-_]+$/.test(spreadsheetId)) {
      console.log('❌ Invalid spreadsheet ID format');
      rl.close();
      return;
    }
    
    console.log('\n📝 Updating files...');
    
    // Update Code.gs
    const codeGsPath = path.join(__dirname, '..', 'google-apps-script', 'Code.gs');
    let codeGsContent = fs.readFileSync(codeGsPath, 'utf8');
    codeGsContent = codeGsContent.replace(
      /SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE'/,
      `SPREADSHEET_ID: '${spreadsheetId}'`
    );
    fs.writeFileSync(codeGsPath, codeGsContent);
    console.log('✅ Updated google-apps-script/Code.gs');
    
    // Update ResetDatabase.gs
    const resetGsPath = path.join(__dirname, '..', 'google-apps-script', 'ResetDatabase.gs');
    let resetGsContent = fs.readFileSync(resetGsPath, 'utf8');
    resetGsContent = resetGsContent.replace(
      /SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE'/,
      `SPREADSHEET_ID: '${spreadsheetId}'`
    );
    fs.writeFileSync(resetGsPath, resetGsContent);
    console.log('✅ Updated google-apps-script/ResetDatabase.gs');
    
    console.log('\n🎉 Spreadsheet ID updated successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to Google Apps Script (script.google.com)');
    console.log('2. Open your ReWear project');
    console.log('3. Copy the updated Code.gs content');
    console.log('4. Deploy the script as a web app');
    console.log('5. Run the resetDatabase() function to clear your database');
    console.log('6. Register your first admin user');
    
  } catch (error) {
    console.error('❌ Error updating spreadsheet ID:', error.message);
  } finally {
    rl.close();
  }
}

updateSpreadsheetId(); 