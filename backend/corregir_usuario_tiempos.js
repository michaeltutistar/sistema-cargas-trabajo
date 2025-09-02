const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Configuración de la base de datos
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'cargas_trabajo'
};

async function corregirUsuarioTiempos() {
  console.log('🔧 CORRIGIENDO USUARIO DE TIEMPOS');
  console.log('==================================');

  let connection;
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida');

    // Verificar el usuario actual
    console.log('\n📋 Verificando usuario actual...');
    const [usuarioActual] = await connection.execute(
      'SELECT id, nombre, apellido, email, rol, activo FROM usuarios WHERE id = ?',
      ['user_1755225276718']
    );

    if (usuarioActual.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    const usuario = usuarioActual[0];
    console.log('👤 Usuario actual:');
    console.log(`   ID: ${usuario.id}`);
    console.log(`   Nombre: ${usuario.nombre} ${usuario.apellido}`);
    console.log(`   Email: ${usuario.email || 'NO ASIGNADO'}`);
    console.log(`   Rol: ${usuario.rol || 'NO ASIGNADO'}`);
    console.log(`   Activo: ${usuario.activo ? 'Sí' : 'No'}`);

    // Actualizar el usuario con los datos correctos
    console.log('\n📋 Actualizando usuario...');
    
    const email = 'tiempos@cargas-trabajo.gov.co';
    const password = 'tiempos2025';
    const rol = 'usuario';
    
    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await connection.execute(
      'UPDATE usuarios SET email = ?, password = ?, rol = ?, fecha_actualizacion = NOW() WHERE id = ?',
      [email, hashedPassword, rol, usuario.id]
    );

    console.log('✅ Usuario actualizado exitosamente');

    // Verificar la actualización
    console.log('\n📋 Verificando actualización...');
    const [usuarioActualizado] = await connection.execute(
      'SELECT id, nombre, apellido, email, rol, activo FROM usuarios WHERE id = ?',
      [usuario.id]
    );

    const usuarioFinal = usuarioActualizado[0];
    console.log('👤 Usuario actualizado:');
    console.log(`   ID: ${usuarioFinal.id}`);
    console.log(`   Nombre: ${usuarioFinal.nombre} ${usuarioFinal.apellido}`);
    console.log(`   Email: ${usuarioFinal.email}`);
    console.log(`   Rol: ${usuarioFinal.rol}`);
    console.log(`   Activo: ${usuarioFinal.activo ? 'Sí' : 'No'}`);

    console.log('\n🎯 USUARIO CORREGIDO EXITOSAMENTE');
    console.log('==================================');
    console.log('✅ Email asignado: tiempos@cargas-trabajo.gov.co');
    console.log('✅ Contraseña actualizada: tiempos2025');
    console.log('✅ Rol asignado: usuario');
    console.log('✅ Usuario listo para usar');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión a MySQL cerrada');
    }
  }
}

// Ejecutar la corrección
corregirUsuarioTiempos().catch(console.error); 