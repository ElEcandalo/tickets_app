#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function cleanupProject() {
  console.log('🧹 LIMPIEZA DEL PROYECTO - ELIMINANDO ARCHIVOS DEPRECADOS');
  console.log('='.repeat(70));
  console.log('');

  // Lista de archivos deprecados a eliminar
  const deprecatedFiles = [
    // Archivos SQL deprecados en la raíz
    'create-user-profile-function.sql',
    'fix-rls-policies.sql',
    'clean-migration-fixed.sql',
    'clean-migration.sql',
    'migration-fix.sql',
    'migration-script.sql',
    'migration-schema.sql',
    'database-schema.sql',

    // Scripts deprecados
    'scripts/nuclear-fix.js',
    'scripts/nuclear-clean.sql',
    'scripts/clean-fix.js',
    'scripts/clean-and-fix.sql',
    'scripts/final-fix.js',
    'scripts/fix-with-policy-handling.sql',
    'scripts/quick-fix.js',
    'scripts/emergency-fix-foreign-key.sql',
    'scripts/fix-registration-complete.js',
    'scripts/fix-foreign-key-constraint.sql',
    'scripts/check-table-structure.sql',
    'scripts/verify-rpc-function.sql',
    'scripts/fix-registration.js',
    'scripts/fix-rls.js',
    'scripts/set-admin-role.js',
    'scripts/create-admin.js',
    'scripts/execute-migration-simple.js',
    'scripts/execute-migration-supabase.js',
    'scripts/execute-migration.js',
    'scripts/test-prisma.js',
    'scripts/setup-prisma.js',

    // Migraciones deprecadas
    'migrations/create_tables_manual.sql',
    'migrations/add_obra_id_to_funciones.sql',
    'migrations/create_obras_table.sql',

    // Esquemas Prisma deprecados
    'prisma/schema-full.prisma',
    'prisma/schema-simple.prisma',
  ];

  // Archivos a mantener (solo para referencia)
  const keepFiles = [
    'scripts/start-fresh.js',
    'scripts/start-fresh.sql',
    'scripts/cleanup-project.js',
    'prisma/schema.prisma',
  ];

  console.log('📋 ARCHIVOS A ELIMINAR:');
  deprecatedFiles.forEach(file => {
    console.log(`   ❌ ${file}`);
  });

  console.log('');
  console.log('📋 ARCHIVOS A MANTENER:');
  keepFiles.forEach(file => {
    console.log(`   ✅ ${file}`);
  });

  console.log('');
  console.log('🚨 ¿Estás seguro de que quieres eliminar estos archivos?');
  console.log('   Esto no se puede deshacer.');
  console.log('');
  console.log('💡 Para ejecutar la limpieza:');
  console.log('   node scripts/cleanup-project.js --execute');
  console.log('');
  console.log('📝 O ejecuta manualmente estos comandos:');
  console.log('');

  deprecatedFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      console.log(`   rm "${file}"`);
    }
  });

  // Si se pasa --execute, eliminar los archivos
  if (process.argv.includes('--execute')) {
    console.log('');
    console.log('🧹 EJECUTANDO LIMPIEZA...');
    
    let deletedCount = 0;
    let errorCount = 0;

    deprecatedFiles.forEach(file => {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`   ✅ Eliminado: ${file}`);
          deletedCount++;
        } catch (error) {
          console.log(`   ❌ Error eliminando ${file}: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`   ⚠️  No existe: ${file}`);
      }
    });

    console.log('');
    console.log('📊 RESUMEN:');
    console.log(`   ✅ Archivos eliminados: ${deletedCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log('');
    console.log('🎉 Limpieza completada');
  }
}

if (require.main === module) {
  cleanupProject();
}

module.exports = { cleanupProject }; 