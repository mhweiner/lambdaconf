export function isLoader(prop: {[key: string]: object}): boolean {

    const keys = Object.keys(prop);

    return keys.length === 1 && /^\[.*\]$/.test(keys[0]);

}
