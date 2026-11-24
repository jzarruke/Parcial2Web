import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParkingSpotsService } from './parking-spots.service.js';
import { CreateParkingSpotDto } from './dto/create-parking-spot.dto.js';
import { UpdateParkingSpotDto } from './dto/update-parking-spot.dto.js';

@Controller('parking-spots')
export class ParkingSpotsController {
  constructor(private readonly parkingSpotsService: ParkingSpotsService) {}

  @Post()
  create(@Body() createParkingSpotDto: CreateParkingSpotDto) {
    return this.parkingSpotsService.create(createParkingSpotDto);
  }

  @Get()
  findAll() {
    return this.parkingSpotsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parkingSpotsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParkingSpotDto: UpdateParkingSpotDto) {
    return this.parkingSpotsService.update(+id, updateParkingSpotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parkingSpotsService.remove(+id);
  }
}
