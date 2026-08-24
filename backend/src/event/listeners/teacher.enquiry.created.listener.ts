import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { EnquiryCreatedEvent } from '../events/enquiry.created.event';
import { MARKETING_RECEPIENT, TEACHER_ENQUIRY_RECPIENT_AUH, TEACHER_ENQUIRY_RECPIENT_AUH_CC, TEACHER_ENQUIRY_RECPIENT_DXB, TEACHER_ENQUIRY_RECPIENT_DXB_CC,  } from 'src/config/contants';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';
import { TeacherEnquiryService } from 'src/user.form/teacher.enquiry/teacher.enquiry.service';

@Injectable()
export class TeacherEnquiryCreatedListener {
    constructor(
        private readonly mailService: MailService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        @Inject(TeacherEnquiryService) private teacherEnquiryService: TeacherEnquiryService
    ) { }

    @OnEvent('teacher.enquiry.created')
    async handleEnquiryCreatedEvent(event: EnquiryCreatedEvent) {
        const select = ['id', 'name', 'email', 'details', 'phone_code', 'phone_number', 'car_id', 'city_id', 'duration'];
        const where = { id: event.enquiry_id };
        const relations = {
            car: {
                columns: ['id', 'name_en']
            },
            city: {
                columns: ['id', 'name_en']
            }
        };

        const teacher_enquiry = await this.teacherEnquiryService.getOne(where, select, relations, TeacherEnquiryService.LEFT_JOIN);
        const context = {
            teacher_enquiry: teacher_enquiry,
            file_server: process.env.FILE_SERVER,
            links: this.bookingRepoService.emailLinks()
        };

        await this.mailService.send(
            [1, 3, 6, 7].includes(teacher_enquiry.city_id) ? TEACHER_ENQUIRY_RECPIENT_DXB : TEACHER_ENQUIRY_RECPIENT_AUH,
            "Teacher Enquiry",
            'teacher_enquiry',
            context,
            [[1, 3, 6, 7].includes(teacher_enquiry.city_id) ? TEACHER_ENQUIRY_RECPIENT_DXB_CC : TEACHER_ENQUIRY_RECPIENT_AUH_CC, TEACHER_ENQUIRY_RECPIENT_AUH],
            teacher_enquiry.id
        )
    }
}
