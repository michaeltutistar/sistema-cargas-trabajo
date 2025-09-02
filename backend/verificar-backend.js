const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Verificación rápida del backend y base de datos
async function verificarBackend() {
  console.log('🔍 VERIFICACIÓN COMPLETA DEL BACKEND');
  console.log('====================================\n');
  
  try {
    // 1. Verificar base de datos
    const dbPath = path.join(__dirname, 'database/cargas_trabajo.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log('📊 Verificando datos en la base de datos...');
    
    // Contar registros en cada tabla
    const stats = {};
    const tablas = ['usuarios', 'empleos', 'dependencias', 'procesos', 'actividades', 'procedimientos', 'tiempos_procedimientos'];
    
    for (const tabla of tablas) {
      stats[tabla] = await new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) as count FROM ${tabla}`, (err, row) => {
          if (err) resolve(0);
          else resolve(row.count);
        });
      });
    }
    
    // Verificar algunos procedimientos específicos
    const procedimientosEjemplo = await new Promise((resolve, reject) => {
      db.all(`SELECT nombre FROM procedimientos LIMIT 5`, (err, rows) => {
        if (err) resolve([]);
        else resolve(rows);
      });
    });
    
    db.close();
    
    console.log('✅ ESTADÍSTICAS DE LA BASE DE DATOS:');
    console.log(`   👥 Usuarios: ${stats.usuarios}`);
    console.log(`   🏢 Dependencias: ${stats.dependencias}`);
    console.log(`   💼 Empleos: ${stats.empleos}`);
    console.log(`   ⚙️ Procesos: ${stats.procesos}`);
    console.log(`   📋 Actividades: ${stats.actividades}`);
    console.log(`   📄 Procedimientos: ${stats.procedimientos}`);
    console.log(`   ⏱️ Tiempos PERT: ${stats.tiempos_procedimientos}`);
    
    console.log('\n📋 EJEMPLOS DE PROCEDIMIENTOS MIGRADOS:');
    procedimientosEjemplo.forEach((proc, i) => {
      console.log(`   ${i+1}. ${proc.nombre.substring(0, 60)}...`);
    });
    
    // 2. Verificar conectividad del backend
    console.log('\n🌐 Verificando conectividad del backend...');
    const http = require('http');
    
    const verificarEndpoint = (endpoint) => {
      return new Promise((resolve) => {
        const req = http.get(`http://localhost:3001${endpoint}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              resolve({ endpoint, status: 'OK', data: json });
            } catch (e) {
              resolve({ endpoint, status: 'ERROR', error: 'Invalid JSON' });
            }
          });
        });
        req.on('error', () => {
          resolve({ endpoint, status: 'ERROR', error: 'Connection failed' });
        });
        req.setTimeout(3000, () => {
          resolve({ endpoint, status: 'ERROR', error: 'Timeout' });
        });
      });
    };
    
    const endpoints = ['/api/health', '/api/info'];
    const resultados = [];
    
    for (const endpoint of endpoints) {
      const resultado = await verificarEndpoint(endpoint);
      resultados.push(resultado);
    }
    
    console.log('✅ ESTADO DE ENDPOINTS:');
    resultados.forEach(res => {
      const status = res.status === 'OK' ? '✅' : '❌';
      console.log(`   ${status} ${res.endpoint}: ${res.status}`);
      if (res.status === 'OK' && res.data.message) {
        console.log(`      📝 ${res.data.message}`);
      }
    });
    
    // 3. Resumen final
    const todosFuncionando = resultados.every(r => r.status === 'OK');
    const tieneDocenavigados = stats.procedimientos >= 50; // Al menos 50 procedimientos
    
    console.log('\n🏆 RESUMEN FINAL:');
    console.log('================');
    console.log(`Backend funcionando: ${todosFuncionando ? '✅ SÍ' : '❌ NO'}`);
    console.log(`Datos migrados: ${tieneDocenavigados ? '✅ SÍ' : '❌ NO'} (${stats.procedimientos} procedimientos)`);
    console.log(`Base de datos: ${stats.procedimientos > 0 ? '✅ POBLADA' : '❌ VACÍA'}`);
    
    if (todosFuncionando && tieneDocenavigados) {
      console.log('\n🎉 ¡BACKEND COMPLETAMENTE VERIFICADO Y FUNCIONAL!');
      console.log('   - API REST funcionando correctamente');
      console.log('   - Base de datos poblada con datos reales del Excel');
      console.log('   - Sistema listo para pruebas de frontend');
    } else {
      console.log('\n⚠️ PROBLEMAS DETECTADOS - Revisar configuración');
    }
    
  } catch (error) {
    console.error('❌ Error en verificación:', error);
  }
}

verificarBackend();
