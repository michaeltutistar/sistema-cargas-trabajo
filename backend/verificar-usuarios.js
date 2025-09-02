const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Verificar usuarios en la base de datos
async function verificarUsuarios() {
  console.log('👥 VERIFICANDO USUARIOS EN LA BASE DE DATOS');
  console.log('============================================\n');
  
  const dbPath = path.join(__dirname, 'database/cargas_trabajo.db');
  const db = new sqlite3.Database(dbPath);
  
  try {
    // Obtener todos los usuarios
    const usuarios = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM usuarios', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`📊 Total de usuarios en BD: ${usuarios.length}\n`);
    
    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. 👤 Usuario: ${usuario.nombre}`);
      console.log(`   📧 Email: ${usuario.email}`);
      console.log(`   🔐 Rol: ${usuario.rol}`);
      console.log(`   ✅ Activo: ${usuario.activo ? 'Sí' : 'No'}`);
      console.log(`   📅 Creado: ${usuario.fecha_creacion}`);
      console.log('');
    });
    
    // Crear usuario de prueba con credenciales conocidas
    console.log('🔧 CREANDO USUARIO DE PRUEBA ADICIONAL...');
    
    const emailPrueba = 'admin@admin.com';
    const passwordPrueba = 'password123';
    const hashPassword = await bcrypt.hash(passwordPrueba, 10);
    
    // Verificar si ya existe
    const usuarioExistente = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM usuarios WHERE email = ?', [emailPrueba], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!usuarioExistente) {
      const nuevoId = 'user_' + Date.now();
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO usuarios (id, nombre, email, password, rol, activo, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [nuevoId, 'Admin Prueba', emailPrueba, hashPassword, 'admin', 1, new Date().toISOString()],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });
      
      console.log('✅ Usuario de prueba creado:');
      console.log(`   📧 Email: ${emailPrueba}`);
      console.log(`   🔑 Password: ${passwordPrueba}`);
    } else {
      console.log('ℹ️ Usuario de prueba ya existe:');
      console.log(`   📧 Email: ${emailPrueba}`);
      console.log(`   🔑 Password: ${passwordPrueba} (intentar con esta)`);
    }
    
    // Probar hash de password
    console.log('\n🧪 PROBANDO HASH DE PASSWORDS...');
    for (const usuario of usuarios) {
      console.log(`\n👤 ${usuario.email}:`);
      
      // Probar passwords comunes
      const passwordsComunes = ['admin123', 'password123', '123456', 'admin'];
      
      for (const pass of passwordsComunes) {
        try {
          const coincide = await bcrypt.compare(pass, usuario.password);
          if (coincide) {
            console.log(`   ✅ Password encontrado: "${pass}"`);
            break;
          }
        } catch (error) {
          // Password no válido o error en hash
        }
      }
    }
    
    console.log('\n🎯 CREDENCIALES PARA PRUEBAS:');
    console.log('=============================');
    console.log('👤 Usuario Admin Prueba:');
    console.log(`   📧 Email: ${emailPrueba}`);
    console.log(`   🔑 Password: ${passwordPrueba}`);
    console.log('\n👤 Usuario Admin Original:');
    console.log('   📧 Email: admin@cargas.gov.co');
    console.log('   🔑 Password: admin123 (verificar)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

verificarUsuarios();
