#!/usr/bin/env node

/**
 * ReWear Admin Setup Script
 * This script helps you set up the admin environment quickly
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔄 ReWear Admin Setup Script');
console.log('=============================\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAdmin() {
  try {
    console.log('📋 Step 1: Database Reset Instructions');
    console.log('=====================================');
    console.log('1. Open your Google Sheets database');
    console.log('2. Clear all data from each sheet (keep headers only)');
    console.log('3. Or use the resetDatabase() function in Google Apps Script\n');

    const hasResetDatabase = await question('Have you reset your database? (y/n): ');
    
    if (hasResetDatabase.toLowerCase() !== 'y') {
      console.log('\n❌ Please reset your database first, then run this script again.');
      rl.close();
      return;
    }

    console.log('\n📝 Step 2: Google Apps Script Configuration');
    console.log('===========================================');
    console.log('1. Open your Google Apps Script project');
    console.log('2. The registration function has been updated automatically');
    console.log('3. Deploy the updated script as a new web app\n');

    const hasUpdatedScript = await question('Have you deployed the updated script? (y/n): ');
    
    if (hasUpdatedScript.toLowerCase() !== 'y') {
      console.log('\n❌ Please deploy the updated script first, then run this script again.');
      rl.close();
      return;
    }

    console.log('\n🔗 Step 3: Environment Configuration');
    console.log('====================================');
    
    const appsScriptUrl = await question('Enter your new Google Apps Script Web App URL: ');
    
    if (!appsScriptUrl.includes('script.google.com')) {
      console.log('\n❌ Invalid Google Apps Script URL. Please check the URL and try again.');
      rl.close();
      return;
    }

    // Create or update .env file
    const envPath = path.join(dirname(__dirname), '.env');
    const envContent = `# Google Apps Script Configuration
VITE_APPS_SCRIPT_URL=${appsScriptUrl}

# App Settings
VITE_APP_NAME=ReWear
VITE_APP_VERSION=1.0.0
`;

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment file (.env) created/updated successfully!');

    console.log('\n👤 Step 4: Admin Account Creation');
    console.log('================================');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Open http://localhost:5173');
    console.log('3. Click "Register"');
    console.log('4. Create your admin account (first user = admin)');
    console.log('5. Verify admin access in the admin panel\n');

    const adminEmail = await question('What email will you use for the admin account? ');
    const adminPassword = await question('What password will you use? (min 6 characters): ');

    if (adminPassword.length < 6) {
      console.log('\n❌ Password must be at least 6 characters long.');
      rl.close();
      return;
    }

    console.log('\n📋 Admin Account Summary');
    console.log('========================');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('Role: Admin (first user)');
    console.log('Access: Full admin panel');

    console.log('\n🚀 Step 5: Verification Checklist');
    console.log('================================');
    console.log('After creating your admin account, verify:');
    console.log('□ Registration succeeds');
    console.log('□ User is automatically logged in');
    console.log('□ userRole in localStorage shows "admin"');
    console.log('□ Admin panel is accessible');
    console.log('□ Platform statistics show correct counts');

    console.log('\n🎯 Next Steps:');
    console.log('1. Create your first item as admin');
    console.log('2. Test the item approval system');
    console.log('3. Create additional test users');
    console.log('4. Test the swap request system');

    console.log('\n✅ Setup complete! Your ReWear platform is ready with admin access.');
    console.log('\n🔐 Security Reminder:');
    console.log('- Keep your admin credentials secure');
    console.log('- Don\'t share admin access with untrusted users');
    console.log('- Regularly backup your database');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setupAdmin(); 