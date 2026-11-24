import { Injectable } from '@nestjs/common';
import { CreateParkingSpotDto } from './dto/create-parking-spot.dto.js';
import { UpdateParkingSpotDto } from './dto/update-parking-spot.dto.js';

@Injectable()
export class ParkingSpotsService {
  create(createParkingSpotDto: CreateParkingSpotDto) {
    return 'This action adds a new parkingSpot';
  }

  findAll() {
    return `This action returns all parkingSpots`;
  }

  findOne(id: number) {
    return `This action returns a #${id} parkingSpot`;
  }

  update(id: number, updateParkingSpotDto: UpdateParkingSpotDto) {
    return `This action updates a #${id} parkingSpot`;
  }

  remove(id: number) {
    return `This action removes a #${id} parkingSpot`;
  }
}
