import winston from 'winston';

/*
 * A class to handle text output and visualization
 */
export class ApiLogger {

    /*
     * Initialize the logger
     */
    public static initialize(): void {

        winston.addColors({
            error: 'red',
            info: 'white',
            warn: 'yellow',
        });

        const consoleOptions = {
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
            ),
        };

        ApiLogger._logger = winston.createLogger({
            level: 'info',
            transports: [
                new (winston.transports.Console)(consoleOptions),
            ],
        });
    }

    /*
     * Log info level
     */
    public static info(...args: any[]): void {
        ApiLogger._logger.info(ApiLogger._getText(args));
    }

    /*
     * Log warn level
     */
    public static warn(...args: any[]): void {
        ApiLogger._logger.warn(ApiLogger._getText(args));
    }

    /*
     * Log error level
     */
    public static error(...args: any[]): void {
        ApiLogger._logger.error(ApiLogger._getText(args));
    }

    private static _logger: any = null;

    /*
     * Get the text to output
     */
    private static _getText(args: any[]): string {
        const text = Array.prototype.slice.call(args).join(' : ');
        return text;
    }
}
