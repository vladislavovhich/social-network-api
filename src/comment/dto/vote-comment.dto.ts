export class VoteCommentDto {
    commentId: number
    userId: number
    value: 1 | -1

    constructor(commentId: number, userId: number, value: 1 | -1) {
        this.commentId = commentId
        this.userId = userId
        this.value = value
    }
}