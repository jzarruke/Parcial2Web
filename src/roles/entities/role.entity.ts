import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'roles' })
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ unique: true })
    role_name: string;
    @Column({ nullable: true })
    description: string;
    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
}
