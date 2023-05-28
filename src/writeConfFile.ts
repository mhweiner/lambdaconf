import * as fs from 'fs';
import {resolveConf} from './resolveConf';
import {getEnvArguments} from './getEnvArguments';
import {loadConfFromFiles} from './loadConfFromFiles';
import {mergeConfs} from './mergeConfs';
import {getConfDir} from './getConfDir';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const indent = (depth: number) => Array(depth * 2).fill(' ').join('');

export async function writeConfFile(): Promise<void> {

    const env = getEnvArguments();
    const confSources = loadConfFromFiles(env);
    const mergedConf = mergeConfs(confSources);
    const defaultConfig = await resolveConf(mergedConf, {});
    const filepath = `${getConfDir()}/Conf.d.ts`;
    const ts = `
        declare module "lambdaconf" {
            export type Conf = {
                ${props(defaultConfig)}
            }
        }
    `;

    console.log(`lambdaconf: writing ${filepath}`);
    fs.writeFileSync(filepath, ts);

}

export function props(obj: {[key: string]: any}, depth: number = 1): string {

    return Object.keys(obj).map((key) => {

        switch (typeof obj[key]) {

            case 'object':

                if (Array.isArray(obj[key])) {

                    const type = typeof obj[key][0];

                    return `${indent(depth)}'${key}': ${type === 'undefined' ? 'any' : type}[]`;

                } else {

                    return `${indent(depth)}'${key}': {\n${props(obj[key], depth + 1)}\n${indent(depth)}}`;

                }


            case 'boolean':

                return `${indent(depth)}'${key}': boolean`;

            case 'number':

                return `${indent(depth)}'${key}': number`;

            default:

                return `${indent(depth)}'${key}': string`;

        }

    }).join('\n');

}
