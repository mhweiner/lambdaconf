import kleur from 'kleur';
import util from 'util';
import {serializeError} from 'serialize-error';
import {ErrorLevel, Log, LogFormat, Options} from '.';

export function output(log: Log, options: Options) {

    const transport = log.level >= ErrorLevel.warn ? console.error : console.log;

    options.format === LogFormat.json ? transport(stringify(log)) : transport(humanFormat(log));

}

function colorizeLevel(level: ErrorLevel) {

    switch (level) {

        case ErrorLevel.trace:
            return kleur.bold().grey('TRACE');
        case ErrorLevel.debug:
            return kleur.bold().yellow('DEBUG');
        case ErrorLevel.info:
            return kleur.bold().white('INFO');
        case ErrorLevel.warn:
            return kleur.bold().red('WARN');
        case ErrorLevel.error:
            return kleur.bold().magenta('ERROR');
        case ErrorLevel.fatal:
            return kleur.bold().white().bgRed('FATAL');

    }

}

function humanFormat(log: Log) {

    const insp = (obj: any) => util.inspect(obj, {colors: true, depth: null});
    const level = `Level: ${colorizeLevel(log.level)}\n`;
    const message = `Message: ${log.message}\n`;
    const error = log.error ? `${insp(log.error)}\n` : '';
    const data = log.data ? `${insp(log.data)}\n` : '';
    const context = log.context ? `${insp(log.context)}\n` : '';

    return `\n${level}${message}${error}${data}${context}`;

}

function stringify(log: Log) {

    log.error = log.error instanceof Error ? serializeError(log.error) : log.error;
    return JSON.stringify(log);

}
