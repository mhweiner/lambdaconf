import {AnyObject} from './index';
import {isLoader} from './isLoader';

export function mergeConfs(p: {
    Default: AnyObject
    environment?: AnyObject
    deployment?: AnyObject
    user?: AnyObject
    overrides?: AnyObject
}): AnyObject {

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

function mergeConfigs(obj1: {[key: string]: any}, obj2: {[key: string]: any}): AnyObject {

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
