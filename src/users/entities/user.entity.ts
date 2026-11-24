import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../roles/entities/role.entity.js';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ unique: true })
    email: string;
    @Exclude()
    @Column()
    password: string;
    @Column({ nullable: true })
    name: string;
    @Column({ nullable: true })
    phone?: string;
    @Column({ default: true })
    is_active: boolean;
    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
    @ManyToMany(() => Role)
    @JoinTable({
        name: 'user_roles',
        joinColumn: {name: 'user_id'},
        inverseJoinColumn: {name: 'role_id'}
    })
    roles: Role[];
}
