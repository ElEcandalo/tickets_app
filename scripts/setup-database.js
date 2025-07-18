#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Database Setup Helper');
console.log('========================\n');

console.log('To fix the "Could not find a relationship between \'invitados\' and \'funcion\'" error, you need to:');
console.log('\n1. Get your Supabase database password:');
console.log('   - Go to your Supabase dashboard');
console.log('   - Navigate to Settings > Database');
console.log('   - Copy your database password\n');

console.log('2. Update your .env.local file with the correct password:');
console.log('   Replace "your_password_here" in these lines:');
console.log('   DATABASE_URL=postgresql://postgres.kqvmupzydfjjjpoqqjil:YOUR_ACTUAL_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres');
console.log('   DIRECT_URL=postgresql://postgres.kqvmupzydfjjjpoqqjil:YOUR_ACTUAL_PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres\n');

console.log('3. Run the database migration:');
console.log('   npx prisma migrate dev --name add-invitados-and-colaboradores\n');

console.log('4. Or manually run the SQL migration:');
console.log('   - Go to your Supabase dashboard > SQL Editor');
console.log('   - Copy and paste the contents of prisma/migrations/manual_add_invitados_and_colaboradores.sql');
console.log('   - Execute the SQL\n');

console.log('5. Generate the Prisma client:');
console.log('   npx prisma generate\n');

console.log('After completing these steps, the relationship error should be resolved! 🎉\n');

// Check if .env.local exists and show current status
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  if (envContent.includes('your_password_here')) {
    console.log('⚠️  WARNING: Your .env.local file still contains placeholder passwords!');
    console.log('   Please update them with your actual Supabase database password.\n');
  } else {
    console.log('✅ Your .env.local file appears to have real passwords configured.\n');
  }
} else {
  console.log('❌ .env.local file not found! Please create it with your database credentials.\n');
} 