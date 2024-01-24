import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import logger from './configs/logger.config';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      logger.debug(`[REQ] ${req.ip} ${req.method} ${res.statusCode} : ${req.originalUrl}`);
    });

    next();
  }
}
