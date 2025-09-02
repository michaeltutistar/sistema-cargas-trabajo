import { db } from './mysql';

async function checkData() {
  try {
    console.log('🔍 Verificando datos en la base de datos...\n');

    // Verificar dependencias
    const [deps] = await db.query('SELECT * FROM dependencias');
    console.log('📋 Dependencias:', (deps as any[]).length);
    (deps as any[]).forEach(dep => {
      console.log(`   - ID: ${dep.id}, Nombre: ${dep.nombre}`);
    });

    // Verificar procesos
    const [procs] = await db.query('SELECT * FROM procesos');
    console.log('\n📋 Procesos:', (procs as any[]).length);
    (procs as any[]).forEach(proc => {
      console.log(`   - ID: ${proc.id}, Nombre: ${proc.nombre}, Dependencia: ${proc.dependencia_id}`);
    });

    // Verificar actividades
    const [acts] = await db.query('SELECT * FROM actividades');
    console.log('\n📋 Actividades:', (acts as any[]).length);
    (acts as any[]).forEach(act => {
      console.log(`   - ID: ${act.id}, Nombre: ${act.nombre}, Proceso: ${act.proceso_id}`);
    });

    // Verificar procedimientos
    const [procedimientos] = await db.query('SELECT * FROM procedimientos');
    console.log('\n📋 Procedimientos:', (procedimientos as any[]).length);
    (procedimientos as any[]).forEach(proc => {
      console.log(`   - ID: ${proc.id}, Nombre: ${proc.nombre}, Actividad: ${proc.actividad_id}`);
    });

    // Verificar empleos
    const [empleos] = await db.query('SELECT * FROM empleos');
    console.log('\n📋 Empleos:', (empleos as any[]).length);
    (empleos as any[]).forEach(emp => {
      console.log(`   - ID: ${emp.id}, Nombre: ${emp.nombre}, Nivel: ${emp.nivel_jerarquico}`);
    });

    // Verificar usuarios
    const [usuarios] = await db.query('SELECT id, email, nombre, rol FROM usuarios');
    console.log('\n📋 Usuarios:', (usuarios as any[]).length);
    (usuarios as any[]).forEach(user => {
      console.log(`   - ID: ${user.id}, Email: ${user.email}, Nombre: ${user.nombre}, Rol: ${user.rol}`);
    });

    console.log('\n✅ Verificación completada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error verificando datos:', error);
    process.exit(1);
  }
}

checkData(); 