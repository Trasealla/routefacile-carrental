import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { XMLBuilder } from 'fast-xml-parser';

// Serializes the controller's plain-object return value as XML when the broker asked
// for it via Accept: application/xml. Leaves the response untouched (plain object,
// serialized as JSON by Nest as usual) for every other Accept header.
@Injectable()
export class BrokerXmlResponseInterceptor implements NestInterceptor {
    private static builder = new XMLBuilder({ format: true, indentBy: '  ', suppressEmptyNode: true });

    constructor(private readonly rootElement: string) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const accept = (request.headers['accept'] || '').toString();
        const wantsXml = accept.includes('xml');

        return next.handle().pipe(
            map((data) => {
                if (!wantsXml) return data;

                response.set('Content-Type', 'application/xml');
                const xml = BrokerXmlResponseInterceptor.builder.build({ [this.rootElement]: data });
                return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
            })
        );
    }
}
