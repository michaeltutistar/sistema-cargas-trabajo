import { db } from './mysql';
import bcrypt from 'bcrypt';

async function fixLogin() {
  try {
    console.log('🔐 Verificando credenciales de login...');

    // Verificar si existe el usuario admin
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', ['admin@admin.com']);
    const user = (users as any[])[0];

    if (!user) {
      console.log('❌ Usuario admin no encontrado, creando...');
      
      // Crear usuario admin con contraseña password123
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      await db.query(`
        INSERT INTO usuarios (id, email, password, nombre, apellido, rol, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, ['1', 'admin@admin.com', hashedPassword, 'Admin', 'Sistema', 'admin', 1]);
      
      console.log('✅ Usuario admin creado con contraseña: password123');
    } else {
      console.log('✅ Usuario admin encontrado');
      
      // Verificar si la contraseña actual es correcta
      const isPasswordValid = await bcrypt.compare('password123', user.password);
      
      if (!isPasswordValid) {
        console.log('⚠️ Contraseña incorrecta, actualizando...');
        
        // Actualizar contraseña
        const hashedPassword = await bcrypt.hash('password123', 12);
        
        await db.query(`
          UPDATE usuarios 
          SET password = ?, fecha_actualizacion = NOW()
          WHERE email = ?
        `, [hashedPassword, 'admin@admin.com']);
        
        console.log('✅ Contraseña actualizada a: password123');
      } else {
        console.log('✅ Contraseña correcta');
      }
    }

    // Verificar que el login funciona
    console.log('🧪 Probando login...');
    
    const [testUsers] = await db.query('SELECT * FROM usuarios WHERE email = ?', ['admin@admin.com']);
    const testUser = (testUsers as any[])[0];
    
    if (testUser) {
      const isValid = await bcrypt.compare('password123', testUser.password);
      console.log('🔍 Resultado de verificación:', isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO');
    }

    console.log('✅ Script de login completado');
    console.log('📋 Credenciales de acceso:');
    console.log('   Email: admin@admin.com');
    console.log('   Password: password123');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en fix login:', error);
    process.exit(1);
  }
}

fixLogin(); 