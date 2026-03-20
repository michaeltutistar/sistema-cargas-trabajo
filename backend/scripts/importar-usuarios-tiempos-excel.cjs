/* eslint-disable no-console */
'use strict';

const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {
  console.warn('No se pudo cargar dotenv; se usaran variables de entorno actuales.');
}

function partirNombreCompleto(nombreCompleto) {
  const limpio = String(nombreCompleto || '').trim().replace(/\s+/g, ' ');
  const tokens = limpio.split(' ').filter(Boolean);

  if (tokens.length === 0) return { nombre: 'Usuario', apellido: 'Sin Apellido' };
  if (tokens.length === 1) return { nombre: tokens[0], apellido: 'Sin Apellido' };
  if (tokens.length === 2) return { nombre: tokens[0], apellido: tokens[1] };

  return {
    nombre: `${tokens[0]} ${tokens[1]}`,
    apellido: tokens.slice(2).join(' ')
  };
}

function normalizarEmail(valor) {
  return String(valor || '').trim().toLowerCase();
}

function normalizarCedula(valor) {
  const raw = String(valor ?? '').trim();
  return raw.replace(/[^\d]/g, '');
}

function validarFila(fila, index) {
  const nombreCompleto = fila['NOMBRES Y APELLIDOS'];
  const email = normalizarEmail(fila['CORREO ELECTRONICO']);
  const cedula = normalizarCedula(fila['CEDULA']);

  if (!nombreCompleto || !email || !cedula) {
    return { ok: false, error: `Fila ${index}: datos incompletos` };
  }

  if (!/.+@.+\..+/.test(email)) {
    return { ok: false, error: `Fila ${index}: email invalido (${email})` };
  }

  if (cedula.length < 5) {
    return { ok: false, error: `Fila ${index}: cedula invalida (${cedula})` };
  }

  const { nombre, apellido } = partirNombreCompleto(nombreCompleto);
  return { ok: true, data: { nombre, apellido, email, cedula } };
}

async function main() {
  const excelPathArg = process.argv[2];
  const dryRun = process.argv.includes('--dry-run');
  const excelPath = excelPathArg
    ? path.resolve(excelPathArg)
    : path.resolve(__dirname, '..', '..', 'DATOS PARA USUARIOS.xlsx');

  if (!fs.existsSync(excelPath)) {
    throw new Error(`Archivo no encontrado: ${excelPath}`);
  }

  const wb = XLSX.readFile(excelPath);
  const hoja = wb.SheetNames[0];
  const ws = wb.Sheets[hoja];
  const filas = XLSX.utils.sheet_to_json(ws, { defval: '' });

  console.log(`Archivo: ${excelPath}`);
  console.log(`Hoja: ${hoja}`);
  console.log(`Filas leidas: ${filas.length}`);

  const usuarios = [];
  const erroresValidacion = [];

  filas.forEach((fila, idx) => {
    const v = validarFila(fila, idx + 2);
    if (!v.ok) {
      erroresValidacion.push(v.error);
      return;
    }
    usuarios.push(v.data);
  });

  if (erroresValidacion.length > 0) {
    console.log('Errores de validacion:');
    erroresValidacion.slice(0, 20).forEach((e) => console.log(` - ${e}`));
    if (erroresValidacion.length > 20) {
      console.log(` - ... y ${erroresValidacion.length - 20} mas`);
    }
  }

  console.log(`Usuarios validos: ${usuarios.length}`);
  if (dryRun) {
    console.log('Dry run activado. No se hicieron cambios en BD.');
    return;
  }

  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS || process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
  };

  if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    throw new Error('Faltan variables de entorno DB_HOST/DB_USER/DB_NAME');
  }

  const conn = await mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10
  });

  let creados = 0;
  let actualizados = 0;
  let errores = 0;

  for (const u of usuarios) {
    try {
      const [existeRows] = await conn.query(
        'SELECT id FROM usuarios WHERE email = ? LIMIT 1',
        [u.email]
      );
      const existe = Array.isArray(existeRows) && existeRows.length > 0;
      const hash = await bcrypt.hash(u.cedula, 10);

      if (existe) {
        await conn.query(
          `UPDATE usuarios
           SET password = ?, nombre = ?, apellido = ?, rol = 'tiempos', activo = 1, fecha_actualizacion = NOW()
           WHERE email = ?`,
          [hash, u.nombre, u.apellido, u.email]
        );
        actualizados++;
      } else {
        await conn.query(
          `INSERT INTO usuarios (id, email, password, nombre, apellido, rol, activo, fecha_creacion, fecha_actualizacion)
           VALUES (?, ?, ?, ?, ?, 'tiempos', 1, NOW(), NOW())`,
          [uuidv4(), u.email, hash, u.nombre, u.apellido]
        );
        creados++;
      }
    } catch (e) {
      errores++;
      console.error(`❌ ${u.email}:`, e.message || e);
    }
  }

  await conn.end();
  console.log('Resultado final:');
  console.log({ totalExcel: filas.length, validos: usuarios.length, creados, actualizados, errores });
}

main().catch((e) => {
  console.error('❌ Error:', e.message || e);
  process.exit(1);
});

