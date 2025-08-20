# Copiloto Conversacional sobre Documentos
## ⚙️ Instrucciones para levantar Docker Compose

## Requisitos en sistema

Antes de levantar los contenedores, asegúrate de tener configurado tu entorno:

- Docker
- Docker Compose
- Una clave de OpenAI o un archivo .env para la prueba
- Puertos libres en tu sistema, para evitar conflictos:
    - 8000 → Chroma
    - 3000 → Backend
    - 5173 → Frontend

## Pasos para levantar el proyecto

### 1. Clonar el repositorio
Ingrasar en linea de consdo en su archivo elegido y clonar el repocitorio con el digiente codigo.

`git clone https://github.com/Pablo-Gajardo/prueba-tecnica-IA.git`

### 2. Entrar a la carpeta  
`cd prueba-tecnica-IA`

### 3. Crear o usar un archivo .env para el backend.
ingresar y crear el archivo .env o ingresar su archivo .env, este achivo deve estar en la direccion correcpondientes al backend.

`cd microservicio-copiloto-pdf`

Si decides crear tu propio archivo .env, debes incluir tu clave de OpenAI de la sigiente manera:

`export OPENAI_API_KEY="tu_clave_aquí"`

### 4. Construir los contenedores.
Ejecuta el siguiente comando para construir todo desde cero (esto instala dependencias y crea imágenes):

`docker-compose build --no-cache`

### 5. Levantar los contenedores.
Este comando levanta los contenedores que fueron creados previamente.

`docker-compose up`


### 6. Esperar a que el backend se inicie.
Paciencia: el backend puede tardar unos segundos en estar listo. Una vez que esté corriendo, podrás usar la aplicación normalmente.

### 7. Acceder al frontend.
Abre tu navegador en la URL: http://localhost:5173


# 📝 Descripción del proyecto

Este proyecto implementa un copiloto conversacional que permite a un usuario subir hasta 5 archivos PDF y hacer 
reguntas en lenguaje natural sobre su contenido. Las respuestas se generan de manera contextual, utilizando un flujo de 
procesamiento y almacenamiento estructurado de la información en estructura Rack.

El objetivo principal es demostrar habilidades en diseño de microservicios,
integración de LLMs y vector stores, y orquestación de flujos conversacionales escalables.

## 🏦 Arquitectura del sistema

Esta es una arquitectura RAG (generación aumentada por recuperación), basada en las siguientes tecnologías:

- Backend: NestJS (microservicio)
Elegido por su escalabilidad y patrón de diseño modular.
- LLM: GPT-3.5-turbo
Seleccionado por su versatilidad y capacidad de razonamiento lógico.
- Embedding model: text-embedding-3-small
Optimizado por rendimiento y costo para generar vectores de los documentos.
- Vector Store: Chroma
Base de datos vectorial para búsquedas semánticas rápidas.
- Interfaz: Web app (Vue 3)
Permite subir PDFs y mantener la conversación con el asistente.



## 🔄 Flujo conversacional


- Subida de documentos: 
    - El usuario puede subir hasta 5 PDFs.
- Procesamiento de documentos:
    - Cada PDF se divide en chunks (segmentos de texto) para optimizar la búsqueda y mejorar la precisión de los embeddings.
    - Cada chunk se transforma en un vector usando text-embedding-3-small.

- Almacenamiento: 
    - Los vectores generados se guardan en Chroma, permitiendo búsquedas semánticas rápidas y eficientes.

- Consulta del usuario:
    - Cada pregunta se convierte en un embedding y se busca en Chroma.
    - Los documentos más relevantes se envían al LLM junto con la memoria conversacional y un prompt de orientación, garantizando respuestas contextuales y coherentes.

- Generación de respuesta:
    - GPT-3.5-turbo produce la respuesta final basándose en la información recuperada y el contexto de la conversación.

## Diagrama de flujo conversacional

![Diagrama de flujo de datos](<img/Diagrama de flujo de datos.png>)

## 🚀 Funcionalidades
Funcionalidades implementadas

- Subida de hasta 5 PDFs.
- Extracción, chunking y vectorización de contenido.
- Búsqueda semántica y recuperación de información.
- Interfaz conversacional con memoria contextual.


## 🛠️ Tecnologías
Componente	Tecnología	Justificación
- Backend	NestJS (microservicio):	Escalabilidad, modularidad y patrones de diseño claros.
- LLM	GPT-3.5-turbo:	Versatilidad y lógica avanzada en generación de texto.
- Embeddings	text-embedding-3-small:	Buen rendimiento y costo-efectivo.
- Vector Store	Chroma:	Recuperación semántica rápida y confiable.
- Frontend	Vue 3:	Interfaz reactiva y manejable.


## ⚠️ Limitaciones y mejoras futuras

No se implementa aún la comparación automática de documentos ni clasificación avanzada.

### Mejora futura: 
resumir automáticamente documentos largos y añadir alertas de inconsistencias.

### Escalabilidad futura: 
implementar pipelines de procesamiento asincrónico para grandes volúmenes de PDFs.
