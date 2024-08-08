import { User } from "src/user/entities/user.entity"
import { Image } from "./entities/image.entity"
import { Tag } from "src/tag/entities/tag.entity"
import { Category } from "src/category/entities/category.entity"
import { Post } from "src/post/entities/post.entity"
import { Group } from "src/group/entities/group.entity"

export type EntityType = User | Image | Tag | Category | Post | Group
export type resType = "User" | "Image" | "Tag" | "Category" | "Post" | "Group"

export const Models = {
    User, Image, Tag, Category, Post, Group
}