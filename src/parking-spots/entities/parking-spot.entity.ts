import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity.js";
import { Reservation } from "../../reservations/entities/reservation.entity.js";

export enum ChargerType {
    STANDARD = 'standard',
    FAST = 'fast',
    ULTRA_FAST = 'ultra_fast'
}

@Entity({ name: 'parking_spots' })
export class ParkingSpot {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ unique: true, nullable: false })
    code: string;
    @Column({ nullable: false, enum: ChargerType })
    charger_type: ChargerType;
    @ManyToOne(() => User, (user) => user.id)
    id_supervisor: string;
    @CreateDateColumn({ type: 'timestamptz', default: Date.now() })
    created_at: Date;
    @OneToMany(() => Reservation, (reservations) => reservations)
    reservations: Reservation[];
}
