import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiKeyJwtAuthGuard } from 'src/auth/guard/apikey-jwt-auth.gaurd';
import { GRecaptchResponseDto } from './google.recaptcha.dto';
import axios from 'axios';
import * as qs from 'qs';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('user-forms')
@UseGuards(ApiKeyJwtAuthGuard)
@Controller('google/recaptcha')
export class GoogleRecaptchaController {


    @ApiOperation({ summary: 'Validate g-recaptcha-response' })
    @Post('verify')
    async store(@Body() body: GRecaptchResponseDto) {

        const request = {
            secret: process.env.GOOGLE_RECAPTCHA_KEY,
            response: body.g_recaptcha_response
        }

        try {
            const response = await axios.post(
                process.env.GOOGLE_SITEVERIFY_LINK,
                qs.stringify(request),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new BadRequestException('Error validating reCAPTCHA');
        }
    }
}
