import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { XMLParser } from 'fast-xml-parser';

// Runs before ValidationPipe/guards, so by the time BrokerCredentialsGuard and the
// DTO validators see the request, req.body is always a plain object — regardless of
// whether the broker sent JSON or XML. XML bodies arrive here as a raw string because
// Nest's default body parsers only consume application/json (see main.ts's scoped
// express.text() middleware for /api/v1/broker/v1).
@Injectable()
export class BrokerXmlBodyMiddleware implements NestMiddleware {
    private parser = new XMLParser({ ignoreAttributes: true, trimValues: true, parseTagValue: true });

    use(req: Request, res: Response, next: NextFunction) {
        const contentType = (req.headers['content-type'] || '').toString();

        if (contentType.includes('xml') && typeof req.body === 'string' && req.body.trim().length > 0) {
            try {
                const parsed = this.parser.parse(req.body);
                const rootKey = Object.keys(parsed)[0];
                req.body = rootKey ? parsed[rootKey] : parsed;
            } catch (error) {
                throw new BadRequestException('Invalid XML request body');
            }
        }

        next();
    }
}
