#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function showCreateAdminProfile() {
  const createAdminPath = path.join(process.cwd(), 'scripts', 'create-admin-profile.sql');
  const createAdminContent = fs.readFileSync(createAdminPath, 'utf8');

  console.log('👤 CREAR PERFIL DE USUARIO ADMIN');
  console.log('='.repeat(60));
  console.log('');
  console.log('❌ Error: "JSON object requested, multiple (or no) rows returned"');
  console.log('🔧 El usuario existe en auth.users pero no tiene perfil en user_profiles');
  console.log('');
  console.log('🌐 Ve a: https://supabase.com/dashboard');
  console.log('📁 Tu proyecto → SQL Editor');
  console.log('');
  console.log('📝 COPIA Y PEGA ESTE SCRIPT:');
  console.log('');
  console.log('─'.repeat(60));
  console.log(createAdminContent);
  console.log('─'.repeat(60));
  console.log('');
  console.log('▶️  Haz clic en "Run"');
  console.log('');
  console.log('✅ DESPUÉS:');
  console.log('   • Vuelve a intentar el login en la aplicación');
  console.log('   • Debería funcionar inmediatamente');
  console.log('');
  console.log('💡 Este script:');
  console.log('   • Verifica usuarios en auth.users');
  console.log('   • Verifica perfiles en user_profiles');
  console.log('   • Crea perfil admin para el primer usuario');
  console.log('   • Verifica que se creó correctamente');
  console.log('');
  console.log('🎯 SOLUCIÓN RÁPIDA - CREA EL PERFIL FALTANTE');
}

if (require.main === module) {
  showCreateAdminProfile();
}

module.exports = { showCreateAdminProfile }; 