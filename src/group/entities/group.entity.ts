import { Category } from "src/category/entities/category.entity";
import { User } from "src/user/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinTable, ManyToMany } from "typeorm";

@Entity('groups')
export class Group {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column()
    description: string

    @ManyToMany(() => User, (user) => user.groups, {eager: true})
    @JoinTable({name: "users_groups"})
    subscribers: User[]

    @ManyToOne(() => User, (user) => user.groupsAdmin, {eager: true})
    admin: User

    @ManyToMany(() => Category, {eager: true})
    @JoinTable({name: "groups_categories"})
    categories: Category[]
    
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}