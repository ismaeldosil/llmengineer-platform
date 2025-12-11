import { Test } from '@nestjs/testing';
import { BadgesModule } from './badges.module';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';

describe('BadgesModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [BadgesModule],
    })
      .overrideProvider(BadgesService)
      .useValue({})
      .compile();

    expect(module).toBeDefined();
  });

  it('should provide BadgesService', async () => {
    const module = await Test.createTestingModule({
      imports: [BadgesModule],
    })
      .overrideProvider(BadgesService)
      .useValue({})
      .compile();

    const service = module.get(BadgesService);
    expect(service).toBeDefined();
  });

  it('should provide BadgesController', async () => {
    const module = await Test.createTestingModule({
      imports: [BadgesModule],
    })
      .overrideProvider(BadgesService)
      .useValue({})
      .compile();

    const controller = module.get(BadgesController);
    expect(controller).toBeDefined();
  });
});
