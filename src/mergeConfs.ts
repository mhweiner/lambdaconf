import {isLoader} from './isLoader';

export function mergeConfs(p: {
    Default: Record<string, any>
    environment?: Record<string, any>
    deployment?: Record<string, any>
    user?: Record<string, any>
    overrides?: Record<string, any>
}): Record<string, any> {

    // put into order of importance, least to most
    const configs = [
        p.Default,
        p.environment || {},
        p.deployment || {},
        p.user || {},
        p.overrides || {},
    ];

    return configs.reduce((mergedConfig, config) => mergeConfigs(mergedConfig, config), {});

}

function mergeConfigs(obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any> {

    const merged = {...obj1, ...obj2};

    Object.keys(merged).forEach((key) => {

        const obj1Value = obj1[key];
        const obj2Value = obj2[key];

        if (
            typeof obj1Value === 'object'
            && typeof obj2Value === 'object'
            && !isLoader(obj1Value)
            && !isLoader(obj2Value)
            && !Array.isArray(obj1Value)
            && !Array.isArray(obj2Value)
        ) {

            merged[key] = mergeConfigs(obj1Value, obj2Value);

        }


    });

    return merged;

}
