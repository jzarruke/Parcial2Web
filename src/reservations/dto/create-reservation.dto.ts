import { IsDate, IsEnum, IsString } from "class-validator";
import { ChargerType } from "../../parking-spots/entities/parking-spot.entity.js";
import { Status } from "../entities/reservation.entity.js";

export class CreateReservationDto {
    @IsString()
    id_user: string;
    @IsString()
    id_spot: string;
    @IsDate()
    date: Date;
    @IsString()
    vehicle_plate: string;
    @IsEnum(ChargerType)
    vehicle_max_charge: ChargerType;
    @IsEnum(Status)
    status: Status;
}
