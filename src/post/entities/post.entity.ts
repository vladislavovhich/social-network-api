import { Tag } from "src/tag/entities/tag.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinTable, ManyToMany } from "typeorm";

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @ManyToMany(() => Tag, (tag) => tag.posts)
    @JoinTable({name: "posts_tags"})
    tags: Tag[]

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}