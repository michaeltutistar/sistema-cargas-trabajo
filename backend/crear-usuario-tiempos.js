const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Configuración de la base de datos MySQL
const dbConfig = {
  host: '127.0.0.1',
  user: 'root', // Cambiar por tu usuario de MySQL
  password: '', // Cambiar por tu contraseña de MySQL
  database: 'cargas_trabajo'
};

// Crear usuario específico para ingreso de tiempos
async function crearUsuarioTiempos() {
  console.log('👤 CREANDO USUARIO PARA INGRESO DE TIEMPOS');
  console.log('==========================================\n');
  
  let connection;
  
  try {
    // Conectar a MySQL
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida\n');
    
    // Datos del nuevo usuario
    const emailUsuario = 'tiempos@cargas-trabajo.gov.co';
    const passwordUsuario = 'tiempos2025';
    const nombreUsuario = 'Carlos';
    const apellidoUsuario = 'Martínez';
    const rolUsuario = 'usuario'; // Rol que permite crear y modificar datos
    
    // Verificar si ya existe
    const [usuariosExistentes] = await connection.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [emailUsuario]
    );
    
    if (usuariosExistentes.length > 0) {
      console.log('ℹ️ Usuario ya existe:');
      console.log(`   📧 Email: ${emailUsuario}`);
      console.log(`   🔑 Password: ${passwordUsuario}`);
      console.log(`   👤 Nombre: ${nombreUsuario} ${apellidoUsuario}`);
      console.log(`   🔐 Rol: ${rolUsuario}`);
      console.log('\n💡 Este usuario tiene acceso a:');
      console.log('   ✅ Ingreso de Tiempos (crear y modificar)');
      console.log('   ✅ Ver procedimientos');
      console.log('   ✅ Ver reportes');
    
      console.log('   ❌ Gestión de usuarios (solo admin)');
      return;
    }
    
    // Crear hash de la contraseña
    const hashPassword = await bcrypt.hash(passwordUsuario, 10);
    
    // Generar ID único
    const nuevoId = 'user_' + Date.now();
    
    // Insertar nuevo usuario
    const [result] = await connection.execute(
      'INSERT INTO usuarios (id, nombre, apellido, email, password, rol, activo, fecha_creacion, fecha_actualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [
        nuevoId, 
        nombreUsuario, 
        apellidoUsuario, 
        emailUsuario, 
        hashPassword, 
        rolUsuario, 
        1
      ]
    );
    
    console.log('✅ Usuario creado exitosamente:');
    console.log(`   📧 Email: ${emailUsuario}`);
    console.log(`   🔑 Password: ${passwordUsuario}`);
    console.log(`   👤 Nombre: ${nombreUsuario} ${apellidoUsuario}`);
    console.log(`   🔐 Rol: ${rolUsuario}`);
    console.log(`   🆔 ID: ${nuevoId}`);
    console.log(`   📊 ID MySQL: ${result.insertId}`);
    
    console.log('\n🎯 PERMISOS DEL USUARIO:');
    console.log('========================');
    console.log('✅ ACCESO PERMITIDO:');
    console.log('   • Ingreso de Tiempos (crear, editar, eliminar)');
    console.log('   • Ver procedimientos (solo lectura)');
    console.log('   • Ver reportes (solo lectura)');
    console.log('   • Dashboard principal');
    console.log('');
    console.log('❌ ACCESO RESTRINGIDO:');

    console.log('   • Gestión de usuarios (solo admin)');
    console.log('   • Configuración del sistema (solo admin)');
    
    console.log('\n🔐 CREDENCIALES DE ACCESO:');
    console.log('==========================');
    console.log(`📧 Email: ${emailUsuario}`);
    console.log(`🔑 Contraseña: ${passwordUsuario}`);
    console.log('\n💡 URL de acceso: https://61x89txxj6.space.minimax.io');
    
    // Verificar que el usuario se creó correctamente
    const [usuariosCreados] = await connection.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [emailUsuario]
    );
    
    if (usuariosCreados.length > 0) {
      const usuarioCreado = usuariosCreados[0];
      console.log('\n✅ Verificación exitosa:');
      console.log(`   Usuario encontrado en BD: ${usuarioCreado.nombre} ${usuarioCreado.apellido}`);
      console.log(`   Estado: ${usuarioCreado.activo ? 'Activo' : 'Inactivo'}`);
      console.log(`   Fecha creación: ${usuarioCreado.fecha_creacion}`);
    }
    
    // Mostrar todos los usuarios para verificar
    console.log('\n📊 USUARIOS EN LA BASE DE DATOS:');
    console.log('==================================');
    const [todosUsuarios] = await connection.execute('SELECT id, nombre, apellido, email, rol, activo FROM usuarios ORDER BY fecha_creacion');
    
    todosUsuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. 👤 ${usuario.nombre} ${usuario.apellido}`);
      console.log(`   📧 ${usuario.email}`);
      console.log(`   🔐 ${usuario.rol} ${usuario.activo ? '(Activo)' : '(Inactivo)'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solución: Verifica las credenciales de MySQL en el script');
      console.log('   - Usuario: root (o tu usuario de MySQL)');
      console.log('   - Contraseña: (tu contraseña de MySQL)');
      console.log('   - Base de datos: cargas_trabajo');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión a MySQL cerrada');
    }
  }
}

// Ejecutar la función
crearUsuarioTiempos(); 