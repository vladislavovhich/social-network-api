import { Post } from "src/post/entities/post.entity";
import { User } from "src/user/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('views')
export class View {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.views)
    viewer: User

    @ManyToOne(() => Post, (post) => post.views)
    post: Post

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
