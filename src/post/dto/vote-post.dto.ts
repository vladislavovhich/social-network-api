export class VotePostDto {
    postId: number
    userId: number
    value: 1 | -1

    constructor(postId: number, userId: number, value: 1 | -1) {
        this.postId = postId
        this.userId = userId
        this.value = value
    }
}