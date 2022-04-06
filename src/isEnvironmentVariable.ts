export function isEnvironmentVariable(value: string): boolean {

    return /^\$\{[a-zA-Z]+.*\}$/.test(value);

}
