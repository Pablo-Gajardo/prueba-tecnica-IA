<template>
  <div class="flex h-screen w-full bg-gray-900 text-gray-100">
    <!-- Sidebar izquierda -->
    <aside class="w-64 bg-gray-800 p-4 flex flex-col border-r border-gray-700">
      <h2 class="text-xl font-bold mb-4 text-gray-200">📂 PDFs Subidos</h2>
      <ul class="flex-1 overflow-auto space-y-2">
        <li 
          v-for="(pdf, index) in pdfs" 
          :key="index" 
          class="flex items-center justify-between p-2 rounded bg-gray-700 hover:bg-gray-600 cursor-pointer break-words text-gray-100 shadow"
        >
          <span class="truncate">{{ pdf.nombre }}</span>
          <button 
            @click="eliminarPdf(index)" 
            class="ml-2 text-gray-400 opacity-60 hover:opacity-100 hover:text-red-400 transition text-xs font-bold"
            title="Eliminar PDF"
          >
            ✕
          </button>
        </li>
      </ul>

      <input 
        ref="inputFile" 
        type="file" 
        accept="application/pdf" 
        multiple
        class="hidden" 
        @change="handleFileUpload"
      />

      <button 
        class="mt-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition flex items-center justify-center gap-2"
        @click="$refs.inputFile.click()"
        :disabled="cargando"
      >
        <span v-if="!cargando">Subir PDF</span>
        <span v-else class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          Subiendo...
        </span>
      </button>
    </aside>

    <!-- Chat principal -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="bg-gray-800 text-gray-200 p-3 text-center font-bold border-b border-gray-700">
        Copiloto PDF
      </div>

      <!-- Mensajes -->
      <div class="flex-1 overflow-auto p-4 space-y-4 flex flex-col relative">

        <!-- Mensaje inicial cuando no hay chat -->
        <div v-if="chat.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-center px-4">
          <h2 class="text-2xl font-bold mb-2">¡Hola! 👋</h2>
          <p class="text-sm">Sube un PDF para que pueda ayudarte a responder tus preguntas.</p>
        </div>

        <div v-for="(msg, index) in chat" :key="index" class="flex flex-col gap-1">

          <!-- Mensaje del usuario -->
          <div v-if="msg.pregunta" class="flex justify-end">
            <div class="bg-blue-600 text-white p-3 rounded-2xl shadow break-words max-w-[66%] self-end">
              {{ msg.pregunta }}
            </div>
          </div>

          <!-- Mensaje del asistente -->
          <div v-if="msg.respuesta || msg.cargando" class="flex flex-col gap-1 max-w-[66%] self-start">
            <div class="flex items-start gap-2">
              <div class="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0"></div>
              <div class="flex-1">
                <!-- Respuesta normal -->
                <div v-if="msg.respuesta" class="bg-gray-700 text-gray-100 p-3 rounded-2xl shadow break-words">
                  {{ msg.respuesta }}
                </div>

                <!-- Indicador de carga (tres puntitos) -->
                <div v-else-if="msg.cargando" class="bg-gray-700 text-gray-100 p-3 rounded-2xl shadow flex gap-1">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>

                <!-- Fuentes alineadas a la izquierda, más pequeñas, sin saltos de línea vacíos -->
                <div 
                  v-if="msg.mostrarFuentes" 
                  class="bg-gray-800 p-2 rounded mt-1 overflow-auto break-words border border-gray-700 text-left"
                >
                  <div v-for="(f, i) in msg.fuentes" :key="i" class="mb-2">
                    <strong class="text-gray-200 text-sm">{{ f.documento }} (pág. {{ f.pagina }})</strong>
                    <p class="text-xs text-gray-300 break-words text-left">
                      {{ f.contenido.replace(/^\s*[\r\n]+/gm, '').trim() }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botón Fuentes debajo del contenedor de la respuesta -->
            <div v-if="msg.respuesta" class="flex justify-end mt-1">
              <button 
                @click="toggleFuentes(index)" 
                class="text-xs text-blue-400 hover:underline"
              >
                Fuentes
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Entrada del usuario -->
      <div class="flex border-t border-gray-700 p-2 bg-gray-800">
        <input
          v-model="nuevoMensaje"
          @keyup.enter="enviarMensaje"
          type="text"
          placeholder="Escribe tu pregunta..."
          class="flex-1 p-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none"
        />
        <button 
          @click="enviarMensaje" 
          class="ml-2 bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-500 transition"
        >
          Enviar
        </button>
      </div>
    </div>

    <!-- Notificaciones centradas -->
    <div class="fixed top-4 left-1/2 transform -translate-x-1/2 space-y-2 z-50">
      <div 
        v-for="(notif, index) in notificaciones" 
        :key="index"
        class="bg-gray-800 text-gray-100 px-4 py-2 rounded-lg shadow-lg border border-gray-700 animate-fade-in-out"
      >
        {{ notif }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { preguntarIA, subirPDF, borrarPDF } from '../services/apiService';

export default {
  name: 'ChatAsistente',
  setup() {
    const pdfs = ref([]);
    const chat = ref([]);
    const nuevoMensaje = ref('');
    const notificaciones = ref([]);
    const cargando = ref(false);

    const enviarMensaje = async () => {
      if (nuevoMensaje.value.trim() === '') return;

      const preguntaActual = nuevoMensaje.value;
      chat.value.push({ pregunta: preguntaActual });
      nuevoMensaje.value = '';

      // Mostrar indicador de carga
      const idx = chat.value.push({ cargando: true }) - 1;

      try {
        const data = await preguntarIA(preguntaActual);

        // Reemplazar indicador de carga con la respuesta real
        chat.value[idx] = {
          respuesta: data?.respuesta || '❌ No se recibió respuesta.',
          fuentes: Array.isArray(data?.fuentes) ? data.fuentes : [],
          mostrarFuentes: false
        };
      } catch (error) {
        console.error('Error en enviarMensaje:', error);
        chat.value[idx] = {
          respuesta: '❌ Error al conectar con el servidor.',
          fuentes: [],
          mostrarFuentes: false
        };
      }
    };

    const toggleFuentes = (index) => {
      if (!chat.value[index]) return;
      chat.value[index].mostrarFuentes = !chat.value[index].mostrarFuentes;
    };

    const handleFileUpload = async (event) => {
      const input = event.target;
      const files = Array.from(input.files || []).filter(f => f.type === 'application/pdf');

      cargando.value = true;

      for (const file of files) {
        const existe = pdfs.value.some(p => p.nombre === file.name);
        if (existe) {
          lanzarNotificacion(`⚠️ El archivo "${file.name}" ya está en el sistema.`);
          continue;
        }

        try {
          const data = await subirPDF(file);
          if (data?.code === 200) {
            pdfs.value.push({ nombre: file.name });
            lanzarNotificacion(`📂 ${file.name} se subió correctamente.`);
          } else {
            lanzarNotificacion(`⚠️ Error al subir "${file.name}": ${data?.message || 'Respuesta inesperada del servidor.'}`);
          }
        } catch (error) {
          console.error('Error al subir PDF:', error);
          const msg = error?.response?.data?.message || error?.message || 'Error desconocido';
          lanzarNotificacion(`⚠️ Error al subir "${file.name}": ${msg}`);
        }
      }

      cargando.value = false;
      if (input) input.value = '';
    };

    const eliminarPdf = async (index) => {
      const nombre = pdfs.value[index].nombre;
      try {
        const resultado = await borrarPDF(nombre);
        if (resultado.code === 200) {
          pdfs.value.splice(index, 1);
          lanzarNotificacion(`🗑️ ${nombre} eliminado correctamente.`);
        } else if (resultado.code === 404) {
          lanzarNotificacion(`⚠️ No se encontró "${nombre}" en la colección: ${resultado.message}`);
        } else {
          lanzarNotificacion(`⚠️ No se pudo eliminar "${nombre}": ${resultado.message}`);
        }
      } catch (error) {
        console.error('Error al borrar PDF:', error);
        lanzarNotificacion(`⚠️ Error al eliminar "${nombre}".`);
      }
    };

    const lanzarNotificacion = (mensaje) => {
      notificaciones.value.push(mensaje);
      setTimeout(() => {
        notificaciones.value.shift();
      }, 3000);
    };

    return {
      pdfs,
      chat,
      nuevoMensaje,
      enviarMensaje,
      toggleFuentes,
      handleFileUpload,
      eliminarPdf,
      notificaciones,
      cargando
    };
  }
};
</script>

<style scoped>
html, body, #app {
  height: 100%;
  margin: 0;
  width: 100%;
  background: #111827;
}

/* Animación de notificación */
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}
.animate-fade-in-out {
  animation: fadeInOut 3s ease forwards;
}

/* Animación de los tres puntitos */
.dot {
  width: 6px;
  height: 6px;
  background-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: blink 1.4s infinite both;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}
</style>
