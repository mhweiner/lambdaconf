import {getEnvOverrides} from './getEnvOverrides';

export function getEnvArguments() {

    return {
        environment: process.env.NODE_ENV || '',
        deployment: process.env.DEPLOYMENT || '',
        user: process.env.USER || '',
        overrides: getEnvOverrides(),
    };

}
