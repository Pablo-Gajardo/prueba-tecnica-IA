import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { ConversationTokenBufferMemory } from 'langchain/memory';
import { LLMChain } from 'langchain/chains';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

@Injectable()
export class CopilotoPdfService {
  private readonly logger = new Logger(CopilotoPdfService.name);
  private readonly collectionName = 'pdf_collection';
  private readonly chromaUrl = 'http://localhost:8000'; // URL de tu Chroma en Docker

  llm: ChatOpenAI;
  memory: ConversationTokenBufferMemory;
  chain: LLMChain;

  // se configura LLM y su memoria
  constructor(private readonly configService: ConfigService) {
    this.llm = new ChatOpenAI({
      model: 'gpt-3.5-turbo',
      temperature: 0,
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    this.memory = new ConversationTokenBufferMemory({
      llm: this.llm,
      memoryKey: 'chat_history',
      returnMessages: true,
    });

    // Prompt con memoria incluida
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Eres un asistente virtual experto en responder preguntas basadas en documentos PDF y en el historial de conversación. 
          Reglas para tus respuestas:

          1. Siempre utiliza la información contenida en los PDFs proporcionados.  
          2. Si una pregunta requiere contexto de preguntas anteriores, intégralo en la respuesta.  
          3. Incluye referencias claras a las fuentes de los PDFs de la siguiente forma: "- NombreDocumento.pdf, pág. X".  
          4. Resume la información de manera clara y concisa, evitando contenido irrelevante.  
          5. Si no tienes suficiente información para responder, di explícitamente que no puedes responder con certeza.  
          6. Mantén un tono profesional, amigable y fácil de entender. 
          7. Se muy consiso y usaras menos de 100 malabras en las respuestas`,
          
      ],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
    ]);

    // Construir la chain
    this.chain = new LLMChain({
      llm: this.llm,
      memory: this.memory,
      prompt,
    });
  }

  // Responde a la pregunta usando LLM y Chroma
async responderPregunta(pregunta: string) {
  this.validarPregunta(pregunta);

  const embeddings = this.crearEmbeddings();
  const vectorStore = await this.conectarChroma(embeddings);

  // Verifica si la colleccion tiene datos
  const coleccionOk = await this.verificarColeccion(vectorStore);

  let fuentes: any[] = [];
  let contexto = "";

  if (coleccionOk) {
    const docs = await vectorStore.similaritySearch(pregunta, 4);
    fuentes = this.formatearFuentes(docs);

    contexto = fuentes
      .map(f => `- ${f.documento}, pág. ${f.pagina}: ${f.contenido.substring(0, 200)}...`)
      .join('\n');
  } else {
    contexto = "No hay documentos cargados en la colección. El asistente debe responder de manera amigable indicando al usuario que suba documentos.";
  }

  // Llamar al chain con la pregunta y el contexto
  const result = await this.chain.call({
    input: `Pregunta: ${pregunta}\n\nContexto:\n${contexto}`,
  });

  // Obtener historial de memoria
  const memoryVars = await this.memory.loadMemoryVariables({});
  const historial = memoryVars.chat_history || [];

  return {
    pregunta,
    respuesta: result.text,
    fuentes,
    // historial,
  };
}




  // Test de similitud sin memoria
  async testSimilarity(pregunta: string) {
    this.validarPregunta(pregunta);

    const embeddings = this.crearEmbeddings();
    const vectorStore = await this.conectarChroma(embeddings);
    await this.verificarColeccion(vectorStore);

    const docs = await vectorStore.similaritySearch(pregunta, 2);

    return {
      query: pregunta,
      encontrados: docs.length,
      total: await vectorStore.collection?.count(),
      documentos: docs.map((d, i) => ({
        id: i + 1,
        page: d.metadata?.page ?? null,
        source: d.metadata?.source ?? 'desconocido',
        preview: d.pageContent.substring(0, 200) + '...',
      })),
    };
  }

  /* ------------ Funciones privadas ------------ */

  private validarPregunta(pregunta: string) {
    if (!pregunta || pregunta.trim().length === 0) {
      throw new BadRequestException('La pregunta no puede estar vacía');
    }
  }

  private crearEmbeddings() {
    return new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  private async conectarChroma(embeddings: OpenAIEmbeddings) {
    return await Chroma.fromExistingCollection(embeddings, {
      collectionName: this.collectionName,
      url: this.chromaUrl,
    });
  }

  private async verificarColeccion(vectorStore: Chroma) {
    const count = await vectorStore.collection?.count();
    this.logger.log(`Documentos en colección: ${count}`);
    if (!count || count === 0) {
      this.logger.log(`la coleccion ${this.collectionName} esta vacia`);
      return false
    }
      return true
  }

  private formatearFuentes(docs: any[]) {
  return docs.map(d => ({
    documento: d.metadata?.source || 'Documento desconocido',
    pagina: d.metadata?.page ?? null,
    contenido: d.pageContent,
  }));
}
}
