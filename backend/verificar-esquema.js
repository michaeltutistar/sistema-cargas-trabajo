const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database/cargas_trabajo.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 VERIFICANDO ESQUEMA DE LA BASE DE DATOS');
console.log('==========================================\n');

// Ver todas las tablas
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error obteniendo tablas:', err);
    return;
  }
  
  console.log('📋 Tablas encontradas:');
  tables.forEach(table => {
    console.log(`  - ${table.name}`);
  });
  console.log('');
  
  // Ver estructura de tiempos_procedimientos
  db.all("PRAGMA table_info(tiempos_procedimientos)", (err, columns) => {
    if (err) {
      console.error('Error obteniendo estructura:', err);
      return;
    }
    
    console.log('📊 Estructura de tiempos_procedimientos:');
    columns.forEach(col => {
      console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    console.log('');
    
    // Ver algunos datos de ejemplo
    db.all("SELECT * FROM tiempos_procedimientos LIMIT 3", (err, rows) => {
      if (err) {
        console.error('Error obteniendo datos:', err);
        return;
      }
      
      console.log('📄 Datos de ejemplo:');
      console.log(rows);
      
      db.close();
    });
  });
});
