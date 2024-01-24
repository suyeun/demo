import 'winston-daily-rotate-file';
import winston from 'winston';
import { path } from 'app-root-path';
import { join } from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';

class LoggerConfig {
  private logDir: string;
  private isDev: boolean = false;
  private isTest: boolean;
  private appName: string;
  private datePattern: string;
  private logTransports: winston.transport[];
  private logFormat = winston.format.printf(({ level, message }) => {
    return `${this.appName}-} [${level}]: ${message}`;
  });

  constructor() {
    this.logDir = join(path, 'logs');
    this.isDev = String(process.env['NODE_ENV']).indexOf('dev') > -1;
    this.isTest = process.env['NODE_ENV'] === 'test';
    this.appName = process.env['APP_NAME'] || 'SEERSLAB';
    this.datePattern = 'YYYY-MM-DD';
    this.logTransports = this.setupTransports();
  }

  private setupTransports(): winston.transport[] {
    return [
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), this.logFormat),
      }),
      this.createDailyRotateFile('error', 'error'),
      this.createDailyRotateFile('debug', 'debug'),
      this.createDailyRotateFile('info', 'log'),
      this.createDailyRotateFile('warn', 'log'),
    ];
  }

  private createDailyRotateFile(level: string, filenamePrefix: string): DailyRotateFile {
    return new winston.transports.DailyRotateFile({
      datePattern: this.datePattern,
      dirname: `${this.logDir}/${filenamePrefix}`,
      filename: `%DATE%.${filenamePrefix}.log`,
      level,
      maxFiles: 30,
      handleExceptions: true,
      json: false,
      zippedArchive: true,
      silent: this.isTest,
    });
  }

  public getLogger(): winston.Logger {
    return winston.createLogger({
      level: this.isDev ? 'debug' : 'info',
      defaultMeta: { service: this.appName },
      // format: winston.format.combine(winston.format.simple(), winston.format.timestamp()),
      format: winston.format.combine(winston.format.simple(), winston.format.timestamp()),
      silent: this.isTest,
      transports: this.logTransports,
    });
  }
}
const logger = new LoggerConfig().getLogger();
export default logger;

export function toLogger(data: any, clazz: any, isExceptions?: boolean) {
  const name = typeof clazz === 'string' ? clazz : clazz.constructor.name;

  if (isExceptions) logger.error(`[${name}] ${data}`);
  else logger.debug(`[${name}] ${data}`);

  return null;
}
