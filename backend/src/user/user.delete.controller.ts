import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Inject, Param, Post, Request, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';

import {  ApiHeader, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Bearer token',
})
@ApiTags('user')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserDeleteController {

    constructor(
        @Inject(UserService) private userService: UserService,
    ) { }


    @Delete('delete')
    async delete(@Request() req, @Res() response) {

        const where = {id: req.user.id}
        const user = await this.userService.getOne(where, ['id']);
        if (user) {
            await this.userService.softDelete(where);
            await this.userService.update(where, {status: 0});

            response.status(204).send()

            return; 
        }
        throw new BadRequestException('User not found');
    }
}
