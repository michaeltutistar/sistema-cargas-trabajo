import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',         // <-- Cambia esto por tu usuario de MySQL
  password: '',    // <-- Cambia esto por tu contraseña de MySQL
  database: 'cargas_trabajo', // <-- Cambia esto si tu base tiene otro nombre
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}); 