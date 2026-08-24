import { Injectable } from '@nestjs/common';
import { XMLParser, XMLBuilder, XmlBuilderOptions } from 'fast-xml-parser';

@Injectable()
export class XmlService {
  private parser: XMLParser;
  private builder: XMLBuilder;

  constructor() {
    // Parser options for reading XML
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      trimValues: true,
      parseTagValue: true,
      isArray: (name, jpath, isLeafNode, isAttribute) => {
        // Force arrays for certain elements
        const arrayElements = [
          'VehAvail', 'VehicleCharge', 'Fee', 'SpecialEquipPref',
          'OperationTime', 'VehMatchedLoc', 'Error'
        ];
        return arrayElements.includes(name);
      }
    });

    // Builder options for creating XML
    const builderOptions: XmlBuilderOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      format: true,
      indentBy: '  ',
      suppressEmptyNode: true,
      suppressBooleanAttributes: false
    };
    this.builder = new XMLBuilder(builderOptions);
  }

  /**
   * Parse XML string to JavaScript object
   */
  parseXml<T>(xmlString: string): T {
    try {
      return this.parser.parse(xmlString) as T;
    } catch (error) {
      throw new Error(`XML parsing error: ${error.message}`);
    }
  }

  /**
   * Build XML string from JavaScript object
   */
  buildXml(obj: any, rootElement?: string): string {
    try {
      const xmlObj = rootElement ? { [rootElement]: obj } : obj;
      const xml = this.builder.build(xmlObj);
      return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
    } catch (error) {
      throw new Error(`XML building error: ${error.message}`);
    }
  }

  /**
   * Build OTA Vehicle Availability Response XML
   */
  buildVehAvailRateRS(data: any): string {
    const response = {
      '@_xmlns': 'http://www.opentravel.org/OTA/2003/05',
      '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@_EchoToken': data.echoToken || new Date().getTime().toString(),
      '@_TimeStamp': new Date().toISOString(),
      '@_Target': data.target || 'Production',
      '@_Version': '1.0',
      ...data.response
    };
    return this.buildXml(response, 'OTA_VehAvailRateRS');
  }

  /**
   * Build OTA Vehicle Reservation Response XML
   */
  buildVehResRS(data: any): string {
    const response = {
      '@_xmlns': 'http://www.opentravel.org/OTA/2003/05',
      '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@_EchoToken': data.echoToken || new Date().getTime().toString(),
      '@_TimeStamp': new Date().toISOString(),
      '@_Target': data.target || 'Production',
      '@_Version': '1.0',
      ...data.response
    };
    return this.buildXml(response, 'OTA_VehResRS');
  }

  /**
   * Build OTA Vehicle Cancel Response XML
   */
  buildVehCancelRS(data: any): string {
    const response = {
      '@_xmlns': 'http://www.opentravel.org/OTA/2003/05',
      '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@_EchoToken': data.echoToken || new Date().getTime().toString(),
      '@_TimeStamp': new Date().toISOString(),
      '@_Target': data.target || 'Production',
      '@_Version': '1.0',
      ...data.response
    };
    return this.buildXml(response, 'OTA_VehCancelRS');
  }

  /**
   * Build OTA Vehicle Modify Response XML
   */
  buildVehModifyRS(data: any): string {
    const response = {
      '@_xmlns': 'http://www.opentravel.org/OTA/2003/05',
      '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@_EchoToken': data.echoToken || new Date().getTime().toString(),
      '@_TimeStamp': new Date().toISOString(),
      '@_Target': data.target || 'Production',
      '@_Version': '1.0',
      ...data.response
    };
    return this.buildXml(response, 'OTA_VehModifyRS');
  }

  /**
   * Build OTA Vehicle Location Search Response XML
   */
  buildVehLocSearchRS(data: any): string {
    const response = {
      '@_xmlns': 'http://www.opentravel.org/OTA/2003/05',
      '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@_EchoToken': data.echoToken || new Date().getTime().toString(),
      '@_TimeStamp': new Date().toISOString(),
      '@_Target': data.target || 'Production',
      '@_Version': '1.0',
      ...data.response
    };
    return this.buildXml(response, 'OTA_VehLocSearchRS');
  }

  /**
   * Build OTA Error Response XML
   */
  buildErrorRS(messageType: string, errors: { code: string; type: string; message: string }[]): string {
    const response = {
      '@_xmlns': 'http://www.opentravel.org/OTA/2003/05',
      '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@_TimeStamp': new Date().toISOString(),
      '@_Version': '1.0',
      Errors: {
        Error: errors.map(err => ({
          '@_Type': err.type,
          '@_Code': err.code,
          '@_ShortText': err.message
        }))
      }
    };
    return this.buildXml(response, messageType);
  }

  /**
   * Extract the root element name from XML
   */
  getRootElement(xmlString: string): string | null {
    const match = xmlString.match(/<(\w+)/);
    return match ? match[1] : null;
  }

  /**
   * Convert ISO date string to OTA format (YYYY-MM-DDTHH:MM:SS)
   */
  toOTADateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().slice(0, 19);
  }

  /**
   * Parse OTA date time to JavaScript Date
   */
  fromOTADateTime(otaDateTime: string): Date {
    return new Date(otaDateTime);
  }

  /**
   * Extract date and time from OTA DateTime format
   */
  extractDateAndTime(otaDateTime: string): { date: string; time: string } {
    const parts = otaDateTime.split('T');
    return {
      date: parts[0], // YYYY-MM-DD
      time: parts[1]?.slice(0, 5) || '00:00' // HH:MM
    };
  }
}

