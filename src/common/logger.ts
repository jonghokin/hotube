import path from 'path';
import fs from 'fs';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize } = winston.format;

// 로그 파일이 저장될 디렉터리 경로
const logDirectory = path.join(__dirname, '../Log');

// 디렉터리가 존재하지 않으면 생성
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
    format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat
    ),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
            filename: path.join(logDirectory, 'errorLog-%DATE%.txt'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        })
    ]
});

export default logger;

// 기존 console.log, console.error 등을 winston 로그로 대체
console.log = (...args) => logger.info.call(logger, args);
console.info = (...args) => logger.info.call(logger, args);
console.warn = (...args) => logger.warn.call(logger, args);
console.error = (...args) => logger.error.call(logger, args);
console.debug = (...args) => logger.debug.call(logger, args);

// 앱 크래시 시 로그 기록 설정
process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`, { stack: error.stack });
    process.exit(1); // 필요한 경우 앱을 종료
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    process.exit(1); // 필요한 경우 앱을 종료
});
