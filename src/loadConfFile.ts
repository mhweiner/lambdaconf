import * as fs from 'fs';
import {InvalidConf} from './errors';

export function loadConfFile(filename: string) {

    let fileContent;

    try {

        fileContent = fs.readFileSync(filename, 'utf-8');

    } catch (e) {

        return {};

    }

    try {

        return JSON.parse(fileContent);

    } catch (e) {

        throw new InvalidConf([`${filename} is not valid JSON`]);

    }

}
