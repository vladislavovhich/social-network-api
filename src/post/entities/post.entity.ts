import { Group } from "src/group/entities/group.entity";
import { Tag } from "src/tag/entities/tag.entity";
import { User } from "src/user/entities/user.entity";
import { Image } from "src/image/entities/image.entity";
import { View } from "src/view/entities/view.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @ManyToMany(() => Image, {eager: true})
    @JoinTable({name: "posts_images"})
    images: Image[]

    @OneToMany(() => View, (view) => view.post)
    views: View[]

    @ManyToMany(() => Tag, (tag) => tag.posts)
    @JoinTable({name: "posts_tags"})
    tags: Tag[]

    @ManyToOne(() => User, (user) => user.posts, {eager: true})
    publisher: User

    @ManyToOne(() => Group, (group) => group.posts)
    group: Group

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}