import type { FastifyReply, FastifyRequest } from 'fastify';
import { Logger } from '@/common/logger';

/**
 * Sanitizes sensitive data from objects and strings
 */
function sanitizeData(data: unknown): unknown {
    if (!data) return data;

    const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'apiKey'];

    if (typeof data === 'string') {
        let sanitized = data;
        sensitiveFields.forEach((field) => {
            sanitized = sanitized.replace(new RegExp(`"${field}"\\s*:\\s*"[^"]*"`, 'gi'), `"${field}":"[REDACTED]"`);
        });
        return sanitized;
    }

    if (typeof data === 'object') {
        try {
            const stringified = JSON.stringify(data);
            return sanitizeData(stringified);
        } catch {
            return '[Complex Object]';
        }
    }

    return data;
}

/**
 * Formats payload for logging regardless of type
 */
function formatPayload(payload: unknown): string {
    if (payload === undefined || payload === null) return 'null';

    if (Buffer.isBuffer(payload)) return `[Buffer ${payload.length}B]`;

    if (typeof payload === 'string') return payload.substring(0, 200);

    try {
        return JSON.stringify(payload).substring(0, 200);
    } catch {
        return '[Unserializable Object]';
    }
}

export function requestLogger(request: FastifyRequest, reply: FastifyReply, payload: unknown): void {
    try {
        const clientIp = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
        const sanitizedRequestBody = sanitizeData(request.body);
        const formattedPayload = formatPayload(payload);

        const logData = {
            service: 'router',
            method: request.method,
            url: request.url,
            statusCode: reply.statusCode,
            clientIp,
            userAgent: request.headers['user-agent'] ?? 'unknown',
            responseTime: `${(reply.elapsedTime / 1000).toFixed(3)}s`,
            requestBody:
                typeof sanitizedRequestBody === 'string'
                    ? sanitizedRequestBody.substring(0, 200)
                    : sanitizedRequestBody,
            responseBody: formattedPayload,
            requestId: request.id,
            contentType: reply.getHeader('content-type') || 'unknown',
        };

        const textLog = `${logData.method} ${logData.statusCode} ${logData.url} from ${Array.isArray(logData.clientIp) ? logData.clientIp.join(',') : logData.clientIp} completed in ${logData.responseTime}`;

        if (reply.statusCode >= 400) {
            Logger.warn({ message: textLog, ...logData }, 'RouterLogger');
        } else {
            Logger.log({ message: textLog, ...logData }, 'RouterLogger');
        }
    } catch (error) {
        if (error instanceof Error) {
            Logger.error(`Error logging request: ${error.message}`, 'RequestLogger');
        } else {
            Logger.error(error, 'RequestLogger');
        }
    }
}
