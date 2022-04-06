import {readFileSync} from 'fs';
import {InvalidConf} from './errors';
import {getConfDir} from './getConfDir';
import {AnyObject} from './index';

/**
 * Loads a configuration file. Do not pass the config directory path, this is assumed.
 * @param path
 */
export function loadConfFile(path: string): AnyObject {

    let fileContent;

    try {

        fileContent = readFileSync(`${getConfDir()}${path}`, 'utf-8');

    } catch (e) {

        return {};

    }

    try {

        return JSON.parse(fileContent) as AnyObject;

    } catch (e) {

        throw new InvalidConf([`${path} is not valid JSON`]);

    }

}
