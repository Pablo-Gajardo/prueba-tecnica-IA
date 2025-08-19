import { Test, TestingModule } from '@nestjs/testing';
import { CopilotoPdfService } from './copiloto-pdf.service';

describe('CopilotoPdfService', () => {
  let service: CopilotoPdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CopilotoPdfService],
    }).compile();

    service = module.get<CopilotoPdfService>(CopilotoPdfService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
