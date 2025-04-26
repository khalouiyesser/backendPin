import { Test, TestingModule } from '@nestjs/testing';
import { SurplusController } from './surplus.controller';
import { SurplusService } from './surplus.service';

describe('SurplusController', () => {
  let controller: SurplusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurplusController],
      providers: [SurplusService],
    }).compile();

    controller = module.get<SurplusController>(SurplusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
