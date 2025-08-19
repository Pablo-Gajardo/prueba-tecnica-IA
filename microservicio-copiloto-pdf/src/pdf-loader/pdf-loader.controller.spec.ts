import { Test, TestingModule } from '@nestjs/testing';
import { PdfLoaderController } from './pdf-loader.controller';

describe('PdfLoaderController', () => {
  let controller: PdfLoaderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfLoaderController],
    }).compile();

    controller = module.get<PdfLoaderController>(PdfLoaderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
