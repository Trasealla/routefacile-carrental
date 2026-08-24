import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserForgotPassword } from 'src/entities/user.forgot.password.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class UserForgotPasswordService extends BaseService<UserForgotPassword> {

    constructor(@InjectRepository(UserForgotPassword) private userForgotPasswordReo: Repository<UserForgotPassword>) {
        super(userForgotPasswordReo)
    }
}
