import {ConfNotLoaded} from './errors';
import {getEnvArguments} from './getEnvArguments';
import {getUnresolvedConf} from './getUnresolvedConf';
import {resolveConf} from './resolveConf';
import {Conf} from './Conf';

export interface Loader {
    [key: string]: (params: object) => any
}

let resolvedConf: {[key: string]: any};

export async function loadConf(loaders?: Loader[]): Promise<Conf> {

    const env = getEnvArguments();
    const unresolvedConf = getUnresolvedConf(
        env.environment,
        env.deployment,
        env.user,
        env.overrides
    );

    resolvedConf = await resolveConf(unresolvedConf, loaders);

    return resolvedConf as Conf;

}

export function getConf(): Conf {

    if (!resolvedConf) {

        throw new ConfNotLoaded();

    }

    return resolvedConf as Conf;

}

export {Conf};
export * from './writeDeclarationFile';
