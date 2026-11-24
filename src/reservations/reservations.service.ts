import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation, Status } from './entities/reservation.entity.js';
import { Repository } from 'typeorm';
import { ChargerType, ParkingSpot } from '../parking-spots/entities/parking-spot.entity.js';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation) private readonly reservations: Repository<Reservation>,
    @InjectRepository(ParkingSpot) private readonly spots: Repository<ParkingSpot>,
  ) {
  }

  async create(createReservationDto: CreateReservationDto) {
    if (!this.verificarPlateFormat(createReservationDto.vehicle_plate)) throw new ConflictException('La placa dada no cumple el formato');
    const spot = await this.spots.findOne({ where: { id: createReservationDto.id_spot } });
    if (!spot) throw new NotFoundException('Puerto de carga no encontrado')
    if (!this.verificarMaxCharge(createReservationDto.vehicle_max_charge, spot.charger_type)) throw new ConflictException('Carga del puesto excede la modalidad de carga más potente que soporta el vehículo');
    if (!this.verificarFecha(createReservationDto.date))throw new ConflictException('No se puede reservar en una fecha pasada a hoy');
    return 'This action adds a new reservation';
  }

  async findAll() {
    try {
      return await this.reservations.find();
    } catch {
      throw new InternalServerErrorException('Error al obtener reservas');
    }
  }

  async updateEstado(id: string, state: Status) {
    const reservation = await this.reservations.findOne({ where: { id: id } });
    if (!reservation) throw new NotFoundException('Reserva no encontrada');
    if (!(reservation.status == Status.PENDING)) throw new ConflictException('No se puede cambiar una reserva con un estado diferente a Pendiente');
    return `This action updates a #${id} reservation`;
  }

  async remove(id: string) {
    const reservation = await this.reservations.findOne({ where: { id: id } });
    if (!reservation) throw new NotFoundException('Reserva no encontrada');
    return this.reservations.delete(reservation);
  }

  verificarPlateFormat(plate: string) {
    if (plate.length > 6) return false;
    if (Number(plate.slice(0, 3)) ||  !Number(plate.slice(3, 5))) return false;
    return true;
  }

  verificarMaxCharge(chargeType: ChargerType, chargerType: ChargerType) {
    if (chargeType == ChargerType.STANDARD && !(chargerType == ChargerType.STANDARD)) return false;
    if (chargeType == ChargerType.FAST && !(chargerType == ChargerType.STANDARD || chargerType == ChargerType.FAST))return false;
    return true;
  }

  verificarVigencia(spot: ParkingSpot) {
    const reservations = spot.reservations;
    reservations.forEach((res: Reservation) => {if (!(res.status == Status.CANCELLED)) return false});
    return true;
  }

  verificarFecha(date: Date) {
    const hoy = Date.now();
    if (date.toString() !== hoy.toString()) return false;
    return true;
  }
}
