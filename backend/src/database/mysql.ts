import mysql from 'mysql2/promise';

export const db = mysql.createPool({
	host: process.env['DB_HOST'] || 'localhost',
	user: process.env['DB_USER'] || 'root',
	password: process.env['DB_PASS'] || '',
	database: process.env['DB_NAME'] || 'cargas_trabajo',
	port: process.env['DB_PORT'] ? parseInt(process.env['DB_PORT'], 10) : 3306,
	waitForConnections: true,
	connectionLimit: process.env['DB_POOL'] ? parseInt(process.env['DB_POOL'], 10) : 10,
	queueLimit: 0
}); 