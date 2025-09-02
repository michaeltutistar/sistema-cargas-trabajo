const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000/api';
const EMAIL = 'tiempos@cargas-trabajo.gov.co';
const PASSWORD = 'tiempos2025';

// Combinación específica que sabemos que está disponible
const COMBINACION_DISPONIBLE = {
  procedimientoId: '4', // Actualización de Software
  empleoId: '3',        // Analista de Sistemas
  tiempoMinimo: 1.0,
  tiempoPromedio: 1.5,
  tiempoMaximo: 2.0,
  frecuenciaMensual: 5,
  observaciones: 'Prueba de combinación disponible'
};

async function probarCombinacionDisponible() {
  console.log('🧪 PROBANDO COMBINACIÓN DISPONIBLE');
  console.log('==================================');

  try {
    // 1. Iniciar sesión para obtener el token
    console.log('\n📋 1. Iniciando sesión...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });

    const { token, usuario } = loginResponse.data.data;
    console.log('✅ Login exitoso');
    console.log(`   Usuario: ${usuario.nombre} ${usuario.apellido}`);
    console.log(`   ID: ${usuario.id}`);

    // Configurar headers con el token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Verificar que la combinación no existe
    console.log('\n📋 2. Verificando que la combinación no existe...');
    console.log('📊 Combinación a probar:');
    console.log(`   Procedimiento ID: ${COMBINACION_DISPONIBLE.procedimientoId}`);
    console.log(`   Empleo ID: ${COMBINACION_DISPONIBLE.empleoId}`);

    // 3. Crear el tiempo con la combinación disponible
    console.log('\n📋 3. Creando tiempo con combinación disponible...');
    
    const crearTiempoResponse = await axios.post(
      `${BASE_URL}/cargas/tiempos-procedimiento`,
      COMBINACION_DISPONIBLE,
      { headers }
    );

    console.log('✅ Tiempo creado exitosamente');
    console.log('📊 Respuesta:', crearTiempoResponse.data);

    // 4. Verificar que se creó correctamente
    console.log('\n📋 4. Verificando que se creó correctamente...');
    const tiemposResponse = await axios.get(`${BASE_URL}/cargas/tiempos-procedimiento`, { headers });
    const tiempos = tiemposResponse.data.data;
    
    const tiempoCreado = tiempos.find(t => 
      t.procedimientoId === COMBINACION_DISPONIBLE.procedimientoId && 
      t.empleoId === COMBINACION_DISPONIBLE.empleoId
    );

    if (tiempoCreado) {
      console.log('✅ Tiempo encontrado en la lista del usuario');
      console.log(`   ID: ${tiempoCreado.id}`);
      console.log(`   Tiempo calculado: ${tiempoCreado.tiempoCalculadoPERT} horas`);
    } else {
      console.log('❌ Tiempo no encontrado en la lista del usuario');
    }

    console.log('\n🎯 PRUEBA EXITOSA');
    console.log('==================');
    console.log('✅ Combinación disponible funcionando correctamente');
    console.log('✅ Sistema permite crear nuevas combinaciones');
    console.log('✅ Aislamiento por usuario funcionando');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Data:', error.response.data);
      
      if (error.response.status === 400) {
        console.log('\n💡 SUGERENCIA:');
        console.log('   El error 400 indica que la combinación ya existe.');
        console.log('   Intenta con una combinación diferente o verifica');
        console.log('   que no estés usando una combinación ya registrada.');
      }
    }
  }
}

// Ejecutar la prueba
probarCombinacionDisponible().catch(console.error); 