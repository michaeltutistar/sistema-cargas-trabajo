const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cargas_trabajo',
  port: 3306
};

// Lista de empleos DIRECTIVOS
const empleosDirectivos = [
  { codigo: '005', denominacion: 'Alcalde' },
  { codigo: '030', denominacion: 'Alcalde Local' },
  { codigo: '032', denominacion: 'Consejero de Justicia' },
  { codigo: '036', denominacion: 'Auditor Fiscal de Contraloría' },
  { codigo: '010', denominacion: 'Contralor' },
  { codigo: '035', denominacion: 'Contralor Auxiliar' },
  { codigo: '003', denominacion: 'Decano de Escuela o Institución Tecnológica' },
  { codigo: '007', denominacion: 'Decano de Institución Universitaria' },
  { codigo: '008', denominacion: 'Decano de Universidad' },
  { codigo: '009', denominacion: 'Director Administrativo o Financiero o Técnico u Operativo' },
  { codigo: '060', denominacion: 'Director de Area Metropolitana' },
  { codigo: '055', denominacion: 'Director de Departamento Administrativo' },
  { codigo: '028', denominacion: 'Director de Escuela o de Instituto o de Centro de Universidad' },
  { codigo: '065', denominacion: 'Director de Hospital' },
  { codigo: '016', denominacion: 'Director Ejecutivo de Asociación de Municipios' },
  { codigo: '050', denominacion: 'Director o Gerente General de Entidad Descentralizada' },
  { codigo: '080', denominacion: 'Director Local de Salud' },
  { codigo: '024', denominacion: 'Director o Gerente Regional o Provincial' },
  { codigo: '039', denominacion: 'Gerente' },
  { codigo: '085', denominacion: 'Gerente Empresa Social del Estado' },
  { codigo: '001', denominacion: 'Gobernador' },
  { codigo: '027', denominacion: 'Jefe de Departamento de Universidad' },
  { codigo: '006', denominacion: 'Jefe de Oficina' },
  { codigo: '015', denominacion: 'Personero' },
  { codigo: '017', denominacion: 'Personero Auxiliar' },
  { codigo: '040', denominacion: 'Personero Delegado' },
  { codigo: '043', denominacion: 'Personero Local de Bogotá' },
  { codigo: '071', denominacion: 'Presidente Consejo de Justicia' },
  { codigo: '042', denominacion: 'Rector de Institución Técnica Profesional' },
  { codigo: '048', denominacion: 'Rector de Institución Universitaria o de Escuela o de Institución Tecnológica' },
  { codigo: '067', denominacion: 'Rector de Universidad' },
  { codigo: '020', denominacion: 'Secretario de Despacho' },
  { codigo: '054', denominacion: 'Secretario General de Entidad Descentralizada' },
  { codigo: '058', denominacion: 'Secretario General de Institución Técnica Profesional' },
  { codigo: '064', denominacion: 'Secretario General de Institución Universitaria' },
  { codigo: '052', denominacion: 'Secretario General de Universidad' },
  { codigo: '066', denominacion: 'Secretario General de Escuela o de Institución Tecnológica' },
  { codigo: '073', denominacion: 'Secretario General de Organismo de Control' },
  { codigo: '097', denominacion: 'Secretario Seccional o Local de Salud' },
  { codigo: '025', denominacion: 'Subcontralor' },
  { codigo: '070', denominacion: 'Subdirector' },
  { codigo: '068', denominacion: 'Subdirector Administrativo o Financiero o Técnico u Operativo' },
  { codigo: '072', denominacion: 'Subdirector Científico' },
  { codigo: '074', denominacion: 'Subdirector de Área Metropolitana' },
  { codigo: '076', denominacion: 'Subdirector de Departamento Administrativo' },
  { codigo: '078', denominacion: 'Subdirector Ejecutivo de Asociación de Municipios' },
  { codigo: '084', denominacion: 'Subdirector o Subgerente General de Entidad Descentralizada' },
  { codigo: '090', denominacion: 'Subgerente' },
  { codigo: '045', denominacion: 'Subsecretario de Despacho' },
  { codigo: '091', denominacion: 'Tesorero Distrital' },
  { codigo: '094', denominacion: 'Veedor Distrital' },
  { codigo: '095', denominacion: 'Viceveedor Distrital' },
  { codigo: '099', denominacion: 'Veedor Distrital Delegado' },
  { codigo: '096', denominacion: 'Vicerrector de Institución Técnica Profesional' },
  { codigo: '098', denominacion: 'Vicerrector de Institución Universitaria' },
  { codigo: '057', denominacion: 'Vicerrector de Escuela Tecnológica o de Institución Tecnológica' },
  { codigo: '077', denominacion: 'Vicerrector de Universidad' }
];

async function cargarEmpleosDirectivosDirecto() {
  let connection;
  
  try {
    console.log('🔌 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión establecida exitosamente');

    // Verificar empleos DIRECTIVOS existentes
    console.log('\n📊 Verificando empleos DIRECTIVOS existentes...');
    const [empleosExistentes] = await connection.execute(`
      SELECT COUNT(*) as total FROM empleos WHERE nivel_jerarquico = 'DIRECTIVO'
    `);
    
    console.log(`📈 Empleos DIRECTIVOS existentes: ${empleosExistentes[0].total}`);

    // Limpiar empleos DIRECTIVOS existentes
    if (empleosExistentes[0].total > 0) {
      console.log('🧹 Limpiando empleos DIRECTIVOS existentes...');
      const [deleteResult] = await connection.execute(`
        DELETE FROM empleos WHERE nivel_jerarquico = 'DIRECTIVO'
      `);
      console.log(`✅ Eliminados ${deleteResult.affectedRows} empleos DIRECTIVOS existentes`);
    }

    // Insertar empleos DIRECTIVOS
    console.log(`\n📋 Insertando ${empleosDirectivos.length} empleos DIRECTIVOS...`);
    
    let totalInsertados = 0;
    for (let i = 0; i < empleosDirectivos.length; i++) {
      const empleo = empleosDirectivos[i];
      
      try {
        const [result] = await connection.execute(`
          INSERT INTO empleos (codigo, denominacion, nivel_jerarquico, activo, fecha_creacion, fecha_actualizacion) 
          VALUES (?, ?, 'DIRECTIVO', 1, NOW(), NOW())
        `, [empleo.codigo, empleo.denominacion]);
        
        totalInsertados++;
        console.log(`✅ ${i + 1}/${empleosDirectivos.length}: ${empleo.codigo} - ${empleo.denominacion}`);
      } catch (error) {
        console.error(`❌ Error insertando ${empleo.codigo}:`, error.message);
      }
    }

    console.log(`\n🎉 Carga completada. Total de empleos DIRECTIVOS insertados: ${totalInsertados}`);
    
    // Verificar el resultado final
    console.log('\n📊 Verificando resultados finales...');
    const [verificationResults] = await connection.execute(`
      SELECT 
        COUNT(*) as total_empleos,
        nivel_jerarquico
      FROM empleos 
      WHERE nivel_jerarquico = 'DIRECTIVO'
      GROUP BY nivel_jerarquico
    `);
    
    console.log('📈 Resultados de la verificación:', verificationResults);

    // Mostrar algunos empleos insertados
    console.log('\n📋 Primeros 10 empleos DIRECTIVOS cargados:');
    const [empleosCargados] = await connection.execute(`
      SELECT 
        codigo,
        denominacion,
        nivel_jerarquico,
        activo
      FROM empleos 
      WHERE nivel_jerarquico = 'DIRECTIVO'
      ORDER BY codigo
      LIMIT 10
    `);
    
    empleosCargados.forEach((empleo, index) => {
      console.log(`${index + 1}. ${empleo.codigo} - ${empleo.denominacion}`);
    });

  } catch (error) {
    console.error('❌ Error durante la ejecución:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar el script
console.log('🚀 Iniciando carga directa de empleos DIRECTIVOS...');
cargarEmpleosDirectivosDirecto()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }); 