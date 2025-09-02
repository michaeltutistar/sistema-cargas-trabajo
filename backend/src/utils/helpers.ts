import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * Genera un UUID único
 */
export function generarId(): string {
  return uuidv4();
}

/**
 * Encripta una contraseña usando bcrypt
 */
export async function encriptarPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compara una contraseña con su hash
 */
export async function compararPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Genera un token JWT
 */
export function generarJWT(payload: object): string {
  const secret = process.env['JWT_SECRET'] || 'fallback_secret';
  const expiresIn: string | number = process.env['JWT_EXPIRES_IN'] || '24h';
  
  const options = { expiresIn } as SignOptions;
  return jwt.sign(payload, secret, options);
}

/**
 * Verifica un token JWT
 */
export function verificarJWT(token: string): any {
  const secret = process.env['JWT_SECRET'] || 'fallback_secret';
  return jwt.verify(token, secret);
}

/**
 * Formatea una fecha a string ISO
 */
export function formatearFecha(fecha: Date): string {
  return fecha.toISOString();
}

/**
 * Convierte string a Date validando el formato
 */
export function parsearFecha(fechaString: string): Date {
  const fecha = new Date(fechaString);
  if (isNaN(fecha.getTime())) {
    throw new Error('Formato de fecha inválido');
  }
  return fecha;
}

/**
 * Valida formato de email
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Limpia y normaliza strings
 */
export function limpiarString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Convierte string a slug (URL-friendly)
 */
export function stringASlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/-/g, '');
}

/**
 * Genera código único basado en nombre
 */
export function generarCodigo(nombre: string, prefijo?: string): string {
  const base = stringASlug(nombre);
  const timestamp = Date.now().toString().slice(-6);
  return prefijo ? `${prefijo}-${base}-${timestamp}` : `${base}-${timestamp}`;
}

/**
 * Valida que un número esté en un rango específico
 */
export function validarRango(numero: number, min: number, max: number): boolean {
  return numero >= min && numero <= max;
}

/**
 * Redondea un número a decimales específicos
 */
export function redondear(numero: number, decimales: number = 2): number {
  return Math.round(numero * Math.pow(10, decimales)) / Math.pow(10, decimales);
}

/**
 * Convierte object a JSON string de forma segura
 */
export function objetoAJSON(objeto: any): string {
  try {
    return JSON.stringify(objeto, null, 2);
  } catch (error) {
    return '{}';
  }
}

/**
 * Parsea JSON string de forma segura
 */
export function JSONAObjeto<T = any>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

/**
 * Remueve propiedades undefined de un objeto
 */
export function limpiarObjeto<T extends Record<string, any>>(objeto: T): Partial<T> {
  const resultado: Partial<T> = {};
  
  for (const [key, value] of Object.entries(objeto)) {
    if (value !== undefined) {
      resultado[key as keyof T] = value;
    }
  }
  
  return resultado;
}

/**
 * Valida que todos los campos requeridos estén presentes
 */
export function validarCamposRequeridos(
  objeto: Record<string, any>,
  camposRequeridos: string[]
): string[] {
  const camposFaltantes: string[] = [];
  
  for (const campo of camposRequeridos) {
    if (objeto[campo] === undefined || objeto[campo] === null || objeto[campo] === '') {
      camposFaltantes.push(campo);
    }
  }
  
  return camposFaltantes;
}

/**
 * Escapa caracteres especiales para SQL
 */
export function escaparSQL(str: string): string {
  return str.replace(/'/g, "''");
}

/**
 * Genera una respuesta de error estandarizada
 */
export function generarRespuestaError(
  mensaje: string,
  codigo: number = 500,
  detalles?: any
): {
  error: boolean;
  mensaje: string;
  codigo: number;
  detalles?: any;
  timestamp: string;
} {
  return {
    error: true,
    mensaje,
    codigo,
    detalles,
    timestamp: new Date().toISOString()
  };
}

/**
 * Genera una respuesta de éxito estandarizada
 */
export function generarRespuestaExito<T = any>(
  datos: T,
  mensaje: string = 'Operación exitosa'
): {
  error: boolean;
  mensaje: string;
  datos: T;
  timestamp: string;
} {
  return {
    error: false,
    mensaje,
    datos,
    timestamp: new Date().toISOString()
  };
}

/**
 * Convierte array de objetos a CSV
 */
export function arrayACSV(array: any[]): string {
  if (array.length === 0) return '';
  
  const headers = Object.keys(array[0]!).join(',');
  const rows = array.map(obj => 
    Object.values(obj).map(val => 
      typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

/**
 * Delay para pruebas o rate limiting
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
