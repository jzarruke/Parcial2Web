import { Test, TestingModule } from '@nestjs/testing';
import { ParkingSpotsController } from './parking-spots.controller.js';
import { ParkingSpotsService } from './parking-spots.service.js';

describe('ParkingSpotsController', () => {
  let controller: ParkingSpotsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParkingSpotsController],
      providers: [ParkingSpotsService],
    }).compile();

    controller = module.get<ParkingSpotsController>(ParkingSpotsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
