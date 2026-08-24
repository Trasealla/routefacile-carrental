import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

@Injectable()
export class UserService extends BaseService<User> {

    static OTP_EXPIRY_HOURS = 4;
    generateOTPExpiry() {

        const date = new Date();
        date.setHours(date.getHours() + UserService.OTP_EXPIRY_HOURS);

        return date;
    }

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ) {
        super(userRepository);
    }

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000);
    }

    generateRegisterUserOtp(): number {
        return this.generateOTP();;
    }
}
