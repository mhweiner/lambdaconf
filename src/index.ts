import {ConfigNotLoaded} from './errors';
import {getEnvArguments} from './getEnvArguments';
import {getUnresolvedConfig} from './getUnresolvedConfig';
import {resolveConfig} from './resolveConfig';
import {Config} from './Config';

export interface Loader {
    [key: string]: (params: object) => any
}

let resolvedConfig: {[key: string]: any};

export async function loadConfig(loaders?: Loader[]): Promise<Config> {

    const env = getEnvArguments();
    const unresolvedConfig = getUnresolvedConfig(
        env.environment,
        env.deployment,
        env.user,
        env.overrides
    );

    resolvedConfig = await resolveConfig(unresolvedConfig, loaders);

    return resolvedConfig as Config;

}

export function getConfig(): Config {

    if (!resolvedConfig) {

        throw new ConfigNotLoaded();

    }

    return resolvedConfig as Config;

}

export {Config};
export * from './writeDeclarationFile';
