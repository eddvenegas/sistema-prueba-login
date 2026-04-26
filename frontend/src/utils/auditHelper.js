// Importa la configuración de tu API si la tienes, o usa tu URL base
import { buildApiUrl } from '../config/api'; // Ajusta esta ruta según tu proyecto

/**
 * Envía un registro de auditoría al backend de forma silenciosa (fire-and-forget)
 */
export const registrarAccion = async (modulo, accion, descripcion) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Petición silenciosa: no bloquea la ejecución de la app (no usamos await en quien la llama)
    fetch(buildApiUrl('/api/auth/auditoria/frontend'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ modulo, accion, descripcion })
    });
  } catch (error) {
    console.error('Error silencioso al registrar auditoría:', error);
  }
};