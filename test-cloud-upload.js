#!/usr/bin/env node

/**
 * Test script for cloud upload functionality
 * Run with: node test-cloud-upload.js
 */

const fs = require('fs');
const path = require('path');

console.log('🌥️ Cloud Upload Test Script');
console.log('=============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('📝 Please create a .env file with your Cloudinary credentials:');
  console.log('');
  console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('CLOUDINARY_API_KEY=your_api_key');
  console.log('CLOUDINARY_API_SECRET=your_api_secret');
  console.log('');
  console.log('📖 See CLOUD_SETUP.md for detailed instructions');
  process.exit(1);
}

// Check .env content
const envContent = fs.readFileSync(envPath, 'utf8');
const hasCloudinary = envContent.includes('CLOUDINARY_CLOUD_NAME') && 
                     envContent.includes('CLOUDINARY_API_KEY') && 
                     envContent.includes('CLOUDINARY_API_SECRET');

if (!hasCloudinary) {
  console.log('⚠️  .env file found but Cloudinary credentials missing!');
  console.log('🔑 Please add your Cloudinary credentials to .env file');
  console.log('');
  console.log('📖 See CLOUD_SETUP.md for setup instructions');
  process.exit(1);
}

console.log('✅ .env file found with Cloudinary credentials');
console.log('🚀 Your server is ready for cloud uploads!');
console.log('');
console.log('📋 Next steps:');
console.log('1. Start your server: npm run start:dev');
console.log('2. Test upload: POST /files/upload');
console.log('3. Check storage stats: GET /files/stats/storage');
console.log('4. Monitor Cloudinary dashboard');
console.log('');
console.log('📚 Documentation: CLOUD_SETUP.md');
console.log('🌐 Cloudinary Dashboard: https://cloudinary.com/console');
console.log('');
console.log('🎉 Happy uploading! 🚀'); 