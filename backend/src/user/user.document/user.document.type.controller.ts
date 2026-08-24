import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserDocumentSetTypes } from 'src/entities/enums/user.document.set.type';
import { UserDocumentTypes } from 'src/entities/enums/user.document.type';

@ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Bearer token',
})
@ApiTags('user')
@UseGuards(JwtAuthGuard)
@Controller('user/documents')
export class UserDocumentTypeController {
    
    @Get('doc_type')
    async docTypeListing() {
        return [
            UserDocumentTypes.CITIES_ID,
            UserDocumentTypes.GCC_ID,

            UserDocumentTypes.DRVING_LICENSE,
            UserDocumentTypes.DRVING_LICENSE_GCC,
            UserDocumentTypes.DRVING_LICENSE_HOME_COUNTRY,
            UserDocumentTypes.INTERNATIONAL_DRIVING_LICENSE,
            UserDocumentTypes.TRANSLATION_OF_DRIVING_LICENSE,

            UserDocumentTypes.TOURIST_VISA,
            UserDocumentTypes.PASSPORT,
            UserDocumentTypes.ENTRY_STAMP,
        ]
    }

    @Get('set_type')
    async docSetTypeListing() {
        return [
            UserDocumentSetTypes.UAE_RESIDENT,
            UserDocumentSetTypes.NON_RESIDENT_GCC,
            UserDocumentSetTypes.NON_RESIDENT_OTHER
        ]
    }
}
