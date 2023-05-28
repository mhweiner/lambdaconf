import {ConfNotLoaded} from './errors';
import {getEnvArguments} from './getEnvArguments';
import {resolveConf} from './resolveConf';
import {loadConfFromFiles} from './loadConfFromFiles';
import {mergeConfs} from './mergeConfs';

export interface Conf {}

export type Loader<I, O> = (params: I) => O;
export type LoaderDict = {[name: string]: Loader<any, any>};

export type AnyObject = {[key: string]: any};

let resolvedConf: AnyObject;

export async function loadConf(loaders: LoaderDict = {}): Promise<Conf> {

    const env = getEnvArguments();
    const confSources = loadConfFromFiles(env);
    const mergedConf = mergeConfs(confSources);

    resolvedConf = await resolveConf(mergedConf, loaders);

    return resolvedConf as Conf;

}

export function getConf(): Conf {

    if (!resolvedConf) {

        throw new ConfNotLoaded();

    }

    return resolvedConf as Conf;

}

export * from './writeConfFile';
