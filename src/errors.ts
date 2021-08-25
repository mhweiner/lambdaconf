export class InvalidConfig extends Error {

    validationErrors: string[];

    constructor(validationErrors: string[]) {

        super('INVALID_CONFIG');
        Error.captureStackTrace(this, InvalidConfig);
        this.validationErrors = validationErrors;

    }

    toString() {

        return `${this.name}: ${this.validationErrors.join(', ')}`;

    }

}

export class ConfigNotLoaded extends Error {

    constructor() {

        super('CONFIG_NOT_LOADED');
        Error.captureStackTrace(this, ConfigNotLoaded);

    }

}

export class LoaderNotFound extends Error {

    constructor(loaderName: string, availableLoaders: string[]) {

        super(`LOADER_NOT_FOUND: "${loaderName}". Available loaders: ${availableLoaders.join(', ')}`);
        Error.captureStackTrace(this, LoaderNotFound);

    }

}
