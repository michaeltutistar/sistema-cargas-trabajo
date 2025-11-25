const bcrypt = require('bcryptjs');

async function generarHash() {
  const password = '123456789';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // Generar UUID para el ID
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  
  console.log('\n--- SQL INSERT ---');
  console.log(`INSERT INTO usuarios (id, email, password, nombre, apellido, rol, activo, fecha_creacion, fecha_actualizacion) VALUES`);
  console.log(`('${id}', 'pruebas@tac.com', '${hash}', 'Usuario', 'pruebas', 'tiempos', 1, NOW(), NOW());`);
}

generarHash().catch(console.error);

