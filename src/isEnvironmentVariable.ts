export function isEnvironmentVariable(value: string) {

    return /^\$\{[a-zA-Z]+.*\}$/.test(value);

}
