export class CareerJobApplicationStatusChangedEvent {
    constructor(
        public readonly application_id: number,
        public readonly previous_status: number,
        public readonly new_status: number,
    ) { }
}
