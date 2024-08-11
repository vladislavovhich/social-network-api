export class VoteOperationDto {
    voterId: number
    value: -1 | 1

    constructor(voter: number, value: -1 | 1) {
        this.voterId = voter
        this.value = value
    }
}
