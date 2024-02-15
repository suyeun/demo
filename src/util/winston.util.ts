import WinstonDaily from 'winston-daily-rotate-file';
import winston from 'winston';
import { path } from 'app-root-path';
import { join } from 'path';

const logDir = join(path, 'logs');
const isDev = !!String(process.env['NODE_ENV']).indexOf('dev');
const isTest = process.env['NODE_ENV'] === 'test';
const appName = process.env['APP_NAME'] ?? 'log';
const datePattern = 'YYYY-MM-DD';

// const { combine, timestamp, label, printf } = winston.format;

const consoleLogFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.label({ label: appName }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:MM:SS' }),
  winston.format.printf((info: any) => `[${info.label}/${info.level}] | ${info.timestamp} | ${info.message}`),
);
const fileLogFormat = winston.format.combine(
  winston.format.label({ label: appName }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:MM:SS' }),
  winston.format.simple(),
  winston.format.printf((info: any) => `[${info.label}/${info.level}] | ${info.timestamp} | ${info.message}`),
);

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  defaultMeta: { service: appName },
  format: fileLogFormat,
  silent: isTest,
  transports: [
    new WinstonDaily({
      level: 'error',
      datePattern,
      dirname: `${logDir}/error`,
      filename: `%DATE%.error.log`,
      maxFiles: 30,
      handleExceptions: true,
      json: false,
      zippedArchive: true,
      silent: isTest,
      format: fileLogFormat,
    }),
    new WinstonDaily({
      level: 'debug',
      datePattern,
      dirname: `${logDir}/debug`,
      filename: `%DATE%.debug.log`,
      maxFiles: 30,
      handleExceptions: true,
      json: false,
      zippedArchive: true,
      silent: isTest,
      format: fileLogFormat,
    }),
    new WinstonDaily({
      level: 'info',
      datePattern,
      dirname: `${logDir}/info`,
      filename: `%DATE%.log`,
      maxFiles: 30,
      json: false,
      zippedArchive: true,
      silent: isTest,
      format: fileLogFormat,
    }),
    new WinstonDaily({
      level: 'warn',
      datePattern,
      dirname: `${logDir}/warn`,
      filename: `%DATE%.log`,
      maxFiles: 30,
      json: false,
      zippedArchive: true,
      silent: isTest,
      format: fileLogFormat,
    }),
    new winston.transports.Console({
      handleExceptions: true,
      format: consoleLogFormat,
    }), // Console transport for console output
  ],
  exitOnError: false,
});
