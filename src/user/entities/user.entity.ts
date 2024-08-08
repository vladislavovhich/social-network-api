import { Category } from 'src/category/entities/category.entity';
import { Group } from 'src/group/entities/group.entity';
import { Post } from 'src/post/entities/post.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
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

  @OneToMany(() => Tag, (tag) => tag.owner)
  tags: Tag[]

  @OneToMany(() => Category, (category) => category.owner)
  categories: Category[]

  @OneToMany(() => Post, (post) => post.publisher)
  posts: Post[]

  @ManyToMany(() => Group, (group) => group.subscribers)
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