import * as fs from 'fs';
import {InvalidConfig} from './errors';

export function loadConfigFile(filename: string) {

    let fileContent;

    try {

        fileContent = fs.readFileSync(filename, 'utf-8');

    } catch (e) {

        return {};

    }

    try {

        return JSON.parse(fileContent);

    } catch (e) {

        throw new InvalidConfig([`${filename} is not valid JSON`]);

    }

}
