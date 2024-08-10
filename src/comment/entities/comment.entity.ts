import { Post } from "src/post/entities/post.entity";
import { User } from "src/user/entities/user.entity";
import { Vote } from "src/vote/entities/vote.entity";
import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Entity, Tree, TreeChildren, TreeParent, JoinTable, ManyToMany } from "typeorm";

@Entity('comments')
@Tree("closure-table")
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @ManyToOne(() => User, (user) => user.comments, {eager: true})
    commenter: User

    @ManyToOne(() => Post, (post) => post.comments)
    post: Post

    @ManyToMany(() => Vote)
    @JoinTable({name: "comments_votes"})
    votes: Vote[]

    @TreeChildren()
    children: Comment[]

    @TreeParent()
    parent: Comment

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    rating: number
}
