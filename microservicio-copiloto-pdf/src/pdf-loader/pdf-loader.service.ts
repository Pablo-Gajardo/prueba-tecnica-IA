import { Injectable, Logger } from '@nestjs/common';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PdfLoaderService {
  private readonly logger = new Logger(PdfLoaderService.name);
  private readonly collectionName = 'pdf_collection';
  private readonly chromaUrl = 'http://chroma:8000'; // Chroma en Docker

  constructor(private readonly configService: ConfigService) {}

  async indexarPDF(fileBuffer: Buffer, fileName: string){
    // Guardar temporalmente el PDF
    const tempPath = path.join(__dirname, `../../tmp/${fileName}`);
    fs.mkdirSync(path.dirname(tempPath), { recursive: true });
    fs.writeFileSync(tempPath, fileBuffer);

    this.logger.log(`Procesando PDF: ${fileName}`);

    // Cargar PDF
    const docs = await new PDFLoader(tempPath).load();

    // Normalizar metadata
    docs.forEach((doc) => {
  const validMetadata: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(doc.metadata ?? {})) {
    if (['string', 'number', 'boolean'].includes(typeof value) || value === null) {
      validMetadata[key] = value;
    }
  }

  validMetadata['source'] = fileName;

  // Buscar en metadata página
  const page =
    doc.metadata?.pageNumber ??
    doc.metadata?.page ??
    doc.metadata?.loc?.pageNumber ??
    null;

  validMetadata['page'] = page;

  doc.metadata = validMetadata;
});

    // Dividir en chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });
    const chunks = await splitter.splitDocuments(docs);

    // Embeddings
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    // conecion con Chroma
    const vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName: this.collectionName,
      url: this.chromaUrl,
    }).catch(async () => {
      this.logger.log(`Colección no encontrada. Creando nueva: ${this.collectionName}`);
      return await Chroma.fromDocuments(chunks, embeddings, {
        collectionName: this.collectionName,
        url: this.chromaUrl,
      });
    });

    // Indexar documento
    await vectorStore.addDocuments(chunks);

    // Obtener cantidad actualizada
    const count = await vectorStore.collection?.count();

    this.logger.log(
      `Se indexaron ${chunks.length} fragmentos desde ${fileName}. Documentos totales: ${count}`,
    );

    if (!count || count === 0) {
  return {
    message: `No se indexaron documentos. La colección "${this.collectionName}" está vacía.`,
    code: 300,
  };
} else {
  return {
    message: `Se indexaron ${chunks.length} fragmentos desde ${fileName}. Documentos totales en colección: ${count}`,
    code: 200,
  };
  }
}


async borrarDocumentosPorArchivo(fileName: string) {
  try {
    const vectorStore = await this.getVectorStore();
    if (!vectorStore?.collection) {
      return this.notFound(`Colección "${this.collectionName}" no encontrada.`);
    }

    const allDocs = await this.obtenerTodosLosDocumentos(vectorStore.collection);
    this.logResumenPorArchivo(allDocs.metadatas);

    const idsToDelete = this.obtenerIdsPorArchivo(allDocs, fileName);
    if (idsToDelete.length === 0) {
      return this.notFound(`No se encontraron fragmentos para "${fileName}"`);
    }

    await vectorStore.collection.delete({ ids: idsToDelete });
    const count = await vectorStore.collection.count();

    const msg = `Se borraron todos los fragmentos de "${fileName}". Documentos restantes: ${count}`;
    this.logger.log(msg);
    return { message: msg, code: 200 };
  } catch (error) {
    this.logger.error(`Error al borrar documentos de "${fileName}": ${error.message}`);
    return { message: `Error al borrar documentos: ${error.message}`, code: 500 };
  }
}

/* -------------------- MÉTODOS PRIVADOS -------------------- */

private async getVectorStore() {
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
  });

  return Chroma.fromExistingCollection(embeddings, {
    collectionName: this.collectionName,
    url: this.chromaUrl,
  });
}

private async obtenerTodosLosDocumentos(collection: any) {
  let allDocs: any = { ids: [], metadatas: [] };
  let offset = 0;
  const batchSize = 1000;

  let batch;
  do {
    batch = await collection.get({ limit: batchSize, offset });
    if (batch?.ids?.length) {
      allDocs.ids.push(...batch.ids);
      allDocs.metadatas.push(...batch.metadatas);
      offset += batch.ids.length;
    }
  } while (batch?.ids?.length === batchSize);

  return allDocs;
}

private logResumenPorArchivo(metadatas: any[]) {
  const counts = metadatas.reduce((acc, m) => {
    const key = m.source || 'desconocido';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  this.logger.log('Fragmentos por archivo:', counts);
}

private obtenerIdsPorArchivo(allDocs: any, fileName: string) {
  return allDocs.ids.filter(
    (_: string, i: number) => allDocs.metadatas[i]?.source === fileName
  );
}

private notFound(msg: string) {
  this.logger.warn(msg);
  return { message: msg, code: 404 };
}



}
