import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  BadRequestException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { TsdAvailabilityService } from './services/tsd.availability.service';
import { TsdReservationService } from './services/tsd.reservation.service';
import { TsdLocationService } from './services/tsd.location.service';
import { XmlService } from './services/xml.service';

@ApiTags('TSD XML API')
@ApiHeader({
  name: 'x-api-key',
  required: true,
  description: 'TSD API Key for authentication'
})
@ApiHeader({
  name: 'Content-Type',
  required: true,
  description: 'Must be application/xml or text/xml'
})
@UseGuards(ApiKeyAuthGuard)
@Controller('tsd')
export class TsdController {
  constructor(
    private readonly availabilityService: TsdAvailabilityService,
    private readonly reservationService: TsdReservationService,
    private readonly locationService: TsdLocationService,
    private readonly xmlService: XmlService
  ) {}

  /**
   * OTA_VehAvailRateRQ - Vehicle Availability Request
   * Returns available vehicles with rates for the specified rental period
   */
  @Post('OTA_VehAvailRateRQ')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vehicle Availability Search',
    description: 'Search for available vehicles with rates for specified pickup/return locations and dates'
  })
  @ApiBody({
    description: 'OTA_VehAvailRateRQ XML payload',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'OTA_VehAvailRateRS XML response with available vehicles'
  })
  async vehicleAvailability(
    @Body() xmlBody: string,
    @Res() res: Response,
    @Headers('content-type') contentType: string
  ): Promise<void> {
    this.validateXmlContentType(contentType);
    
    try {
      const request = this.xmlService.parseXml<any>(xmlBody);
      const otaRequest = request.OTA_VehAvailRateRQ;
      
      if (!otaRequest) {
        throw new BadRequestException('Invalid OTA_VehAvailRateRQ format');
      }

      const responseXml = await this.availabilityService.processAvailabilityRequest(otaRequest);
      
      res.set('Content-Type', 'application/xml');
      res.send(responseXml);
    } catch (error) {
      const errorXml = this.xmlService.buildErrorRS('OTA_VehAvailRateRS', [{
        code: error.status?.toString() || '500',
        type: 'System',
        message: error.message || 'Internal server error'
      }]);
      res.set('Content-Type', 'application/xml');
      res.status(error.status || 500).send(errorXml);
    }
  }

  /**
   * OTA_VehResRQ - Vehicle Reservation Request
   * Creates a new vehicle reservation
   */
  @Post('OTA_VehResRQ')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create Vehicle Reservation',
    description: 'Create a new vehicle reservation with customer and rental details'
  })
  @ApiBody({
    description: 'OTA_VehResRQ XML payload',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'OTA_VehResRS XML response with reservation confirmation'
  })
  async createReservation(
    @Body() xmlBody: string,
    @Res() res: Response,
    @Headers('content-type') contentType: string
  ): Promise<void> {
    this.validateXmlContentType(contentType);
    
    try {
      const request = this.xmlService.parseXml<any>(xmlBody);
      const otaRequest = request.OTA_VehResRQ;
      
      if (!otaRequest) {
        throw new BadRequestException('Invalid OTA_VehResRQ format');
      }

      const responseXml = await this.reservationService.processReservationRequest(otaRequest);
      
      res.set('Content-Type', 'application/xml');
      res.send(responseXml);
    } catch (error) {
      const errorXml = this.xmlService.buildErrorRS('OTA_VehResRS', [{
        code: error.status?.toString() || '500',
        type: 'System',
        message: error.message || 'Internal server error'
      }]);
      res.set('Content-Type', 'application/xml');
      res.status(error.status || 500).send(errorXml);
    }
  }

  /**
   * OTA_VehCancelRQ - Vehicle Cancellation Request
   * Cancels an existing vehicle reservation
   */
  @Post('OTA_VehCancelRQ')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel Vehicle Reservation',
    description: 'Cancel an existing vehicle reservation by confirmation ID'
  })
  @ApiBody({
    description: 'OTA_VehCancelRQ XML payload',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'OTA_VehCancelRS XML response with cancellation confirmation'
  })
  async cancelReservation(
    @Body() xmlBody: string,
    @Res() res: Response,
    @Headers('content-type') contentType: string
  ): Promise<void> {
    this.validateXmlContentType(contentType);
    
    try {
      const request = this.xmlService.parseXml<any>(xmlBody);
      const otaRequest = request.OTA_VehCancelRQ;
      
      if (!otaRequest) {
        throw new BadRequestException('Invalid OTA_VehCancelRQ format');
      }

      const responseXml = await this.reservationService.processCancelRequest(otaRequest);
      
      res.set('Content-Type', 'application/xml');
      res.send(responseXml);
    } catch (error) {
      const errorXml = this.xmlService.buildErrorRS('OTA_VehCancelRS', [{
        code: error.status?.toString() || '500',
        type: 'System',
        message: error.message || 'Internal server error'
      }]);
      res.set('Content-Type', 'application/xml');
      res.status(error.status || 500).send(errorXml);
    }
  }

  /**
   * OTA_VehModifyRQ - Vehicle Modification Request
   * Modifies an existing vehicle reservation
   */
  @Post('OTA_VehModifyRQ')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Modify Vehicle Reservation',
    description: 'Modify an existing vehicle reservation dates, vehicle, or locations'
  })
  @ApiBody({
    description: 'OTA_VehModifyRQ XML payload',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'OTA_VehModifyRS XML response with modification confirmation'
  })
  async modifyReservation(
    @Body() xmlBody: string,
    @Res() res: Response,
    @Headers('content-type') contentType: string
  ): Promise<void> {
    this.validateXmlContentType(contentType);
    
    try {
      const request = this.xmlService.parseXml<any>(xmlBody);
      const otaRequest = request.OTA_VehModifyRQ;
      
      if (!otaRequest) {
        throw new BadRequestException('Invalid OTA_VehModifyRQ format');
      }

      const responseXml = await this.reservationService.processModifyRequest(otaRequest);
      
      res.set('Content-Type', 'application/xml');
      res.send(responseXml);
    } catch (error) {
      const errorXml = this.xmlService.buildErrorRS('OTA_VehModifyRS', [{
        code: error.status?.toString() || '500',
        type: 'System',
        message: error.message || 'Internal server error'
      }]);
      res.set('Content-Type', 'application/xml');
      res.status(error.status || 500).send(errorXml);
    }
  }

  /**
   * OTA_VehLocSearchRQ - Vehicle Location Search Request
   * Searches for available pickup/dropoff locations
   */
  @Post('OTA_VehLocSearchRQ')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search Vehicle Locations',
    description: 'Search for available pickup and dropoff locations by city, name, or coordinates'
  })
  @ApiBody({
    description: 'OTA_VehLocSearchRQ XML payload',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'OTA_VehLocSearchRS XML response with matching locations'
  })
  async searchLocations(
    @Body() xmlBody: string,
    @Res() res: Response,
    @Headers('content-type') contentType: string
  ): Promise<void> {
    this.validateXmlContentType(contentType);
    
    try {
      const request = this.xmlService.parseXml<any>(xmlBody);
      const otaRequest = request.OTA_VehLocSearchRQ;
      
      if (!otaRequest) {
        throw new BadRequestException('Invalid OTA_VehLocSearchRQ format');
      }

      const responseXml = await this.locationService.processLocationSearchRequest(otaRequest);
      
      res.set('Content-Type', 'application/xml');
      res.send(responseXml);
    } catch (error) {
      const errorXml = this.xmlService.buildErrorRS('OTA_VehLocSearchRS', [{
        code: error.status?.toString() || '500',
        type: 'System',
        message: error.message || 'Internal server error'
      }]);
      res.set('Content-Type', 'application/xml');
      res.status(error.status || 500).send(errorXml);
    }
  }

  /**
   * GET endpoint for retrieving all locations (convenience endpoint)
   */
  @Get('locations')
  @ApiOperation({
    summary: 'Get All Locations',
    description: 'Retrieve all available pickup/dropoff locations in OTA XML format'
  })
  @ApiResponse({
    status: 200,
    description: 'OTA_VehLocSearchRS XML response with all locations'
  })
  async getAllLocations(@Res() res: Response): Promise<void> {
    try {
      const responseXml = await this.locationService.getAllLocationsXml();
      res.set('Content-Type', 'application/xml');
      res.send(responseXml);
    } catch (error) {
      const errorXml = this.xmlService.buildErrorRS('OTA_VehLocSearchRS', [{
        code: '500',
        type: 'System',
        message: error.message || 'Internal server error'
      }]);
      res.set('Content-Type', 'application/xml');
      res.status(500).send(errorXml);
    }
  }

  /**
   * Health check endpoint for TSD integration
   */
  @Get('health')
  @ApiOperation({
    summary: 'TSD API Health Check',
    description: 'Check if the TSD XML API is operational'
  })
  async healthCheck(@Res() res: Response): Promise<void> {
    const healthXml = this.xmlService.buildXml({
      '@_xmlns': 'http://www.opentravel.org/OTA/2003/05',
      '@_TimeStamp': new Date().toISOString(),
      Success: {},
      Status: 'Operational',
      Version: '1.0',
      Vendor: 'Route Facile Car Rental'
    }, 'OTA_PingRS');
    
    res.set('Content-Type', 'application/xml');
    res.send(healthXml);
  }

  /**
   * Validate that the request content type is XML
   */
  private validateXmlContentType(contentType: string): void {
    if (!contentType) {
      throw new BadRequestException('Content-Type header is required');
    }
    
    const validTypes = ['application/xml', 'text/xml'];
    const isValid = validTypes.some(type => contentType.toLowerCase().includes(type));
    
    if (!isValid) {
      throw new BadRequestException('Content-Type must be application/xml or text/xml');
    }
  }
}

