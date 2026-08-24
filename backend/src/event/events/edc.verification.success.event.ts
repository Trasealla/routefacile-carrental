export class EdcVerificationSuccessEvent {
    constructor(
        public readonly verification_id: number,
        public readonly student_id: string,
        public readonly full_name: string,
        public readonly email: string,
        public readonly promo_code: string
    ) { }
}







