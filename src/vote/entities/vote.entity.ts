import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('votes')
export class Vote {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    value: number

    @ManyToOne(() => User, (user) => user.votes, {eager: true, onDelete: "SET NULL"})
    voter: User
    
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
