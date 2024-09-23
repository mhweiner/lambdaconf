export function debug(...args: any[]): void {

    if (process.env.LAMBDACONF_DEBUG) {

        console.log('[lambdaconf]', ...args);

    }

}
