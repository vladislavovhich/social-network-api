import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity('images')
export class Image {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string

    @Column()
    ownerType: string

    @Column()
    ownerId: number
}
