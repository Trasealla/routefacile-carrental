import { BadRequestException, Body, Controller, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActiveUserDto } from './dtos/active.user.dto';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { UserActivatedEvent } from 'src/event/events/user.activated.event';

@ApiTags('auth')
@UseGuards(ApiKeyAuthGuard)
@Controller('user')
export class UserActiveController {

    constructor(
        @Inject(UserService) private userService: UserService,
        private readonly eventEmitter: EventEmitter2
    ) { }


    @Post('active/otp')
    async activate(@Body() body: ActiveUserDto) {

        const user = await this.userService.getOne({ register_otp: body.register_otp, status: UserService.INACTIVE });

        if (user) {
            const update = {
                register_otp: null,
                status: UserService.ACTIVE
            }

            const response = await this.userService.update({ id: user.id }, update)

            if (response.status == UserService.SUCCESS) {
                this.eventEmitter.emit('user.activated', new UserActivatedEvent(user.id));
            }

            return response
        }

        throw new BadRequestException('OTP is incorrect');
    }
}
