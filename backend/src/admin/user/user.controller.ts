import { Controller, Post, Res, HttpException, HttpStatus, UseInterceptors, Get, Inject, Query, Param, Put, Body, NotFoundException, BadRequestException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { Response } from 'express';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';
import * as bcrypt from 'bcrypt';
import { ApiExcludeController } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { UpdateUserDto } from './update.user.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/user')
export class UserController {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @Inject(UserService) private userService: UserService
    ) { }

    @Post('import')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
        const stream = Readable.from(file.buffer);
        const results = [];
        stream
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    const chunkSize = 500; // Define your chunk size
                    for (let i = 0; i < results.length; i += chunkSize) {
                        const users_chunk: User[] = [];
                        for (let j = i; j < i + chunkSize && j < results.length; j++) {
                            const row = results[j];
                            const user = new User();
                           // user.id = row.id;
                            user.first_name = row.user_name;
                            user.last_name = row.user_lastname;
                            user.dob = row.user_dob;
                            user.email = row.user_email;
                            user.password = await bcrypt.hash(row.p, 10);
                            user.password_org = row.p;
                            user.gender = (row.gender == 1) ? 'male' : 'female';
                            user.phone_code = row.user_country_code;
                            user.phone_number = row.user_mobile;
                            user.alt_phone_code = row.user_alt_country_code;
                            user.alt_phone_number = row.user_alt_mobile;
                            user.status = (row.status == 1) ? 1 : 0;
                            user.house_number = row.bill_address_line_1;
                            user.street_name = row.bill_address_line_2;
                            user.state = row.bill_state;
                            user.city = row.bill_city;
                            user.zip_code = row.bill_zipcode;
                            user.last_login_at = row.last_login_date ? new Date(row.last_login_date) : null;
                            user.country_id = row.country_id;
                            users_chunk.push(user);
                        }
                        await this.userRepository.insert(users_chunk);
                    }

                    res.json({ message: 'Users imported successfully' });
                } catch (error) {
                    console.error(error);
                    throw new HttpException('Failed to import users', HttpStatus.INTERNAL_SERVER_ERROR);
                }
            })
            .on('error', (error) => {
                console.error(error);
                res.status(500).json({ error: error.message });
            });
    }

    @Get()
    async listing(@Query() params: PaginationDto) {
        const select = [
            'id', 'first_name', 'last_name', 'email', 'gender', 'status', 'phone_code', 'phone_number'
        ]
        return await this.userService.getAll({}, select, {}, null, true, params.page, params.page_size);
    }

    // @Get(':id')
    // async detail(@Param('id') id: number) {
    //     const select = [
    //         'id', 'first_name', 'last_name', 'email', 'gender', 'status', 'phone_code', 'phone_number'
    //     ];
    //     const relations = {
    //         country: {
    //             columns: ['id', 'name_en']
    //         }
    //     };

    //     const user = await this.userService.getOne({ id }, select, relations);

    //     if (!user) {
    //         throw new NotFoundException();
    //     }
    //     return user;
    // }

    // @Put(':id')
    // async update(@Param('id') id: number, @Body() body: UpdateUserDto) {

    //     const user = await this.userService.getOne({ id });

    //     if (!user) {
    //         throw new NotFoundException();
    //     }

    //     const phone_where = { phone_number: body.phone_number, id: Not(user.id) }

    //     const phone_number_unique_check = await this.userService.getAll(phone_where, ['id']);
    //     if (phone_number_unique_check.data.length > 0) {
    //         throw new BadRequestException('Phone number must be unique');
    //     }

    //     const email_where = { email: body.email, id: Not(user.id) }

    //     const email_unique_check = await this.userService.getAll(email_where, ['id']);
    //     if (email_unique_check.data.length > 0) {
    //         throw new BadRequestException('Email must be unique');
    //     }

    //     return await this.userService.update({ id }, body);
    // }
}