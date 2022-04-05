import {isLoader} from './isLoader';
import type {LoaderDict} from '.';
import {LoaderNotFound} from './errors';
import {isEnvironmentVariable} from './isEnvironmentVariable';

export async function resolveConf(
    obj: {[key: string]: any},
    loaders: LoaderDict,
) {

    const resolvedConfig = {...obj};

    await Promise.all(Object.keys(obj).map(async (key: string) => {

        if (typeof obj[key] === 'object') {

            if (isLoader(obj[key])) {

                resolvedConfig[key] = await resolveLoader(obj[key], loaders);

            } else {

                return resolveConf(obj[key], loaders);

            }

        } else if (typeof obj[key] === 'string' && isEnvironmentVariable(obj[key])) {

            const name = obj[key].slice(2, obj[key].length - 1);

            resolvedConfig[key] = process.env[name];

        }

    }));

    return resolvedConfig;

}

async function resolveLoader(obj: {[key: string]: any}, loaders: LoaderDict): Promise<any> {

    const [key] = Object.keys(obj); // [...]
    const name = key.slice(1, key.length - 1);
    const params = obj[key];

    if (!loaders[name]) throw new LoaderNotFound(name, loaders);

    const loader = loaders[name];

    return loader(params);

}
