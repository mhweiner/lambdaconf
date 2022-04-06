import {loadConfFile} from './loadConfFile';
import {AnyObject} from './index';

export function loadConfFromFiles(p: {
    environment?: string
    deployment?: string
    user?: string
}): {
        Default: AnyObject
        environment: AnyObject
        deployment: AnyObject
        user: AnyObject
    } {

    return {
        Default: loadConfFile('/default.json'),
        environment: p.environment ? loadConfFile(`/environments/${p.environment}.json`) : {},
        deployment: p.deployment ? loadConfFile(`/deployments/${p.deployment}.json`) : {},
        user: p.user ? loadConfFile(`/users/${p.user}.json`) : {},
    };

}
