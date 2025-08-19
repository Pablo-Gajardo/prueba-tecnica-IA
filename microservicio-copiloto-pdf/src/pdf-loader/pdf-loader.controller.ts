import { Controller, Post, UploadedFile, UseInterceptors , Delete, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfLoaderService } from './pdf-loader.service';

@Controller('pdf-loader')
export class PdfLoaderController {
  constructor(private readonly pdfLoaderService: PdfLoaderService) {}

  @Post('indexar')
  @UseInterceptors(FileInterceptor('file'))
  async indexarPDF(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No se envió ningún archivo PDF');
    }
    return this.pdfLoaderService.indexarPDF(file.buffer, file.originalname);
  }

    @Delete('borrar')
    async borrarPDF(@Body('fileName') fileName: string) {
    try {
      if (!fileName) {
        return { message: 'No se envió el nombre del PDF', code: 400 };
      }

      const result = await this.pdfLoaderService.borrarDocumentosPorArchivo(fileName);
      return result;
    } catch (error) {
      // Retorna un objeto controlado en lugar de error 500
      return { message: `Error al borrar documentos: ${error.message}`, code: 500 };
    }
  }
}
