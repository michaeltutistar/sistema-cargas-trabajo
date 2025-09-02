// Empleos organizados por niveles jerárquicos
// Basado en codigos_empleos_json.json del backend

export interface EmpleoPorNivel {
  codigo: string;
  denominacion: string;
  nivel: 'Directivo' | 'Asesor' | 'Profesional' | 'Técnico' | 'Asistencial';
}

export const empleosPorNivel: EmpleoPorNivel[] = [
  // Nivel Directivo
  { codigo: "005", denominacion: "Alcalde", nivel: "Directivo" },
  { codigo: "030", denominacion: "Alcalde Local", nivel: "Directivo" },
  { codigo: "032", denominacion: "Consejero de Justicia", nivel: "Directivo" },
  { codigo: "036", denominacion: "Auditor Fiscal de Contraloría", nivel: "Directivo" },
  { codigo: "010", denominacion: "Contralor", nivel: "Directivo" },
  { codigo: "035", denominacion: "Contralor Auxiliar", nivel: "Directivo" },
  { codigo: "003", denominacion: "Decano de Escuela o Institución Tecnológica", nivel: "Directivo" },
  { codigo: "007", denominacion: "Decano de Institución Universitaria", nivel: "Directivo" },
  { codigo: "008", denominacion: "Decano de Universidad", nivel: "Directivo" },
  { codigo: "009", denominacion: "Director Administrativo o Financiero o Técnico u Operativo", nivel: "Directivo" },
  { codigo: "060", denominacion: "Director de Area Metropolitana", nivel: "Directivo" },
  { codigo: "055", denominacion: "Director de Departamento Administrativo", nivel: "Directivo" },
  { codigo: "028", denominacion: "Director de Escuela o de Instituto o de Centro de Universidad", nivel: "Directivo" },
  { codigo: "065", denominacion: "Director de Hospital", nivel: "Directivo" },
  { codigo: "016", denominacion: "Director Ejecutivo de Asociación de Municipios", nivel: "Directivo" },
  { codigo: "050", denominacion: "Director o Gerente General de Entidad Descentralizada", nivel: "Directivo" },
  { codigo: "080", denominacion: "Director Local de Salud", nivel: "Directivo" },
  { codigo: "024", denominacion: "Director o Gerente Regional o Provincial", nivel: "Directivo" },
  { codigo: "039", denominacion: "Gerente", nivel: "Directivo" },
  { codigo: "085", denominacion: "Gerente Empresa Social del Estado", nivel: "Directivo" },
  { codigo: "001", denominacion: "Gobernador", nivel: "Directivo" },
  { codigo: "027", denominacion: "Jefe de Departamento de Universidad", nivel: "Directivo" },
  { codigo: "006", denominacion: "Jefe de Oficina", nivel: "Directivo" },
  { codigo: "015", denominacion: "Personero", nivel: "Directivo" },
  { codigo: "017", denominacion: "Personero Auxiliar", nivel: "Directivo" },
  { codigo: "040", denominacion: "Personero Delegado", nivel: "Directivo" },
  { codigo: "043", denominacion: "Personero Local de Bogotá", nivel: "Directivo" },
  { codigo: "071", denominacion: "Presidente Consejo de Justicia", nivel: "Directivo" },
  { codigo: "042", denominacion: "Rector de Institución Técnica Profesional", nivel: "Directivo" },
  { codigo: "048", denominacion: "Rector de Institución Universitaria o de Escuela o de Institución Tecnológica", nivel: "Directivo" },
  { codigo: "067", denominacion: "Rector de Universidad", nivel: "Directivo" },
  { codigo: "020", denominacion: "Secretario de Despacho", nivel: "Directivo" },
  { codigo: "054", denominacion: "Secretario General de Entidad Descentralizada", nivel: "Directivo" },
  { codigo: "058", denominacion: "Secretario General de Institución Técnica Profesional", nivel: "Directivo" },
  { codigo: "064", denominacion: "Secretario General de Institución Universitaria", nivel: "Directivo" },
  { codigo: "052", denominacion: "Secretario General de Universidad", nivel: "Directivo" },
  { codigo: "066", denominacion: "Secretario General de Escuela o de Institución Tecnológica", nivel: "Directivo" },
  { codigo: "073", denominacion: "Secretario General de Organismo de Control", nivel: "Directivo" },
  { codigo: "097", denominacion: "Secretario Seccional o Local de Salud", nivel: "Directivo" },
  { codigo: "025", denominacion: "Subcontralor", nivel: "Directivo" },
  { codigo: "070", denominacion: "Subdirector", nivel: "Directivo" },
  { codigo: "068", denominacion: "Subdirector Administrativo o Financiero o Técnico u Operativo", nivel: "Directivo" },
  { codigo: "072", denominacion: "Subdirector Científico", nivel: "Directivo" },
  { codigo: "074", denominacion: "Subdirector de Area Metropolitana", nivel: "Directivo" },
  { codigo: "076", denominacion: "Subdirector de Departamento Administrativo", nivel: "Directivo" },
  { codigo: "078", denominacion: "Subdirector Ejecutivo de Asociación de Municipios", nivel: "Directivo" },
  { codigo: "084", denominacion: "Subdirector o Subgerente General de Entidad Descentralizada", nivel: "Directivo" },
  { codigo: "090", denominacion: "Subgerente", nivel: "Directivo" },
  { codigo: "045", denominacion: "Subsecretario de Despacho", nivel: "Directivo" },
  { codigo: "091", denominacion: "Tesorero Distrital", nivel: "Directivo" },
  { codigo: "094", denominacion: "Veedor Distrital", nivel: "Directivo" },
  { codigo: "095", denominacion: "Viceveedor Distrital", nivel: "Directivo" },
  { codigo: "099", denominacion: "Veedor Distrital Delegado", nivel: "Directivo" },
  { codigo: "096", denominacion: "Vicerrector de Institución Técnica Profesional", nivel: "Directivo" },
  { codigo: "098", denominacion: "Vicerrector de Institución Universitaria", nivel: "Directivo" },
  { codigo: "057", denominacion: "Vicerrector de Escuela Tecnológica o de Institución Tecnológica", nivel: "Directivo" },
  { codigo: "077", denominacion: "Vicerrector de Universidad", nivel: "Directivo" },

  // Nivel Asesor
  { codigo: "105", denominacion: "Asesor", nivel: "Asesor" },
  { codigo: "115", denominacion: "Jefe de Oficina Asesora de Jurídica o de Planeación o de Prensa o de Comunicaciones", nivel: "Asesor" },

  // Nivel Profesional
  { codigo: "215", denominacion: "Almacenista General", nivel: "Profesional" },
  { codigo: "202", denominacion: "Comisario de Familia", nivel: "Profesional" },
  { codigo: "203", denominacion: "Comandante de Bomberos", nivel: "Profesional" },
  { codigo: "204", denominacion: "Copiloto de Aviación", nivel: "Profesional" },
  { codigo: "227", denominacion: "Corregidor", nivel: "Profesional" },
  { codigo: "260", denominacion: "Director de Cárcel", nivel: "Profesional" },
  { codigo: "265", denominacion: "Director de Banda", nivel: "Profesional" },
  { codigo: "270", denominacion: "Director de Orquesta", nivel: "Profesional" },
  { codigo: "235", denominacion: "Director de Centro de Institución Universitaria", nivel: "Profesional" },
  { codigo: "236", denominacion: "Director de Centro de Escuela Tecnológica", nivel: "Profesional" },
  { codigo: "243", denominacion: "Enfermero", nivel: "Profesional" },
  { codigo: "244", denominacion: "Enfermero Especialista", nivel: "Profesional" },
  { codigo: "232", denominacion: "Director de Centro de Institución Técnica Profesional", nivel: "Profesional" },
  { codigo: "233", denominacion: "Inspector de Policía Urbano Categoría Especial y 1ª Categoría", nivel: "Profesional" },
  { codigo: "234", denominacion: "Inspector de Policía Urbano 2ª Categoría", nivel: "Profesional" },
  { codigo: "206", denominacion: "Líder de Programa", nivel: "Profesional" },
  { codigo: "208", denominacion: "Líder de Proyecto", nivel: "Profesional" },
  { codigo: "209", denominacion: "Maestro en Artes", nivel: "Profesional" },
  { codigo: "211", denominacion: "Médico General", nivel: "Profesional" },
  { codigo: "213", denominacion: "Médico Especialista", nivel: "Profesional" },
  { codigo: "231", denominacion: "Músico de Banda", nivel: "Profesional" },
  { codigo: "221", denominacion: "Músico de Orquesta", nivel: "Profesional" },
  { codigo: "214", denominacion: "Odontólogo", nivel: "Profesional" },
  { codigo: "216", denominacion: "Odontólogo Especialista", nivel: "Profesional" },
  { codigo: "275", denominacion: "Piloto de Aviación", nivel: "Profesional" },
  { codigo: "222", denominacion: "Profesional Especializado", nivel: "Profesional" },
  { codigo: "242", denominacion: "Profesional Especializado Area Salud", nivel: "Profesional" },
  { codigo: "219", denominacion: "Profesional Universitario", nivel: "Profesional" },
  { codigo: "237", denominacion: "Profesional Universitario Area Salud", nivel: "Profesional" },
  { codigo: "217", denominacion: "Profesional Servicio Social Obligatorio", nivel: "Profesional" },
  { codigo: "201", denominacion: "Tesorero General", nivel: "Profesional" },

  // Nivel Técnico
  { codigo: "335", denominacion: "Auxiliar de Vuelo", nivel: "Técnico" },
  { codigo: "303", denominacion: "Inspector de Policía 3ª a 6ª Categoría", nivel: "Técnico" },
  { codigo: "306", denominacion: "Inspector de Policía Rural", nivel: "Técnico" },
  { codigo: "312", denominacion: "Inspector de Tránsito y Transporte", nivel: "Técnico" },
  { codigo: "313", denominacion: "Instructor", nivel: "Técnico" },
  { codigo: "336", denominacion: "Subcomandante de Bomberos", nivel: "Técnico" },
  { codigo: "367", denominacion: "Técnico Administrativo", nivel: "Técnico" },
  { codigo: "323", denominacion: "Técnico Area Salud", nivel: "Técnico" },
  { codigo: "314", denominacion: "Técnico Operativo", nivel: "Técnico" },

  // Nivel Asistencial
  { codigo: "403", denominacion: "Agente de Tránsito", nivel: "Asistencial" },
  { codigo: "407", denominacion: "Auxiliar Administrativo", nivel: "Asistencial" },
  { codigo: "412", denominacion: "Auxiliar Area Salud", nivel: "Asistencial" },
  { codigo: "470", denominacion: "Auxiliar de Servicios Generales", nivel: "Asistencial" },
  { codigo: "472", denominacion: "Ayudante", nivel: "Asistencial" },
  { codigo: "475", denominacion: "Bombero", nivel: "Asistencial" },
  { codigo: "413", denominacion: "Cabo de Bomberos", nivel: "Asistencial" },
  { codigo: "428", denominacion: "Cabo de Prisiones", nivel: "Asistencial" },
  { codigo: "411", denominacion: "Capitán de Bomberos", nivel: "Asistencial" },
  { codigo: "477", denominacion: "Celador", nivel: "Asistencial" },
  { codigo: "480", denominacion: "Conductor", nivel: "Asistencial" },
  { codigo: "482", denominacion: "Conductor Mecánico", nivel: "Asistencial" },
  { codigo: "485", denominacion: "Guardián", nivel: "Asistencial" },
  { codigo: "416", denominacion: "Inspector", nivel: "Asistencial" },
  { codigo: "487", denominacion: "Operario", nivel: "Asistencial" },
  { codigo: "490", denominacion: "Operario Calificado", nivel: "Asistencial" },
  { codigo: "417", denominacion: "Sargento de Bomberos", nivel: "Asistencial" },
  { codigo: "438", denominacion: "Sargento de Prisiones", nivel: "Asistencial" },
  { codigo: "440", denominacion: "Secretario", nivel: "Asistencial" },
  { codigo: "420", denominacion: "Secretario Bilingüe", nivel: "Asistencial" },
  { codigo: "425", denominacion: "Secretario Ejecutivo", nivel: "Asistencial" },
  { codigo: "430", denominacion: "Secretario Ejecutivo del Despacho del Gobernador", nivel: "Asistencial" },
  { codigo: "419", denominacion: "Teniente de Bomberos", nivel: "Asistencial" },
  { codigo: "457", denominacion: "Teniente de Prisiones", nivel: "Asistencial" }
];

// Función para obtener empleos por nivel
export const getEmpleosPorNivel = (nivel: string): EmpleoPorNivel[] => {
  return empleosPorNivel.filter(empleo => empleo.nivel.toLowerCase() === nivel.toLowerCase());
};

// Función para obtener todos los niveles disponibles
export const getNivelesDisponibles = (): string[] => {
  return [...new Set(empleosPorNivel.map(empleo => empleo.nivel))];
}; 