import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity.js";
import { ParkingSpot, ChargerType } from "../../parking-spots/entities/parking-spot.entity.js";

export enum Status {
    PENDING = 'pending',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

@Entity({ name: 'reservations' })
export class Reservation {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @ManyToOne(() => User, (user) => user.id)
    id_user: string;
    @ManyToOne(() => ParkingSpot, (spot) => spot.id)
    id_spot: string;
    @Column({ nullable: false })
    date: Date;
    @Column({ nullable: false })
    vehicle_plate: string;
    @Column({ enum: ChargerType, nullable: false })
    vehicle_max_charge: ChargerType;
    @Column({ enum: Status, default: Status.PENDING })
    status: Status;
    @CreateDateColumn({ type: 'timestamptz', default: Date.now() })
    created_at: Date;
}