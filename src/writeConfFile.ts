import * as fs from 'fs';
import {getUnresolvedConf} from './getUnresolvedConf';
import {resolveConf} from './resolveConf';

const indent = '  ';

export async function writeConfFile() {

    const unresolvedDefaultConfig = getUnresolvedConf();
    const defaultConfig = await resolveConf(unresolvedDefaultConfig);
    const filepath = `${__dirname}/Conf.d.ts`;
    const ts = `
export interface Config {
${getInterfaceProperties(defaultConfig)}
}
`;

    console.log(`writing Conf file to ${filepath}`);
    fs.writeFileSync(filepath, ts);

}

export function getInterfaceProperties(obj: {[key: string]: any}): string {

    return Object.keys(obj).map((key) => {

        switch (typeof obj[key]) {

            case 'object':

                if (Array.isArray(obj[key])) {

                    const type = typeof obj[key][0];

                    return `${indent}'${key}': ${type === 'undefined' ? 'any' : type}[]`;

                }

                return `${indent}'${key}': {\n ${getInterfaceProperties(obj[key])} \n}`;


            case 'boolean':

                return `${indent}'${key}': boolean`;

            case 'number':

                return `${indent}'${key}': number`;

            default:

                return `${indent}'${key}': string`;

        }

    }).join('\n');

}
