module.exports = {
  apps: [{
    name: 'cargas-trabajo',
    script: 'servidor-produccion.js',
    cwd: __dirname,
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    // Configuración de logs
    error_file: './logs/cargas-trabajo-error.log',
    out_file: './logs/cargas-trabajo-out.log',
    log_file: './logs/cargas-trabajo-combined.log',
    time: true,
    
    // Configuración de reinicio
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    
    // Configuración de monitoreo
    min_uptime: '10s',
    max_restarts: 10,
    
    // Variables de entorno específicas
    env_file: './env.production',
    
    // Configuración de cluster
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // Configuración de logs
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Configuración de salud
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true
  }]
}; 