import { Controller, Post, Body , Query, BadRequestException, Get } from '@nestjs/common';
import { CopilotoPdfService } from './copiloto-pdf.service';

@Controller('ia')
export class  CopilotoPdfController {
  constructor(private readonly ia: CopilotoPdfService) {}
  @Post('preguntar')
  preguntar(@Body('pregunta') pregunta: string) {
    console.log('pregunta')
    return this.ia.responderPregunta(pregunta);
  }
  
   @Get('test')
  async testSimilarity(@Query('q') pregunta: string) {
    if (!pregunta) {
      throw new BadRequestException('Debes enviar el parámetro ?q=...');
    }
    return this.ia.testSimilarity(pregunta);
  }
}