import { BadRequestException, Body, Controller, Get, Inject, Param, Post, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UserRegisteredEvent } from 'src/event/events/user.registered.event';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { ForgotPasswordDto } from './dtos/forgot.password.dto';
import { RegisterUserDto } from './dtos/register.user.dto';
import { UserForgotPasswordService } from './user.forgot.password.service';
import { UserForgotPasswordEvent } from 'src/event/events/user.forgot.password.event';
import { ResetPasswordDto } from './dtos/reset.password.dto';
import { UserResetPasswordEvent } from 'src/event/events/user.reset.password.event';
import { RegisterUserClassicDto } from './dtos/register.user.classic.dto';
import { SimpleResetPasswordDto } from './dtos/simple.reset.password.dto';
import { AuthService } from 'src/auth/auth.service';


@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('auth')
@UseGuards(ApiKeyAuthGuard)
@Controller('user')
export class UserController {

    constructor(
        @Inject(UserService) private userService: UserService,
        @Inject(UserForgotPasswordService) private userForgotPasswordService: UserForgotPasswordService,
        @Inject(AuthService) private authService: AuthService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    @Post('register')
    async register(@Body() body: RegisterUserDto) {

        body.status = UserService.ACTIVE;
        // Auto-generate password if not provided (mobile app signup without password field)
        if (!body.password) {
            body.password = randomBytes(8).toString('hex');
        }
        const originalPassword = body.password;
        body.password_org = originalPassword;
        body.password = await bcrypt.hash(originalPassword, 10);
        const response = await this.userService.insert(body);
        if (response.status == UserService.SUCCESS) {
            this.eventEmitter.emit('user.registered', new UserRegisteredEvent(response.response.identifiers[0]?.id, false));
            
            // Return JWT token so mobile app can authenticate subsequent requests
            try {
                const userId = response.response.identifiers[0]?.id;
                const tokenData = await this.authService.login({ email: body.email, id: userId });
                return { ...response, ...tokenData };
            } catch (e) {
                console.error('[Register] JWT token generation failed:', e.message);
                return response;
            }
        }

        return response;
    }

    @Post('register/classic')
    async registerClassic(@Body() body: RegisterUserClassicDto) {

        body.status = UserService.INACTIVE;
        // Auto-generate password if not provided
        if (!body.password) {
            body.password = randomBytes(8).toString('hex');
        }
        const originalPassword = body.password;
        body.password_org = originalPassword;
        body.password = await bcrypt.hash(originalPassword, 10);
        body.register_otp = this.userService.generateRegisterUserOtp();
        const response = await this.userService.insert(body);

        if (response.status == UserService.SUCCESS) {
            this.eventEmitter.emit('user.registered', new UserRegisteredEvent(response.response.identifiers[0]?.id, true));
        }

        return response;
    }

    @Post('forgot/password')
    async forgotPassword(@Body() body: ForgotPasswordDto) {

        const where = { email: body.email }
        const user = await this.userService.getOne(where);
        if (user) {
            await this.userForgotPasswordService.update({ user_id: user.id }, { status: UserForgotPasswordService.INACTIVE })
            const obj = {
                otp: this.userService.generateOTP,
                otp_expiry: this.userService.generateOTPExpiry(),
                user_id: user.id,
                status: UserForgotPasswordService.ACTIVE
            }
            const response = await this.userForgotPasswordService.insert(obj);

            if (response.status == UserService.SUCCESS) {
                this.eventEmitter.emit('user.forgot.password', new UserForgotPasswordEvent(user.id));
            }

            return response;
        }

        throw new BadRequestException('User not found');
    }

    @Post('reset/password')
    async resetPassword(@Body() body: ResetPasswordDto) {

        const where = { email: body.email }
        const user = await this.userService.getOne(where);
        if (user) {
            const where = { user_id: user.id, status: UserForgotPasswordService.ACTIVE, otp: body.otp };
            const forgot_password_record = await this.userForgotPasswordService.getOne(where);

            if (forgot_password_record) {
                const user_where = { id: user.id };
                const user_update = { password: await bcrypt.hash(body.password, 10), password_org: body.password }

                const response = await this.userService.update(user_where, user_update);
                await this.userForgotPasswordService.update(where, { status: UserForgotPasswordService.INACTIVE })
                if (response.status == UserForgotPasswordService.SUCCESS) {
                    this.eventEmitter.emit('user.reset.password', new UserResetPasswordEvent(user.id));
                }
                return response;
            }
            throw new BadRequestException('Wrong OTP');
        }

        throw new BadRequestException('User not found');
    }

    @Post('reset/password/simple')
    async simpleResetPassword(@Body() body: SimpleResetPasswordDto) {
        const where = { email: body.email };
        const user = await this.userService.getOne(where);
        
        if (user) {
            const user_where = { id: user.id };
            const user_update = { 
                password: await bcrypt.hash(body.password, 10), 
                password_org: body.password 
            };

            const response = await this.userService.update(user_where, user_update);
            
            if (response.status == UserService.SUCCESS) {
                this.eventEmitter.emit('user.reset.password', new UserResetPasswordEvent(user.id));
            }
            
            return {
                success: true,
                message: 'Password reset successfully',
                user_id: user.id
            };
        }

        throw new BadRequestException('User not found');
    }

    // Mobile login - authenticates by email only (API key guard secures the endpoint)
    @Post('login/mobile')
    async loginMobile(@Body('email') email: string) {
        if (!email) {
            throw new BadRequestException('Email is required');
        }

        const user = await this.userService.getOne({ email });
        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (user.status !== UserService.ACTIVE) {
            throw new BadRequestException('User is not active');
        }

        // Auto-activate if needed
        if (user.register_otp) {
            await this.userService.update({ id: user.id }, { register_otp: null });
        }

        return this.authService.login(user);
    }
}
