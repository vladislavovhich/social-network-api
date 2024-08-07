import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string

  @Column()
  password: string;

  @Column({ type: 'date', default: () => "CURRENT_TIMESTAMP"})
  birthDate: Date

  @Column({nullable: true})
  token: string;

  @Column('boolean', {default: false})
  isVerified: boolean
  
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}