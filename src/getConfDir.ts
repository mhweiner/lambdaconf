import * as path from 'path';

export function getConfDir(): string {

    return path.resolve(process.cwd() + (process.env.CONF_DIR || '/conf'));

}
