import {log} from './log';

export type Options = {
    level: ErrorLevel
    format: LogFormat
    verbosity: LogVerbosity
};

export enum ErrorLevel {
    fatal = 60, // The service is going to stop or become unusable now. Requires IMMEDIATE attention.
    error = 50, // Possibly fatal for a particular request. Requires attention ASAP.
    warn = 40, // Possible issue that could root cause a bug. Attention advised. If not an issue, demote to info/debug.
    info = 30, // Detail on regular operation. Be careful what you put here, it can become noisy.
    debug = 20, // Anything else, i.e. too verbose to be included in "info" level. Not used in staging/production.
    trace = 10, // Logging from external libraries used by your app or very detailed application logging.
}

/**
 * Set with process.env.LOG_FORMAT
 */
export enum LogFormat {
    json = 'json',
    human = 'human',
}

/**
 * Set with process.env.LOG_VERBOSITY
 */
export enum LogVerbosity {
    verbose = 'verbose', // default
    terse = 'terse', // better for local dev
}

export type Log = {
    level: ErrorLevel
    message: string
    error?: {}
    data?: {}
    context?: {}
};

if (process.env.LOG && !ErrorLevel[process.env.LOG as keyof typeof ErrorLevel]) {

    throw new Error('process.env.LOG must be one of fatal, error, warn, info, debug, trace');

}

const options: Options = {
    level: ErrorLevel[process.env.LOG as keyof typeof ErrorLevel] || ErrorLevel.info,
    format: process.env.LOG_FORMAT === LogFormat.json ? LogFormat.json : LogFormat.human,
    verbosity: process.env.LOG_VERBOSITY === LogVerbosity.terse ? LogVerbosity.terse : LogVerbosity.verbose,
};

export const logger = {
    trace: (message?: string, data?: any, context?: any) => log({
        level: ErrorLevel.trace, message, data, context, options,
    }),
    debug: (message?: string, data?: any, context?: any) => log({
        level: ErrorLevel.debug, message, data, context, options,
    }),
    info: (message?: string, data?: any, context?: any) => log({
        level: ErrorLevel.info, message, data, context, options,
    }),
    warn: (message?: string, error?: any, data?: any, context?: any) => log({
        level: ErrorLevel.warn, message, data, context, options, error,
    }),
    error: (message?: string, error?: any, data?: any, context?: any) => log({
        level: ErrorLevel.error, message, data, context, options, error,
    }),
    fatal: (message?: string, error?: any, data?: any, context?: any) => log({
        level: ErrorLevel.fatal, message, data, context, options, error,
    }),
};
