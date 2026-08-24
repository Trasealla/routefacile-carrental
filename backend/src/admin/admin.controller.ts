import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Inject, NotFoundException, Param, ParseIntPipe, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { CreateAdminDto } from './dto/create.admin.dto';
import { HR_STAFF_TYPES, CreateHrStaffDto, HrStaffFilterDto, HrStaffResetPasswordDto, HrStaffStatusDto, UpdateHrStaffDto } from './dto/hr.staff.dto';
import { AdminService } from './admin.service';
import { AdminTypes } from 'src/entities/enums/admin.type';
import * as bcrypt from 'bcrypt';
import { ApiExcludeController } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdminCreatedEvent } from 'src/event/events/admin.created.event';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import * as crypto from 'crypto';
import { In, IsNull, Like, Not } from 'typeorm';
import { PaginationDto } from 'src/dtos/pagination.dto';

@ApiExcludeController()
@Controller()
export class AdminController {

    constructor(
        @Inject(AdminService) private adminService: AdminService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    @Post()
    async store(@Body() body: CreateAdminDto) {
        body.status = AdminService.INACTIVE;
        body.type = AdminTypes.ADMIN;
        body.password = await bcrypt.hash(body.password, 10);

        return await this.adminService.insert(body);
    }

    @UseGuards(AdminJwtAuthGuard, RolesGuard)
    @Roles(AdminTypes.ADMIN, AdminTypes.HR_MANAGER)
    @Post('hr')
    async createHrAdmin(@Body() body: CreateHrStaffDto, @Request() req: any) {
        // Whitelist the type. HR_MANAGER must not be able to create global ADMINs.
        const requestedType = (body.type as AdminTypes) || AdminTypes.HR_RECRUITMENT;
        if (!HR_STAFF_TYPES.includes(requestedType as any)) {
            throw new BadRequestException(
                `type must be one of: ${HR_STAFF_TYPES.join(', ')}`,
            );
        }

        const useProvidedPassword = !!body.password;
        const rawPassword = body.password || crypto.randomBytes(4).toString('hex').toUpperCase() + '@1';
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Upsert by email: if an admin already exists with this email,
        // update their record (assign HR role, reset password, force reset on next login)
        // and resend the welcome email instead of failing with a duplicate-key error.
        // Include soft-deleted rows so a previously deleted user can be restored
        // (the MySQL unique index on email does NOT ignore soft-deleted rows).
        const existing = await this.adminService.findByEmailWithDeleted(body.email);
        let adminId: number;
        let upgraded = false;

        if (existing) {
            if ((existing as any).deleted_at) {
                await this.adminService.restoreAdmin(existing.id);
            }
            await this.adminService.update(existing.id, {
                first_name: body.first_name,
                last_name: body.last_name,
                country_code: body.country_code,
                phone_number: body.phone_number,
                type: requestedType,
                password: hashedPassword,
                status: AdminService.ACTIVE,
                must_reset_password: useProvidedPassword ? 0 : 1,
                updated_by: req.user?.id ?? null,
            } as any);
            adminId = existing.id;
            upgraded = true;
        } else {
            const result = await this.adminService.insert({
                first_name: body.first_name,
                last_name: body.last_name,
                email: body.email,
                country_code: body.country_code,
                phone_number: body.phone_number,
                type: requestedType,
                password: hashedPassword,
                status: AdminService.ACTIVE,
                created_by: req.user?.id ?? null,
                must_reset_password: useProvidedPassword ? 0 : 1,
            } as any);

            if (result.status === 'error') {
                return result;
            }
            adminId = result.response.id;
        }

        if (!useProvidedPassword) {
            this.eventEmitter.emit('admin.created', new AdminCreatedEvent(adminId, rawPassword));
        }

        return {
            error: false,
            message: upgraded
                ? 'Existing user upgraded to HR role. A welcome email with the new temporary password has been sent.'
                : 'HR admin created successfully. A welcome email with temporary credentials has been sent.',
            admin: {
                id: adminId,
                email: body.email,
                type: requestedType,
                upgraded,
            }
        };
    }

    @UseGuards(AdminJwtAuthGuard, RolesGuard)
    @Roles(AdminTypes.ADMIN, AdminTypes.HR_MANAGER)
    @Post('hr/send-welcome-email')
    async sendWelcomeEmail(@Body() body: { email: string }) {
        if (!body.email) {
            throw new BadRequestException('Email is required');
        }

        const admin = await this.adminService.getOne({ email: body.email });

        if (!admin) {
            throw new BadRequestException('Admin not found with this email');
        }

        if (![AdminTypes.HR_RECRUITMENT, AdminTypes.HR_MANAGER].includes(admin.type as AdminTypes)) {
            throw new BadRequestException('Welcome email can only be sent to HR portal users');
        }

        const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase() + '@1';
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        await this.adminService.update({ id: admin.id }, {
            password: hashedPassword,
            must_reset_password: 1,
        });

        this.eventEmitter.emit('admin.created', new AdminCreatedEvent(admin.id, tempPassword));

        return {
            error: false,
            message: `Welcome email sent to ${admin.email} with new temporary credentials.`,
        };
    }

    /* ---------------------------------------------------------------- */
    /*  HR Staff Management (HR Manager dashboard)                       */
    /* ---------------------------------------------------------------- */

    /** List HR staff (paginated). HR_MANAGER only sees HR types. */
    @UseGuards(AdminJwtAuthGuard, RolesGuard)
    @Roles(AdminTypes.ADMIN, AdminTypes.HR_MANAGER)
    @Get('hr')
    async listHrStaff(
        @Query() pagination: PaginationDto,
        @Query() filter: HrStaffFilterDto,
    ) {
        return this.adminService.listHrStaff({
            types: HR_STAFF_TYPES as unknown as string[],
            type: filter.type,
            status: filter.status,
            search: filter.search,
            page: pagination.page || 1,
            page_size: pagination.page_size || 10,
        });
    }

    /** Detail of one HR staff record. */
    @UseGuards(AdminJwtAuthGuard, RolesGuard)
    @Roles(AdminTypes.ADMIN, AdminTypes.HR_MANAGER)
    @Get('hr/:id')
    async detailHrStaff(@Param('id', ParseIntPipe) id: number) {
        const admin = await this.adminService.getOne({ id });
        if (!admin) throw new NotFoundException('HR staff not found');
        if (!HR_STAFF_TYPES.includes(admin.type as any)) {
            throw new ForbiddenException('Not an HR staff record');
        }
        // Strip password before returning.
        const { password, ...safe } = admin as any;
        return safe;
    }

    /** Update HR staff profile (does not change password). */
    @UseGuards(AdminJwtAuthGuard, RolesGuard)
    @Roles(AdminTypes.ADMIN, AdminTypes.HR_MANAGER)
    @Put('hr/:id')
    async updateHrStaff(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateHrStaffDto,
        @Request() req: any,
    ) {
        const existing = await this.adminService.getOne({ id });
        if (!existing) throw new NotFoundException('HR staff not found');
        if (!HR_STAFF_TYPES.includes(existing.type as any)) {
            throw new ForbiddenException('Not an HR staff record');
        }
        if (body.type && !HR_STAFF_TYPES.includes(body.type as any)) {
            throw new BadRequestException(
                `type must be one of: ${HR_STAFF_TYPES.join(', ')}`,
            );
        }
        if (body.email && body.email !== existing.email) {
            const dup = await this.adminService.getOne({ email: body.email });
            if (dup && dup.id !== id) {
                throw new BadRequestException('Email already in use');
            }
        }
        await this.adminService.update({ id }, {
            ...body,
            updated_by: req.user?.id ?? null,
        } as any);
        return { error: false, message: 'HR staff updated successfully' };
    }

    /** Activate / deactivate an HR staff member. */
    @UseGuards(AdminJwtAuthGuard, RolesGuard)
    @Roles(AdminTypes.ADMIN, AdminTypes.HR_MANAGER)
    @Patch('hr/:id/status')
    async updateHrStaffStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: HrStaffStatusDto,
        @Request() req: any,
    ) {
        const existing = await this.adminService.getOne({ id });
        if (!existing) throw new NotFoundException('HR staff not found');
        if (!HR_STAFF_TYPES.includes(existing.type as any)) {
            throw new ForbiddenException('Not an HR staff record');
        }
        if (req.user?.id === id && body.status === 0) {
            throw new BadRequestException('You cannot deactivate your own account');
        }
        await this.adminService.update({ id }, {
            status: body.status,
            updated_by: req.user?.id ?? null,
        } as any);
        return { error: false, message: 'Status updated', status: body.status };
    }

    /**
     * Reset an HR staff member's password. If `password` is omitted, a temp
     * password is generated and emailed; the user must change it on next login.
     */
    @UseGuards(AdminJwtAuthGuard, RolesGuard)
    @Roles(AdminTypes.ADMIN, AdminTypes.HR_MANAGER)
    @Post('hr/:id/reset-password')
    async resetHrStaffPassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: HrStaffResetPasswordDto,
        @Request() req: any,
    ) {
        const existing = await this.adminService.getOne({ id });
        if (!existing) throw new NotFoundException('HR staff not found');
        if (!HR_STAFF_TYPES.includes(existing.type as any)) {
            throw new ForbiddenException('Not an HR staff record');
        }

        const useProvided = !!body.password;
        const rawPassword = body.password || crypto.randomBytes(4).toString('hex').toUpperCase() + '@1';
        const hashed = await bcrypt.hash(rawPassword, 10);

        await this.adminService.update({ id }, {
            password: hashed,
            must_reset_password: useProvided ? 0 : 1,
            updated_by: req.user?.id ?? null,
        } as any);

        if (!useProvided) {
            this.eventEmitter.emit('admin.created', new AdminCreatedEvent(id, rawPassword));
        }

        return {
            error: false,
            message: useProvided
                ? 'Password updated successfully'
                : 'Temporary password generated and emailed to the user',
        };
    }

    /** Soft-delete an HR staff member. */
    @UseGuards(AdminJwtAuthGuard, RolesGuard)
    @Roles(AdminTypes.ADMIN, AdminTypes.HR_MANAGER)
    @Delete('hr/:id')
    async deleteHrStaff(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any,
    ) {
        const existing = await this.adminService.getOne({ id });
        if (!existing) throw new NotFoundException('HR staff not found');
        if (!HR_STAFF_TYPES.includes(existing.type as any)) {
            throw new ForbiddenException('Not an HR staff record');
        }
        if (req.user?.id === id) {
            throw new BadRequestException('You cannot delete your own account');
        }
        await this.adminService.update({ id }, {
            deleted_by: req.user?.id ?? null,
        } as any);
        await this.adminService.softDelete({ id });
        return { error: false, message: 'HR staff deleted successfully' };
    }
}
