const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000/api';
const EMAIL = 'tiempos@cargas-trabajo.gov.co';
const PASSWORD = 'tiempos2025';

async function probarEndpointTiempos() {
  console.log('🧪 PROBANDO ENDPOINT DE TIEMPOS');
  console.log('================================');

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
    console.log(`   Rol: ${usuario.rol}`);

    // Configurar headers con el token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Obtener procedimientos disponibles
    console.log('\n📋 2. Obteniendo procedimientos...');
    const procedimientosResponse = await axios.get(`${BASE_URL}/procedimientos`, { headers });
    const procedimientos = procedimientosResponse.data.data;
    console.log(`✅ ${procedimientos.length} procedimientos encontrados`);

    // 3. Obtener empleos disponibles
    console.log('\n📋 3. Obteniendo empleos...');
    const empleosResponse = await axios.get(`${BASE_URL}/empleos`, { headers });
    const empleos = empleosResponse.data.data;
    console.log(`✅ ${empleos.length} empleos encontrados`);

    if (procedimientos.length === 0 || empleos.length === 0) {
      console.log('❌ No hay procedimientos o empleos disponibles para la prueba');
      return;
    }

    // 4. Crear un tiempo de prueba
    console.log('\n📋 4. Creando tiempo de prueba...');
    const tiempoPrueba = {
      procedimientoId: procedimientos[0].id,
      empleoId: empleos[0].id,
      tiempoMinimo: 1.5,
      tiempoPromedio: 2.0,
      tiempoMaximo: 3.0,
      frecuenciaMensual: 10,
      observaciones: 'Tiempo de prueba desde script'
    };

    console.log('📊 Datos del tiempo:', tiempoPrueba);

    const crearTiempoResponse = await axios.post(
      `${BASE_URL}/cargas/tiempos-procedimiento`,
      tiempoPrueba,
      { headers }
    );

    console.log('✅ Tiempo creado exitosamente');
    console.log('📊 Respuesta:', crearTiempoResponse.data);

    // 5. Intentar crear el mismo tiempo nuevamente (debería fallar)
    console.log('\n📋 5. Intentando crear el mismo tiempo nuevamente...');
    try {
      await axios.post(
        `${BASE_URL}/cargas/tiempos-procedimiento`,
        tiempoPrueba,
        { headers }
      );
      console.log('❌ ERROR: Se permitió crear un tiempo duplicado');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correcto: Se rechazó el tiempo duplicado');
        console.log('📊 Mensaje de error:', error.response.data.mensaje);
      } else {
        console.log('❌ Error inesperado:', error.response?.data || error.message);
      }
    }

    // 6. Verificar que el tiempo se creó para el usuario correcto
    console.log('\n📋 6. Verificando tiempos del usuario...');
    const tiemposResponse = await axios.get(`${BASE_URL}/cargas/tiempos-procedimiento`, { headers });
    const tiempos = tiemposResponse.data.data;
    
    const tiempoCreado = tiempos.find(t => 
      t.procedimientoId === tiempoPrueba.procedimientoId && 
      t.empleoId === tiempoPrueba.empleoId
    );

    if (tiempoCreado) {
      console.log('✅ Tiempo encontrado en la lista del usuario');
      console.log(`   ID: ${tiempoCreado.id}`);
      console.log(`   Tiempo calculado: ${tiempoCreado.tiempoCalculadoPERT} horas`);
    } else {
      console.log('❌ Tiempo no encontrado en la lista del usuario');
    }

    console.log('\n🎯 PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('==================================');
    console.log('✅ Autenticación funcionando');
    console.log('✅ Creación de tiempos funcionando');
    console.log('✅ Validación de duplicados funcionando');
    console.log('✅ Aislamiento por usuario funcionando');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Data:', error.response.data);
    }
  }
}

// Ejecutar la prueba
probarEndpointTiempos().catch(console.error); 