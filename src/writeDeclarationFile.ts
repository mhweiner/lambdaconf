import * as fs from 'fs';
import {getUnresolvedConfig} from './getUnresolvedConfig';
import {resolveConfig} from './resolveConfig';

export async function writeDeclarationFile() {

    const unresolvedDefaultConfig = getUnresolvedConfig();
    const defaultConfig = await resolveConfig(unresolvedDefaultConfig);
    const filepath = `${__dirname}/Config.d.ts`;
    const ts = `
      export interface Config {
          ${getInterfaceProperties(defaultConfig)}
      }
    `;

    console.log(`writing Config type declaration file to ${filepath}`);
    fs.writeFileSync(filepath, ts);

}

export function getInterfaceProperties(obj: {[key: string]: any}): string {

    return Object.keys(obj).map((key) => {

        switch (typeof obj[key]) {

            case 'object':

                if (Array.isArray(obj[key])) {

                    const type = typeof obj[key][0];

                    return `'${key}': ${type === 'undefined' ? 'any' : type}[]`;

                }

                return `'${key}': {\n ${getInterfaceProperties(obj[key])} \n}`;


            case 'boolean':

                return `'${key}': boolean`;

            case 'number':

                return `'${key}': number`;

            default:

                return `'${key}': string`;

        }

    }).join('\n');

}
