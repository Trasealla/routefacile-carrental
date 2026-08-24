export class EdcEnquiryCreatedEvent {
    constructor(
        public readonly enquiry_id: number,
        public readonly name?: string,
        public readonly email?: string,
        public readonly edc_student_id?: string
    ) { }
}







