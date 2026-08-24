import { BadRequestException, Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { CreateBrokerDto, UpdateBrokerDto, BrokerFilterDto } from './broker.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import * as bcrypt from 'bcrypt';

const stripPassword = (broker: any) => {
    if (!broker) return broker;
    const { password_hash, ...rest } = broker;
    return rest;
};

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/broker')
export class BrokerController {
    constructor(
        @Inject(BrokerService) private brokerService: BrokerService
    ) { }

    @Get()
    async listing(@Query() params: BrokerFilterDto) {
        const page = params.page || 1;
        const page_size = params.page_size || 10;

        const result = await this.brokerService.getAllFiltered(params.search, params.status, page, page_size);

        return {
            data: result.data.map(stripPassword),
            total_records: result.total_records
        };
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const broker = await this.brokerService.getOne({ id });

        if (broker) {
            return stripPassword(broker);
        }

        throw new NotFoundException();
    }

    @Post()
    async store(@Body() body: CreateBrokerDto, @Request() req) {
        const existing = await this.brokerService.findByUsername(body.username);
        if (existing) {
            throw new BadRequestException('username already exists.');
        }

        const password_hash = await bcrypt.hash(body.password, 10);

        const result = await this.brokerService.insert({
            name: body.name,
            username: body.username,
            password_hash,
            contact_email: body.contact_email,
            status: 1,
            created_by: req.user.id
        });

        return result;
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: UpdateBrokerDto, @Request() req) {
        const broker = await this.brokerService.getOne({ id });

        if (!broker) {
            throw new NotFoundException();
        }

        const updateData: any = {
            updated_by: req.user.id
        };

        if (body.name !== undefined) updateData.name = body.name;
        if (body.contact_email !== undefined) updateData.contact_email = body.contact_email;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.password) updateData.password_hash = await bcrypt.hash(body.password, 10);

        return await this.brokerService.update({ id }, updateData);
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req) {
        const broker = await this.brokerService.getOne({ id });

        if (broker) {
            await this.brokerService.update({ id }, { deleted_by: req.user.id });
            return await this.brokerService.softDelete({ id });
        }

        throw new NotFoundException();
    }
}
