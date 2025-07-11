import { captureException } from '@sentry/nestjs';
import { ConsoleLogger, ConsoleLoggerOptions } from './console-logger';
import type { AbstractLogger, LogLevels, logMessage } from './interfaces';

const defaultLogger = new ConsoleLogger();

export class Logger implements AbstractLogger {
    private static staticInstance?: AbstractLogger;
    protected localInstanceRef?: AbstractLogger;
    protected static logLevels: LogLevels[];

    constructor(
        private defaultContext?: string,
        instanceOptions?: ConsoleLoggerOptions,
    ) {
        // If theres not a static instance it means that the logger is not initialized, so if we don't have the "instanceOptions" to create a new instance of "ConsoleLogger", we will use the default logger.
        if (!Logger.staticInstance && !instanceOptions) {
            Logger.staticInstance = defaultLogger;

            // But if "instanceOptions" was provided, we will use it to create the new (and unique instance of ConsoleLogger).
        } else if (instanceOptions && !Logger.staticInstance) {
            Logger.staticInstance = new ConsoleLogger({ ...instanceOptions, context: defaultContext });
        }
        // Local instance for this instance of the logger.
        this.localInstanceRef = Logger.staticInstance;
    }

    // Public methods
    /**
     * Write an 'log' message.
     */
    public log(message: logMessage, context = this.defaultContext) {
        this.localInstanceRef?.log(message, context);
    }
    /**
     * Write an 'error' message.
     */
    public error(message: logMessage, context = this.defaultContext) {
        captureException(message);
        this.localInstanceRef?.error(message, context);
    }
    /**
     * Write an 'debug' message.
     */
    public debug(message: logMessage, context = this.defaultContext) {
        this.localInstanceRef?.debug(message, context);
    }
    /**
     * Write an 'verbose' message.
     */
    public verbose(message: logMessage, context = this.defaultContext) {
        this.localInstanceRef?.verbose!(message, context);
    }
    /**
     * Write an 'warn' message.
     */
    public warn(message: logMessage, context = this.defaultContext) {
        this.localInstance?.warn(message, context);
    }

    // Static methods

    /**
     * Write an 'log' message.
     */
    static log(message: logMessage, context?: string) {
        this.staticInstance?.log(message, context);
    }
    /**
     * Write an 'error' message.
     */
    static error(message: logMessage, context?: string) {
        this.staticInstance?.error(message, context);
    }
    /**
     * Write an 'debug' message.
     */
    static debug(message: logMessage, context?: string) {
        this.staticInstance?.debug(message, context);
    }

    /**
     * Write an 'verbose' message.
     */
    static verbose(message: logMessage, context?: string) {
        this.staticInstance?.verbose!(message, context);
    }
    /**
     * Write an 'warn' message.
     */
    static warn(message: logMessage, context?: string) {
        this.staticInstance?.warn(message, context);
    }

    get localInstance() {
        return this.localInstanceRef;
    }

    static overrideLocalInstance(instance: ConsoleLogger | AbstractLogger) {
        Logger.staticInstance = instance;
    }
}
