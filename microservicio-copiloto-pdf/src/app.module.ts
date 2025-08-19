import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfLoaderModule } from './pdf-loader/pdf-loader.module';
import { CopilotoPdfModule } from './copiloto-pdf/copiloto-pdf.module';

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true, 
    }),
    PdfLoaderModule, CopilotoPdfModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
