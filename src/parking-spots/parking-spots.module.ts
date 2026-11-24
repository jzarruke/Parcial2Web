import { Module } from '@nestjs/common';
import { ParkingSpotsService } from './parking-spots.service.js';
import { ParkingSpotsController } from './parking-spots.controller.js';

@Module({
  controllers: [ParkingSpotsController],
  providers: [ParkingSpotsService],
})
export class ParkingSpotsModule {}
