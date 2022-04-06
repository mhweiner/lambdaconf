import {InvalidConf} from './errors';
import {AnyObject} from './index';

export function getEnvOverrides(): AnyObject {

    const overrides = process.env.OVERRIDE;

    if (overrides) {

        try {

            return JSON.parse(overrides) as AnyObject;

        } catch (e) {

            throw new InvalidConf(['process.env.OVERRIDES is not valid JSON']);

        }

    } else {

        return {};

    }

}
