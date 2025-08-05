import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip;

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;
      const message = `${method} ${originalUrl} ${statusCode} - ${contentLength}b - ${userAgent} - ${ip}`;

      // Логика уровней логирования
      if (statusCode >= 500) {
        this.logger.error(`SERVER ERROR: ${message}`);
      } else if (statusCode >= 400) {
        this.logger.warn(`CLIENT ERROR: ${message}`);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
