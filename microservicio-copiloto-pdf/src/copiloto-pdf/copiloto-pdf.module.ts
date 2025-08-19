import { Module } from '@nestjs/common';
import { CopilotoPdfController } from './copiloto-pdf.controller';
import { CopilotoPdfService } from './copiloto-pdf.service';

@Module({
  controllers: [CopilotoPdfController],
  providers: [CopilotoPdfService]
})
export class CopilotoPdfModule {}
