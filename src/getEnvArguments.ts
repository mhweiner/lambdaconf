import {getEnvOverrides} from './getEnvOverrides';
import {AnyObject} from './index';

export function getEnvArguments(): {
    environment: string
    deployment: string
    user: string
    overrides: AnyObject
} {

    return {
        environment: process.env.NODE_ENV || '',
        deployment: process.env.DEPLOYMENT || '',
        user: process.env.USER || '',
        overrides: getEnvOverrides(),
    };

}
