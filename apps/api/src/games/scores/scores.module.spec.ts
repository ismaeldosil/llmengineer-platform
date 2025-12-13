import { Test, TestingModule } from '@nestjs/testing';
import { ScoresModule } from './scores.module';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ScoresModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ScoresModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        gameScore: {
          create: jest.fn(),
          findMany: jest.fn(),
          findFirst: jest.fn(),
          findUnique: jest.fn(),
          count: jest.fn(),
          delete: jest.fn(),
        },
        $queryRawUnsafe: jest.fn(),
      })
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have ScoresController', () => {
    const controller = module.get<ScoresController>(ScoresController);
    expect(controller).toBeDefined();
  });

  it('should have ScoresService', () => {
    const service = module.get<ScoresService>(ScoresService);
    expect(service).toBeDefined();
  });

  it('should export ScoresService', () => {
    const service = module.get<ScoresService>(ScoresService);
    expect(service).toBeInstanceOf(ScoresService);
  });
});
