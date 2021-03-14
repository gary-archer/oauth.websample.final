"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
/*
 * A class to handle text output and visualization
 */
class Logger {
    /*
     * Initialize the logger
     */
    static initialize() {
        winston_1.default.addColors({
            error: 'red',
            info: 'white',
            warn: 'yellow',
        });
        const consoleOptions = {
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
        };
        Logger._logger = winston_1.default.createLogger({
            level: 'info',
            transports: [
                new (winston_1.default.transports.Console)(consoleOptions),
            ],
        });
    }
    /*
     * Log info level
     */
    static info(...args) {
        Logger._logger.info(Logger._getText(args));
    }
    /*
     * Log warn level
     */
    static warn(...args) {
        Logger._logger.warn(Logger._getText(args));
    }
    /*
     * Log error level
     */
    static error(...args) {
        Logger._logger.error(Logger._getText(args));
    }
    /*
     * Get the text to output
     */
    static _getText(args) {
        const text = Array.prototype.slice.call(args).join(' : ');
        return text;
    }
}
exports.Logger = Logger;
Logger._logger = null;
