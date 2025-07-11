import { logMessage } from './logMessage';

export interface AbstractLogger {
    debug: (message: logMessage, context?: string) => void;
    error: (message: logMessage, context?: string) => void;
    warn: (message: logMessage, context?: string) => void;
    log: (message: logMessage, context?: string) => void;
    verbose?: (message: logMessage, context?: string) => void;
    // fatal: (message: logMessage, .context?: string) => void;
}
