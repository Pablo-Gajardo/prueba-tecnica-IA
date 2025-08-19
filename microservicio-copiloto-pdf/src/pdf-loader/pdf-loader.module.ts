import { Module } from '@nestjs/common';
import { PdfLoaderService } from './pdf-loader.service';
import { PdfLoaderController } from './pdf-loader.controller';

@Module({
  controllers: [PdfLoaderController],
  providers: [PdfLoaderService],
  exports: [PdfLoaderService], 
})
export class PdfLoaderModule {}