## Copiloto Conversacional sobre Documentos
### 📝 Descripción del proyecto

Este proyecto implementa un copiloto conversacional que permite a un usuario subir hasta 5 archivos PDF y hacer 
reguntas en lenguaje natural sobre su contenido. Las respuestas se generan de manera contextual, utilizando un flujo de 
procesamiento y almacenamiento estructurado de la información en estructura Rack.

El objetivo principal es demostrar habilidades en diseño de microservicios,
integración de LLMs y vector stores, y orquestación de flujos conversacionales escalables.

## ⚙️ Arquitectura del sistema

Esta es una arquitectura RACK (Recuperación Asistida por Conocimiento), basada en las siguientes tecnologías:

Backend: NestJS (microservicio)
Elegido por su escalabilidad y patrón de diseño modular.

LLM: GPT-3.5-turbo
Seleccionado por su versatilidad y capacidad de razonamiento lógico.

Embedding model: text-embedding-3-small
Optimizado por rendimiento y costo para generar vectores de los documentos.

Vector Store: Chroma
Base de datos vectorial para búsquedas semánticas rápidas.

Interfaz: Web app (Vue 3)
Permite subir PDFs y mantener la conversación con el asistente.



## 🔄 Flujo conversacional

Subida de documentos:
El usuario sube hasta 5 PDFs.

Procesamiento de documentos:
Los PDFs se separan en chunks (segmentos de texto) para mejorar el rendimiento de búsqueda y la precisión de los embeddings.
Cada chunk se transforma en un vector mediante text-embedding-3-small.

Almacenamiento:
Los vectores se guardan en Chroma, permitiendo búsquedas semánticas eficientes.

Consulta del usuario:
Cada pregunta se transforma en embedding y se consulta en Chroma.
Los documentos más relevantes se envían al LLM junto con la memoria conversacional y un prompt de orientación, asegurando respuestas contextuales y coherentes.

Respuesta:
GPT-3.5-turbo genera la respuesta final basándose en la información recuperada y el contexto de la conversación.

## 🚀 Funcionalidades
Funcionalidades implementadas

Subida de hasta 5 PDFs.
Extracción, chunking y vectorización de contenido.
Búsqueda semántica y recuperación de información.
Interfaz conversacional con memoria contextual.


## 🛠️ Tecnologías
Componente	Tecnología	Justificación
Backend	NestJS (microservicio):	Escalabilidad, modularidad y patrones de diseño claros.
LLM	GPT-3.5-turbo:	Versatilidad y lógica avanzada en generación de texto.
Embeddings	text-embedding-3-small:	Buen rendimiento y costo-efectivo.
Vector Store	Chroma:	Recuperación semántica rápida y confiable.
Frontend	Vue 3:	Interfaz reactiva y manejable.


## ⚠️ Limitaciones y mejoras futuras

No se implementa aún la comparación automática de documentos ni clasificación avanzada.

Mejora futura: 
resumir automáticamente documentos largos y añadir alertas de inconsistencias.

Escalabilidad futura: 
implementar pipelines de procesamiento asincrónico para grandes volúmenes de PDFs.