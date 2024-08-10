import { Exclude } from 'class-transformer';
import { Category } from 'src/category/entities/category.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Group } from 'src/group/entities/group.entity';
import { Image } from 'src/image/entities/image.entity';
import { Post } from 'src/post/entities/post.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { View } from 'src/view/entities/view.entity';
import { Vote } from 'src/vote/entities/vote.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string

  @Exclude()
  @Column()
  password: string;

  @ManyToMany(() => Image, {eager: true, onDelete: "SET NULL"})
  @JoinTable({name: "users_images"})
  images: Image[]

  @OneToMany(() => View, (view) => view.viewer, {onDelete: "SET NULL"})
  views: View[]

  @OneToMany(() => Comment, (comment) => comment.commenter, {onDelete: "SET NULL"})
  comments: Comment[]

  @OneToMany(() => Vote, (vote) => vote.voter, {onDelete: "SET NULL"})
  votes: Vote[]

  @Column({ type: 'date', default: () => "CURRENT_TIMESTAMP"})
  birthDate: Date

  @Exclude()
  @Column({nullable: true})
  token: string;
 
  @OneToMany(() => Tag, (tag) => tag.owner, {onDelete: "SET NULL"})
  tags: Tag[]

  @OneToMany(() => Category, (category) => category.owner, {onDelete: "SET NULL"})
  categories: Category[]

  @OneToMany(() => Post, (post) => post.publisher, {onDelete: "SET NULL"})
  posts: Post[]

  @ManyToMany(() => Group, (group) => group.subscribers, {onDelete: "SET NULL"})
  groups: Group[]

  @OneToMany(() => Group, (group) => group.admin)
  groupsAdmin: Group[]

  @Column('boolean', {default: false})
  isVerified: boolean
  
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}