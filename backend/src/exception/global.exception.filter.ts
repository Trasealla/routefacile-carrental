import { ExceptionFilter, Catch, ArgumentsHost, HttpException, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { XMLBuilder } from 'fast-xml-parser';
import { MailService } from 'src/mail/mail.service';

const xmlBuilder = new XMLBuilder({ format: true, indentBy: '  ', suppressEmptyNode: true });

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly mailService: MailService) { }

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus ? exception.getStatus() : 500;
    const message = exception.message || 'Internal server error';

    // Log the error (optional)
    console.log(new Date());
    console.error(exception);
    console.log(request.url);
    console.error(request.body);
    console.log(request.headers.referer+' '+request.headers['user-agent']);

    // Determine if the exception should trigger an email notification
    // const shouldNotify = !(exception instanceof NotFoundException);

    // Crash notifications used to be emailed to the previous developer's personal
    // address on every 500 — including the full request body, which can carry
    // customer names, phone numbers and booking details. They are now opt-in:
    // set ERROR_NOTIFY_EMAIL to receive them, leave it unset and nothing is sent.
    const errorNotifyTo = process.env.ERROR_NOTIFY_EMAIL;

    if (errorNotifyTo && status == 500 && request.method != 'OPTIONS' && process.env.NODE_ENV != 'local') {
      await this.mailService.send(
        errorNotifyTo,
        `${process.env.NODE_ENV} Error in Application: ${status}`,
        'error', // Replace with the path to your email template
        {
          timestamp: new Date().toString(),
          path: request.url,
          method: request.method,
          message: message,
          name: exception.name,
          exception: JSON.stringify(exception),
          stack: exception.stack || '',
          request: JSON.stringify(request.body)
        },
        []
      );
    }

    const responseBody = exception.getResponse ? exception.getResponse() : {
      statusCode: status,
      message: [message],
    };

    // Add CORS headers to error responses
    const origin = request.headers.origin;
    if (origin) {
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Broker partner API promises JSON-or-XML for every response, errors included
    // (see docs/Broker_API_Design.md §7.0) — scoped strictly to that path prefix so
    // every other consumer of this shared filter is unaffected.
    const isBrokerApi = (request.path || request.url || '').startsWith('/api/v1/broker/v1');
    const accept = (request.headers.accept || '').toString();

    if (isBrokerApi && accept.includes('xml')) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBuilder.build({ ErrorResponse: responseBody })}`;
      response.status(status).set('Content-Type', 'application/xml').send(xml);
      return;
    }

    response.status(status).json(responseBody);
  }
}