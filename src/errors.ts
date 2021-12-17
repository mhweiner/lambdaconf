export class InvalidConf extends Error {

    validationErrors: string[];

    constructor(validationErrors: string[]) {

        super('INVALID_CONF');
        Error.captureStackTrace(this, InvalidConf);
        this.validationErrors = validationErrors;

    }

    toString() {

        return `${this.name}: ${this.validationErrors.join(', ')}`;

    }

}

export class ConfNotLoaded extends Error {

    constructor() {

        super('CONF_NOT_LOADED');
        Error.captureStackTrace(this, ConfNotLoaded);

    }

}

export class LoaderNotFound extends Error {

    constructor(loaderName: string, availableLoaders: string[]) {

        super(`LOADER_NOT_FOUND: "${loaderName}". Available loaders: ${availableLoaders.join(', ')}`);
        Error.captureStackTrace(this, LoaderNotFound);

    }

}
