import {ErrorLevel, Log, LogVerbosity, Options} from '.';
import {output} from './output';

function getErrorMessage(error: any) {

    if (!error || !error.message) return '';

    return error.message as string;

}

export function log(input: {
    level: ErrorLevel
    message?: string
    error?: {}
    data?: {}
    context?: {}
    options: Options
}) {

    const {level, message, error, data, context, options} = input;

    if (options.level > level) return;

    const log: Log = {
        level,
        message: message || getErrorMessage(error),
        error,
        data,
        context,
    };

    if (options.verbosity === LogVerbosity.verbose) {

        log.context = {
            ...context,
            date: new Date().toISOString(),
            pid: process.pid,
            ppid: process.ppid,
            nodeVersion: process.version,
        };

    }

    return output(log, options);

}

