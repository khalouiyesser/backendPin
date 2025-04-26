import { Test, TestingModule } from '@nestjs/testing';
import { SurplusService } from './surplus.service';

describe('SurplusService', () => {
  let service: SurplusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SurplusService],
    }).compile();

    service = module.get<SurplusService>(SurplusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
