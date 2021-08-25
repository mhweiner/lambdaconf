import {resolveLoader} from './resolveLoader';
import {Loader} from '.';

export async function resolveConfig(
    obj: {[key: string]: any},
    loaders?: Loader[],
    path: string[] = [],
) {

    const resolvedConfig: {[key: string]: any} = obj; //it starts out as unresolved

    await Promise.all(Object.keys(obj).map(async (key: string) => {

        const value = obj[key];

        if (typeof value === 'object') {

            if (isLoader(value)) {

                resolvedConfig[key] = await resolveLoader(value, loaders || [{}]);

            } else {

                return resolveConfig(value, loaders, [...path, key]);

            }

        }

    }));

    return resolvedConfig; //it's resolved now

}

/**
 * Returns true if object has only one key and it matches pattern /^\[.*\]$/
 * @param prop
 */
export function isLoader(prop: {[key: string]: object}) {

    const keys = Object.keys(prop);

    if (keys.length === 1) {

        return /^\[.*\]$/.test(keys[0]);

    }

}
