import { BadRequestException, Body, Controller, Get, Inject, Param, Post, Put, Req, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserService } from '../user.service';
import { UserPersonalDetailDto } from '../dtos/user.personal.detail.dto';
import { Not } from 'typeorm';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto } from '../dtos/change.password.dto';
import { AuthService } from 'src/auth/auth.service';
import * as bcrypt from 'bcrypt';
import { UserAddressDto } from '../dtos/user.address.dto';


@UseGuards(JwtAuthGuard)
@ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Bearer token',
})
@ApiTags('user')
@Controller('user/profile')
export class UserProfileController {

    constructor(
        @Inject(UserService) private userService: UserService,
        @Inject(AuthService) private authService: AuthService
    ) {

    }


    @Put('details/:id')
    async update(@Param('id') id: number, @Body() body: UserPersonalDetailDto, @Request() req) {
        const email = req.user.email;
        const user_where = { id, email }
        const user_select = ['id'];

        const user = await this.userService.getOne(user_where, user_select);

        if (user) {
            const where = { phone_number: body.phone_number, id: Not(user.id) }

            const phone_number_unique_check = await this.userService.getAll(where, ['id']);
            if (phone_number_unique_check.data.length > 0) {
                throw new BadRequestException('Phone number must be unique');
            }

            const response = await this.userService.update({ id }, body);

            return response;
        }

        throw new BadRequestException('User not found');
    }


    @Get('details/:id')
    async getDetails(@Param('id') id: number, @Request() req) {
        const email = req.user.email;
        const where = { id, email }
        const select = ['id', 'first_name', 'last_name', 'email', 'phone_code', 'phone_number',
            'gender', 'alt_phone_code', 'alt_phone_number', 'dob', 'country_id', 'city_id'];

        const user = await this.userService.getOne(where, select);

        if (user) {
            return user;
        }

        throw new BadRequestException('User not found');
    }

    @Put('password/:id')
    async password(@Param('id') id: number, @Body() body: ChangePasswordDto, @Request() req) {

        const user = await this.authService.validateUser(req.user.email, body.current_password);
        if (user && user.id == id) {

            const user_where = { id: user.id };
            const user_update = { password: await bcrypt.hash(body.password, 10), password_org: body.password }

            return await this.userService.update(user_where, user_update);
        }

        throw new BadRequestException('User not found');
    }

    @Put('address/:id')
    async address(@Param('id') id: number, @Body() body: UserAddressDto, @Request() req) {
        const email = req.user.email;
        const user_where = { id, email };
        const user = await this.userService.getOne(user_where, ['id']);
        if (user) {
            return await this.userService.update(user_where, body);
        }

        throw new BadRequestException('User not found');
    }

    @Get('address/:id')
    async getAddress(@Param('id') id: number, @Request() req) {
        const email = req.user.email;
        const where = { id, email };
        const select = ['id', 'country_id', 'city_id', 'state', 'city', 'zip_code', 'house_number', 'street_name']
        const user = await this.userService.getOne(where, select);
        if (user) {
            return user;
        }

        throw new BadRequestException('User not found');
    }
}
