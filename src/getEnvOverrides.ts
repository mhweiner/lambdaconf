import {InvalidConfig} from './errors';

export function getEnvOverrides(): {[key: string]: object} {

    const overrides = process.env.OVERRIDE;

    if (overrides) {

        try {

            return JSON.parse(overrides);

        } catch (e) {

            throw new InvalidConfig(['process.env.OVERRIDES is not valid JSON']);

        }

    } else {

        return {};

    }

}
