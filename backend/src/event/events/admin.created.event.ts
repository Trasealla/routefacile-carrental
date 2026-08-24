export class AdminCreatedEvent {
    constructor(
        public readonly admin_id: number,
        public readonly temp_password: string
    ) { }
}
