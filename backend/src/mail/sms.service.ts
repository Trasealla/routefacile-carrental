import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { SmsResponse } from 'src/entities/sms.response.entity';
import { catchError, map } from 'rxjs';

@Injectable()
export class SmsService {
  constructor(
    private httpService: HttpService,
    @InjectRepository(SmsResponse) private smsResponseRepository: Repository<SmsResponse>
  ) {
  }

  async send(
    code: string,
    number: string,
    content: string,
    subject: string,
    reference_number = null
  ) {
    // SMS sending is gated by SMS_ENABLED env flag. Keep the code path
    // intact (templates, callers, audit row) but short-circuit the actual
    // HTTP call when disabled so no real messages leave the box.
    if (process.env.SMS_ENABLED !== 'true') {
      try {
        const smsResponse = this.smsResponseRepository.create({
          to: `${code}${number}`,
          subject: subject,
          content: content,
          reference_number: reference_number,
          response: 'SMS disabled (SMS_ENABLED=false)',
          status: 0,
        });
        await this.smsResponseRepository.save(smsResponse);
      } catch (auditErr) {
        console.warn('SMS disabled audit write failed:', auditErr?.message || auditErr);
      }
      return;
    }
    try {
      const profile_id = process.env.SMS_PROFILE_ID;
      const password = process.env.SMS_PASSWORD;
      const sender_id = process.env.SMS_SENDER_ID;
      const base_url = process.env.SMS_URL;

      if (code == "971" || code.indexOf("971") > 0) {
        const url = `${base_url}?user=${profile_id}&pwd=${password}&senderid=${sender_id}&CountryCode=${code}&mobileno=${number}&msgtext=${content}`;

        const response = await this.httpService
          .get(url)
          .pipe(
            map((res) => res.data),
            catchError((error) => {
              console.error('Error sending sms:', error);
              throw error;
            }),
          )
          .toPromise();
        const smsResponse = this.smsResponseRepository.create({
          to: `${code}${number}`,
          subject: subject,
          content: content,
          reference_number: reference_number,
          response: JSON.stringify(response),
          status: 1,
        });

        await this.smsResponseRepository.save(smsResponse);
      } else {
        const smsResponse = this.smsResponseRepository.create({
          to: `${code}${number}`,
          subject: subject,
          content: content,
          reference_number: reference_number,
          response: 'Non UAE',
          status: 0
        });

        await this.smsResponseRepository.save(smsResponse);
      }

    } catch (error) {
      console.error('Error sending sms:', error);
      throw new Error(error);
    }
  }
}
