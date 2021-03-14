import winston from 'winston';

/*
 * A class to handle text output and visualization
 */
export class Logger {

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

        Logger._logger = winston.createLogger({
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
        Logger._logger.info(Logger._getText(args));
    }

    /*
     * Log warn level
     */
    public static warn(...args: any[]): void {
        Logger._logger.warn(Logger._getText(args));
    }

    /*
     * Log error level
     */
    public static error(...args: any[]): void {
        Logger._logger.error(Logger._getText(args));
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
