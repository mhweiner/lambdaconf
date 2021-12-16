import * as path from 'path';

export function getDistDir() {

    return path.resolve(`${process.cwd() + (process.env.NODE_MODULES_DIR || '/node_modules')}/typedconfig/dist`);

}
