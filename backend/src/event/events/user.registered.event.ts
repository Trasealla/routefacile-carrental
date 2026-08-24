export class UserRegisteredEvent {
    constructor(public readonly user_id: number, public readonly classic: boolean) { }
}