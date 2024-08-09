import { User } from "src/user/entities/user.entity";

export class VoteOperationDto {
    voter: User
    value: -1 | 1

    constructor(voter: User, value: -1 | 1) {
        this.voter = voter
        this.value = value
    }
}
