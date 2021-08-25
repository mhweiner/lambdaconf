import {LoaderNotFound} from './errors';
import {Loader} from '.';

export async function resolveLoader(obj: {[key: string]: object}, loaders: Loader[]): Promise<any> {

    const [key] = Object.keys(obj); //[...]
    const name = key.substr(1, key.length - 2); //removed brackets
    const [params] = Object.values(obj);
    const [loader] = loaders.filter((loader) => Object.keys(loader)[0] === name)
        .map((loader) => Object.values(loader)[0]);

    if (!loader) {

        throw new LoaderNotFound(name, loaders.map((loader) => Object.keys(loader)[0]));

    }

    return loader(params);

}
