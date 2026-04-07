/**
 * SCRIPT: Importar directores desde Excel a PostgreSQL
 * 
 * Uso:
 *   1. Coloca tu archivo Excel en la misma carpeta (directores.xlsx)
 *   2. Ejecuta: node importar-directores.js
 * 
 * El Excel debe tener estas columnas (en cualquier orden):
 *   nombre | dni | correo | colegio
 * 
 * Se asignará a cada director la contraseña temporal: su propio DNI
 * Deberán cambiarla en su primer ingreso.
 */

const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ugel_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'tu_contraseña_aqui',
});

// ⚙️ CONFIGURA AQUÍ el nombre de tu archivo Excel
const ARCHIVO_EXCEL = './directores.xlsx';

// ⚙️ Contraseña temporal: por defecto usa el DNI del director
// Cambia esta función si quieres otra contraseña temporal
const getPasswordTemporal = (director) => director.dni;

async function importarDirectores() {
  console.log('📂 Leyendo archivo Excel:', ARCHIVO_EXCEL);

  let workbook;
  try {
    workbook = XLSX.readFile(ARCHIVO_EXCEL);
  } catch (err) {
    console.error('❌ No se pudo leer el archivo Excel. ¿Existe el archivo?');
    process.exit(1);
  }

  // Toma la primera hoja del Excel
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const directores = XLSX.utils.sheet_to_json(sheet);

  console.log(`✅ Se encontraron ${directores.length} directores en el Excel.`);
  console.log('🔑 Columnas detectadas:', Object.keys(directores[0]));
  console.log('-------------------------------------------');

  let insertados = 0;
  let omitidos = 0;

  for (const fila of directores) {
    // Normalizar nombres de columnas (por si tienen mayúsculas o espacios)
    const nombre  = (fila['nombre']  || fila['Nombre']  || '').toString().trim();
    const dni     = (fila['dni']     || fila['DNI']     || fila['Dni'] || '').toString().trim();
    const correo  = (fila['correo']  || fila['Correo']  || fila['email'] || fila['Email'] || '').toString().trim();
    const colegio = (fila['colegio'] || fila['Colegio'] || fila['institucion'] || '').toString().trim();

    // Validar que al menos tenga nombre y DNI
    if (!nombre || !dni) {
      console.warn(`⚠️  Fila omitida (falta nombre o DNI):`, fila);
      omitidos++;
      continue;
    }

    try {
      // Contraseña temporal = DNI del director (o la función configurada arriba)
      const passwordTemporal = getPasswordTemporal({ nombre, dni, correo, colegio });
      const passwordHash = await bcrypt.hash(passwordTemporal, 10);

      await pool.query(
        `INSERT INTO usuarios (nombre, dni, correo, password_hash, role, colegio, debe_cambiar_password)
         VALUES ($1, $2, $3, $4, 'director', $5, TRUE)
         ON CONFLICT (dni) DO UPDATE SET
           nombre  = EXCLUDED.nombre,
           correo  = EXCLUDED.correo,
           colegio = EXCLUDED.colegio`,
        [nombre, dni, correo || null, passwordHash, colegio || null]
      );

      console.log(`  ✅ ${nombre} (DNI: ${dni}) — ${colegio}`);
      insertados++;

    } catch (err) {
      console.error(`  ❌ Error insertando ${nombre} (${dni}):`, err.message);
      omitidos++;
    }
  }

  console.log('-------------------------------------------');
  console.log(`✅ Importación completa: ${insertados} insertados, ${omitidos} omitidos.`);
  console.log('🔑 Contraseña temporal de cada director = su DNI');
  console.log('   Deberán cambiarla en su primer ingreso al sistema.');

  await pool.end();
}

importarDirectores();
