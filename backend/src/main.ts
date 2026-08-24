import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { GlobalExceptionFilter } from './exception/global.exception.filter';
import { MailService } from './mail/mail.service';
import { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'express';
import { join } from 'path';
import { DataSource } from 'typeorm';

async function bootstrap() {

  // bodyParser is false here and re-registered manually below, in order. Nest's
  // auto-registered default parser (bodyParser: true) detects "a JSON parser is
  // already on the stack" by scanning for a middleware function literally named
  // `jsonParser` — the name `express.json()` returns. The webhook route below
  // needs its OWN scoped json() (to capture the raw body for HMAC verification),
  // and that scoped parser has the exact same function name. Nest saw it, assumed
  // its own global parser was redundant, and silently skipped registering one —
  // which left every route except /api/v1/broker and /api/v1/webhooks with no
  // body parser at all: req.body was `{}` for every other POST, and every DTO
  // failed validation with "X should not be empty". Managing the whole parser
  // stack explicitly, in the right order, avoids relying on that detection.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  // ── App-scoped MySQL session mode ──────────────────────────────────
  // Several TypeORM-generated queries (e.g. SELECT DISTINCT ... ORDER BY a
  // non-selected column) are invalid under ONLY_FULL_GROUP_BY, which is enabled
  // by default on MySQL 8. This app was built against a MySQL without it.
  // On a shared DB server we must NOT change the global sql_mode, so we relax it
  // per-session for THIS app's connections only — every other database on the
  // server is completely unaffected.
  try {
    const dataSource = app.get(DataSource);
    const relaxedMode =
      'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
    const pool: any = (dataSource.driver as any)?.pool;
    if (pool?.on) {
      // Every new pooled connection gets the relaxed mode as its first statement.
      pool.on('connection', (conn: any) => {
        conn.query(`SET SESSION sql_mode = '${relaxedMode}'`);
      });
    }
    // Cover any connection already open at boot.
    await dataSource.query(`SET SESSION sql_mode = '${relaxedMode}'`);
    console.log('DB session sql_mode relaxed (app-scoped, ONLY_FULL_GROUP_BY off)');
  } catch (e) {
    console.error('Could not set app-scoped session sql_mode:', (e as any)?.message || e);
  }

  // Serve uploaded files (images, documents, etc.) as static assets.
  // DB stores paths like "admin/car/car/image-xxx.png" and the frontend
  // prefixes them with REACT_APP_FILE_SERVER (e.g. http://localhost:3000/),
  // so the uploads directory must be mounted at the server root.
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    index: false,
    fallthrough: true,
  });

  // CORS configuration - MUST be enabled FIRST before any other middleware
  app.enableCors({
    origin: true, // Allow all origins
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'x-api-key',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Enable raw body parsing for XML requests (TSD API) - AFTER CORS
  // app.use('/api/v1/tsd', bodyParser?.text({ type: ['application/xml', 'text/xml'] }));

  // Broker partner API accepts JSON or XML (see docs/Broker_API_Design.md §7.0).
  // Nest's default json()/urlencoded() parsers skip non-matching content types, so this
  // only consumes the body when the broker actually sends XML; BrokerXmlBodyMiddleware
  // then converts that raw string into a plain object before guards/validation run.
  app.use('/api/v1/broker', bodyParser.text({ type: ['application/xml', 'text/xml'] }));

  // The content-engine webhook is authenticated with an HMAC over the EXACT
  // bytes that were sent. Nest's json() parser hands us a parsed object, and
  // re-serialising it does not reliably reproduce the original bytes — key
  // order, whitespace and unicode escaping all differ — so the signature would
  // fail for legitimate requests. Keep the raw buffer on the request and verify
  // against that.
  app.use(
    '/api/v1/webhooks',
    bodyParser.json({
      limit: '2mb', // articles carry full rendered HTML
      verify: (req: any, _res, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );

  // Every other route's parser, now that bodyParser: false above means Nest
  // will not add its own. Registered after the two scoped parsers so those
  // still get first refusal on their own paths; each of the three parsers on
  // any given request either handles the body or passes through untouched, so
  // order here only matters for who claims a request first, not correctness.
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const isStaging = process.env.NODE_ENV === 'staging' || process.env.IS_STAGING === 'true';

  const mailService = app.get(MailService);
  app.useGlobalFilters(new GlobalExceptionFilter(mailService));

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true, transform: true }));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
 
  // Swagger configuration - only for staging environment
  if (isStaging) {
    const SWAGGER_API_KEY = process.env.SWAGGER_API_KEY || 'staging_JP9g4aIbZn7D3';
    const authorizedSessions = new Set<string>();
    
    // Middleware to protect Swagger routes with API key
    const swaggerAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
      // Allow static assets (CSS, JS, images) to pass through
      const staticExtensions = ['.css', '.js', '.png', '.ico', '.map', '.json'];
      const isStaticAsset = staticExtensions.some(ext => req.path.endsWith(ext));
      
      if (isStaticAsset && req.path !== '/api-docs-json') {
        return next();
      }
      
      // Check for API key in query or header
      const apiKey = req.query.key as string || req.headers['x-swagger-key'] as string;
      
      if (apiKey === SWAGGER_API_KEY) {
        return next();
      }
      
      res.status(401).json({ 
        message: 'Unauthorized: Valid API key required. Add ?key=YOUR_KEY to the URL or x-swagger-key header.' 
      });
    };

    // Apply middleware to Swagger routes
    app.use('/api-docs', swaggerAuthMiddleware);
    app.use('/api-docs-json', swaggerAuthMiddleware);

    const config = new DocumentBuilder()
      .setTitle('Route Facile API')
      .setDescription('Route Facile Car Rental API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API Key for authentication',
        },
        'api-key',
      )
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    
    // Filter to only include specific tags for team sharing
    const allowedTags = ['auth', 'booking-form', 'booking', 'car', 'user', 'user-forms', 'TSD XML API'];
    
    // Filter paths to only include endpoints with allowed tags
    const filteredPaths = {};
    for (const [path, methods] of Object.entries(document.paths)) {
      const filteredMethods = {};
      for (const [method, operation] of Object.entries(methods as object)) {
        if (operation.tags && operation.tags.some((tag: string) => allowedTags.includes(tag))) {
          filteredMethods[method] = operation;
        }
      }
      if (Object.keys(filteredMethods).length > 0) {
        filteredPaths[path] = filteredMethods;
      }
    }
    document.paths = filteredPaths;
    
    // Filter tags array to only include allowed tags
    document.tags = (document.tags || []).filter(tag => allowedTags.includes(tag.name));
    
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'Route Facile API',
    });

    console.log(`Swagger documentation available at /api-docs?key=${SWAGGER_API_KEY}`);
  }

  await app.listen(process.env.NODE_PORT, () => {
    console.log(`${process.env.NODE_ENV} running on port: ${process.env.NODE_PORT}`);
  });
}

bootstrap();
