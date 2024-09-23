import {InvalidConf} from './errors';
import {toResult} from './lib/toResult';

export function getEnvOverrides(): Record<string, any> {

    const overrides = process.env.OVERRIDE;

    if (overrides) {

        const [err, json] = toResult(() => JSON.parse(overrides));

        if (err) {

            throw new InvalidConf(['process.env.OVERRIDE is not valid JSON']);

        }

        return json;

    } else {

        return {};

    }

}
