import * as path from 'path';

export function getConfigDir() {

    return path.resolve(process.cwd() + (process.env.CONFIG_DIR || '/config'));

}
