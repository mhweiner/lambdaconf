import {readFileSync} from 'fs';
import {InvalidConf} from './errors';
import {getConfDir} from './getConfDir';

/**
 * Loads a configuration file. Do not pass the config directory path, this is assumed.
 * @param path
 */
export function loadConfFile(path: string): Record<string, any> {

    let fileContent;

    try {

        fileContent = readFileSync(`${getConfDir()}${path}`, 'utf-8');

    } catch (e) {

        return {};

    }

    try {

        return JSON.parse(fileContent) as Record<string, any>;

    } catch (e) {

        throw new InvalidConf([`${path} is not valid JSON`]);

    }

}
