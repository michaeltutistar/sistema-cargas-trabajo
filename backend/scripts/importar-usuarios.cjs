'use strict';

const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const bcrypt = require('bcrypt');

// Cargar variables de entorno del backend
try {
  // .env ubicado en backend/.env
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {
  console.warn('No se pudo cargar dotenv, se asume entorno ya configurado');
}

// Reutilizar el pool compilado del backend
let db;
try {
  ({ db } = require('../dist/database/mysql.js'));
} catch (e) {
  console.error('❌ No se pudo cargar el pool de MySQL desde dist/database/mysql.js');
  console.error('Asegúrate de haber compilado el backend (tsc) antes de ejecutar el importador.');
  process.exit(1);
}

function esEmailValido(email) {
  return /.+@.+\..+/.test(email);
}

function partirNombreCompleto(nombreCompleto) {
  if (!nombreCompleto) {
    return { nombre: 'Usuario', apellido: 'Sistema' };
  }
  const tokens = String(nombreCompleto).trim().split(/\s+/);
  if (tokens.length === 1) {
    return { nombre: tokens[0], apellido: '—' };
  }
  // Heurística simple: primer token = nombre, resto = apellido
  const nombre = tokens.shift();
  const apellido = tokens.join(' ');
  return { nombre, apellido };
}

async function importarUsuariosDesdeExcel(rutaExcel, { rol = 'tiempos' } = {}) {
  if (!fs.existsSync(rutaExcel)) {
    throw new Error(`Archivo no encontrado: ${rutaExcel}`);
  }

  const wb = XLSX.readFile(rutaExcel);
  const hoja = wb.SheetNames[0];
  const ws = wb.Sheets[hoja];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  console.log(`📄 Hoja: ${hoja} | Filas leídas: ${rows.length}`);

  // Detectar header (si primera fila contiene texto no numérico en A o "correo" en C)
  let startIndex = 0;
  if (rows.length > 0) {
    const first = rows[0];
    const a = String(first[0] || '').toLowerCase();
    const c = String(first[2] || '').toLowerCase();
    if (a.includes('ced') || c.includes('correo') || c.includes('email')) {
      startIndex = 1;
    }
  }

  let creados = 0;
  let actualizados = 0;
  let omitidos = 0;
  const errores = [];

  for (let i = startIndex; i < rows.length; i++) {
    const fila = rows[i];
    const cedula = (fila[0] ?? '').toString().trim(); // Col A → password
    const nombreCompleto = (fila[1] ?? '').toString().trim(); // Col B
    const email = (fila[2] ?? '').toString().trim().toLowerCase(); // Col C

    if (!email || !esEmailValido(email)) {
      errores.push({ fila: i + 1, error: 'Email inválido', email });
      omitidos++;
      continue;
    }

    if (!cedula) {
      errores.push({ fila: i + 1, error: 'Cédula vacía', email });
      omitidos++;
      continue;
    }

    const { nombre, apellido } = partirNombreCompleto(nombreCompleto);

    try {
      // Verificar si existe usuario por email
      const [rowsExiste] = await db.query('SELECT id, rol FROM usuarios WHERE email = ? LIMIT 1', [email]);
      const existe = Array.isArray(rowsExiste) ? rowsExiste[0] : undefined;

      if (!existe) {
        // Crear nuevo
        const passwordHash = await bcrypt.hash(cedula, 10);
        const sqlInsert = `
          INSERT INTO usuarios (email, password, nombre, apellido, rol, activo, fecha_creacion, fecha_actualizacion)
          VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
        `;
        await db.query(sqlInsert, [email, passwordHash, nombre, apellido, rol]);
        creados++;
      } else {
        // Actualizar rol a tiempos si fuera diferente (no tocar password)
        if (existe.rol !== rol) {
          await db.query('UPDATE usuarios SET rol = ?, fecha_actualizacion = NOW() WHERE email = ?', [rol, email]);
          actualizados++;
        } else {
          omitidos++;
        }
      }
    } catch (err) {
      console.error(`❌ Error en fila ${i + 1}:`, err.message || err);
      errores.push({ fila: i + 1, error: err.message || String(err), email });
      omitidos++;
    }
  }

  return { creados, actualizados, omitidos, errores };
}

(async () => {
  try {
    const rutaExcel = process.argv[2];
    const rol = process.argv[3] || 'tiempos';
    if (!rutaExcel) {
      console.error('Uso: node scripts/importar-usuarios.cjs /ruta/usuarios.xlsx [rol]');
      process.exit(1);
    }

    console.log('🔧 Config DB:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });

    const res = await importarUsuariosDesdeExcel(rutaExcel, { rol });
    console.log('✅ Importación finalizada');
    console.log('   Creados:     ', res.creados);
    console.log('   Actualizados:', res.actualizados);
    console.log('   Omitidos:    ', res.omitidos);
    if (res.errores.length > 0) {
      console.log('   Errores:');
      res.errores.slice(0, 20).forEach(e => console.log('   -', e));
      if (res.errores.length > 20) console.log(`   (... ${res.errores.length - 20} más)`);
    }
  } catch (err) {
    console.error('❌ Error en importación:', err);
    process.exit(1);
  } finally {
    try { await db.end(); } catch (_) {}
  }
})(); 