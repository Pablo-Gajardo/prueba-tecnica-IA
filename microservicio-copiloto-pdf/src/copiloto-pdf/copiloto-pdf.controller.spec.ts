import { Test, TestingModule } from '@nestjs/testing';
import { CopilotoPdfController } from './copiloto-pdf.controller';

describe('CopilotoPdfController', () => {
  let controller: CopilotoPdfController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CopilotoPdfController],
    }).compile();

    controller = module.get<CopilotoPdfController>(CopilotoPdfController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
