import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { UserDocumentDto } from './user.document.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'counter')
@Controller('admin/user/document')
export class UserDcoumentController {
    constructor(
        @Inject(UserService) private userService: UserService,
    ) { }

    @Get()
    async listing(@Query() params: UserDocumentDto) {
        const path = `${process.env.FILE_SERVER}/user/`;

        const page = params.page ?? 1;
        const page_size = params.page_size ?? 10;


        let where = `WHERE ud.deleted_at is null `;

        if (params.user_email) {
            where += `AND u.email like '${params.user_email}%'`
        }

        const query = `
                    SELECT 
                        u.id,
                        u.email,
                        concat(u.first_name, ' ' , u.last_name) AS user_name,
                        concat(u.phone_code, ' ' , u.phone_number) AS phone,
                        concat('[', GROUP_CONCAT(
                            CONCAT('{"doc_type": "', ud.doc_type, '", "front_image": "', concat('${path}', ud.user_id, '/', ud.front_image), '"}')
                            ORDER BY ud.id SEPARATOR ', '
                        ), ']') AS documents
                    FROM users u
                    JOIN user_documents ud ON u.id = ud.user_id
                    ${where}
                    GROUP BY u.id, u.email`

        const record_query = `${query} ORDER BY u.id ASC LIMIT ${page_size} OFFSET ${page_size * (page - 1)}`

        const result = await this.userService.executeRawQuery(record_query);

        const count_result = await this.userService.executeRawQuery(query);

        return {
            data: result,
            total_records: count_result.length
        }
    }

}
