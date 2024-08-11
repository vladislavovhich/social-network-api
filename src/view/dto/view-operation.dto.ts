export class ViewOperationDto {
    userId: number
    postId: number

    constructor(userId: number, postId: number) {
        this.userId = userId
        this.postId = postId
    }
}
