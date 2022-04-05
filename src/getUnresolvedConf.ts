import {loadConfFile} from './loadConfFile';
import {getConfDir} from './getConfDir';
import {InvalidConf} from './errors';
import {isLoader} from './isLoader';

/**
 * Returns unresolved config (configuration is sourced and merged, but loaders and environment variables remain
 * unresolved).
 * @param environment
 * @param deployment
 * @param user
 * @param overrides
 */
export function getUnresolvedConf(
    environment?: string,
    deployment?: string,
    user?: string,
    overrides?: object
) {

    const configDir = getConfDir();
    const conf_default = loadConfFile(`${configDir}/default.json`);

    if (!conf_default) {

        throw new InvalidConf(['Unable to find default configuration.']);

    }

    const conf_environment = environment ? loadConfFile(`${configDir}/environments/${environment}.json`) : {};
    const conf_deployment = deployment ? loadConfFile(`${configDir}/deployments/${deployment}.json`) : {};
    const conf_user = user ? loadConfFile(`${configDir}/users/${user}.json`) : {};
    const conf_overrides = overrides || {};

    // put into order of importance, least to most
    const configs = [
        conf_default,
        conf_environment,
        conf_deployment,
        conf_user,
        conf_overrides,
    ];

    return configs.reduce((mergedConfig, config) => mergeConfigs(mergedConfig, config), {});

}

function mergeConfigs(obj1: {[key: string]: any}, obj2: {[key: string]: any}): object {

    const merged = {...obj1, ...obj2};

    Object.keys(merged).forEach((key) => {

        const obj1Value = obj1[key];
        const obj2Value = obj2[key];

        if (
            typeof obj1Value === 'object'
            && typeof obj2Value === 'object'
            && !isLoader(obj1Value as {[key: string]: any})
            && !isLoader(obj2Value as {[key: string]: any})
            && !Array.isArray(obj1Value)
            && !Array.isArray(obj2Value)
        ) {

            merged[key] = mergeConfigs(obj1Value, obj2Value);

        }


    });

    return merged;

}
