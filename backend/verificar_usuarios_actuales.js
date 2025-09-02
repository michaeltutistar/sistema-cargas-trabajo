const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'cargas_trabajo'
};

async function verificarUsuariosActuales() {
  console.log('🔍 VERIFICANDO USUARIOS ACTUALES');
  console.log('================================');

  let connection;
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida');

    // Obtener todos los usuarios
    console.log('\n📋 Usuarios en la base de datos:');
    const [usuarios] = await connection.execute(
      'SELECT id, nombre, apellido, email, rol, activo, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC'
    );

    if (usuarios.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }

    usuarios.forEach((usuario, index) => {
      console.log(`\n👤 Usuario ${index + 1}:`);
      console.log(`   ID: ${usuario.id}`);
      console.log(`   Nombre: ${usuario.nombre} ${usuario.apellido}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Rol: ${usuario.rol}`);
      console.log(`   Activo: ${usuario.activo ? 'Sí' : 'No'}`);
      console.log(`   Fecha creación: ${usuario.fecha_creacion}`);
    });

    // Verificar el usuario de tiempos específicamente
    console.log('\n📋 Verificando usuario de tiempos...');
    const [usuarioTiempos] = await connection.execute(
      'SELECT id, nombre, apellido, email, rol, activo FROM usuarios WHERE email = ?',
      ['tiempos@cargas-trabajo.gov.co']
    );

    if (usuarioTiempos.length > 0) {
      const usuario = usuarioTiempos[0];
      console.log('✅ Usuario de tiempos encontrado:');
      console.log(`   ID: ${usuario.id}`);
      console.log(`   Nombre: ${usuario.nombre} ${usuario.apellido}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Rol: ${usuario.rol}`);
      console.log(`   Activo: ${usuario.activo ? 'Sí' : 'No'}`);
    } else {
      console.log('❌ Usuario de tiempos no encontrado');
    }

    // Verificar tiempos existentes por usuario
    console.log('\n📋 Tiempos registrados por usuario:');
    const [tiemposPorUsuario] = await connection.execute(`
      SELECT 
        u.email,
        u.nombre,
        u.apellido,
        COUNT(t.id) as total_tiempos
      FROM usuarios u
      LEFT JOIN tiempos_procedimientos t ON u.id = t.usuario_id
      GROUP BY u.id, u.email, u.nombre, u.apellido
      ORDER BY total_tiempos DESC
    `);

    tiemposPorUsuario.forEach(row => {
      console.log(`   ${row.nombre} ${row.apellido} (${row.email}): ${row.total_tiempos} tiempos`);
    });

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión a MySQL cerrada');
    }
  }
}

// Ejecutar la verificación
verificarUsuariosActuales().catch(console.error); 