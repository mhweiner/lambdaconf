import * as fs from 'fs';
import {getUnresolvedConf} from './getUnresolvedConf';
import {resolveConf} from './resolveConf';

const indent = (depth: number) => Array(depth * 2).fill(' ').join('');

export async function writeConfFile() {

    const unresolvedDefaultConfig = getUnresolvedConf();
    const defaultConfig = await resolveConf(unresolvedDefaultConfig);
    const filepath = `${__dirname}/Conf.d.ts`;
    const ts = `export interface Conf {\n${props(defaultConfig)}\n}`;

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
