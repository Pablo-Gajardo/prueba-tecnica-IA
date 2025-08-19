import axios from 'axios';
const API_BASE = 'http://localhost:3000';

/**
 * Preguntar a la IA
 */
export async function preguntarIA(pregunta) {
  try {
    const response = await axios.post(`${API_BASE}/ia/preguntar`, { pregunta });
    return response.data; // Esperamos que venga con { pregunta, respuesta, fuentes }
  } catch (error) {
    console.error('Error al preguntar IA:', error);
    return { pregunta, respuesta: '❌ Error al obtener respuesta del servidor.', fuentes: [] };
  }
}

/**
 * Subir un PDF y que se indexe en el backend
 * @param {File} file 
 * @returns {Promise<{message: string, code: number}>}
 */
export async function subirPDF(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE}/pdf-loader/indexar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data; // { message, code }
  } catch (error) {
    console.error('Error al subir PDF:', error);
    throw error;
  }
}

/**
 * Borrar fragmentos de un PDF ya indexado en el backend
 * @param {string} fileName
 * @returns {Promise<{message: string, code: number}>}
 */
export async function borrarPDF(fileName) {
  if (!fileName) throw new Error('Debes enviar el nombre del PDF');

  try {
    const response = await axios.delete(`${API_BASE}/pdf-loader/borrar`, {
      data: { fileName },
    });

    return response.data; // { message, code }
  } catch (error) {
    console.error('Error al borrar PDF:', error);
    return { message: error.response?.data?.message || error.message, code: 500 };
  }
}


