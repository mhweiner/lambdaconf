# configspace

A simple yet powerful typed config library, written in TypeScript, that supports lambdas and differentiates between environment and deployment.

- Simple, easy to use API, and thorough documentation.
- Automatically generated Typescript typings for both "intellisense" IDE support and compile-time errors.
- Works with AWS Secrets Manager, AWS Parameter Store, or custom dynamic lambda functions.
- `.json` files (no code) help keep configs clean and flexible. Any required code goes in lambda functions ("loaders").
- Differentiates between concepts such as `environment`, `deployment`, and `user` and provides an out-of-the-box
  solution with sensible folder structure and merge strategy.
- Provides for overrides via CLI without polluting the CLI argument namespace.
- Forces user to put all possible settings into one default file for increased transparency and readability. Any override
  must satisfy `Partial<DefaultConfig>`.
- Clean, simple, readable code for future updates with minimal dependencies.

## Installation

```bash
npm i configspace -DE
```

## Setup

1. Install

2. Create a directory called `/config` in the root of your project and create a `default.json` file. Below is a typical structure:
    ```shell script
    root/
    └── config/
        └── deployments
            └── test.acme.json
        └── environments
            └── development.json
            └── production.json
        └── users
            └── john.json
        └── default.json
    ```
   
   - `default.json` is required, everything else is optional. Recommended practice is that this contains all of your "local development" settings.
   
   - All configuration files must be a subset of the default configuration. That means for a configuration to exist in any 
   `.json` file, it must also exist in `default.json`. In Typescript terms, all configurations must be of type `Partial<DefaultConfig>`. 
   In fact, the interface `Config` *is* created from the default. One of the main reasons for this limitation is due to 
   the fact that otherwise, a type declaration wouldn't be possible at compile time.
   
   - Arrays should all contain the same type (not mixed).
   
   - `loaders` that are on the same property should all return the same type. 
   
   - None of the above are enforced (except the required default), but future versions may
   check for these conditions and throw an error.

3. Add build step to your build process by using `build-config-type` in your npm scripts as desired. Example:
    
    ```shell script
    "scripts": {
      "build": "build-config-type"
    }
    ```

    Running this will compile the `Config` interface from your `default.json` file. This must be
    run before you can use load or access the configuration. We recommend this is run often to ensure your type
    declaration is always up-to-date. Two recommended options are to use `scripts.postinstall` or `scripts.prepare` in
    your package.json file.
    
## Usage

_First, make sure you have already done everything in Setup above!_

### Loading the Configuration

You must first *load* the config, which resolves any `loaders` and performs the merge.

```typescript
import {loadConfig, getConfig} from "configspace";

loadConfig().then(() => {

    //start server, etc.
    console.log(getConfig()); // outputs config object

}).catch(console.log.bind(console));
```

### Getting the Config Object

Once loaded, use `getConfig` to access:

```typescript
import {getConfig} from "configspace";

const config = getConfig(); // type of Config is inferred

console.log(config); // logs config object

const isFooBarEnabled: boolean = config.foo.bar; // Typescript error if does not exist or type mismatch
```

If you need the type interface, you can import it:

```typescript
import {Config} from "configspace";
```

### Configuration, Overrides, and Merge Strategy

Configurations are merged in order of importance, from least to most:
 
1. default
2. environment
3. deployment
4. user
5. overrides

These can be provided via CLI or `process.env`:

| **name**           | **process.env**     | **source**                             |
| ------------------ | ------------------- | ---------------------------------------|
| default            | N/A                 | /config/default.json                   |
| environment        | `NODE_ENV`          | /config/environments/[NODE_ENV].json   |
| deployment         | `DEPLOYMENT`        | /config/deployments/[DEPLOYMENT].json  |
| user               | `USER`              | /config/users/[USER].json              |
| overrides          | `OVERRIDE`          | N/A                                    |

A few notes:

- `OVERRIDE` must be a valid JSON string with escaped quotes. Example:

```shell script
NODE_ENV=development OVERRIDE="{\"a\": {\"b\": \"q\"}}" ts-node src/index.ts
```

- `USER` is usually provided by default by UNIX environments (try `console.log(process.env.USER)`)
- `loaders` parameters are not merged. A `loader` instance is treated as a primitive. 
- Arrays are not merged

### Loaders

Loaders are lambda functions that can return any value. They are run once during the type declaration build step, and once while the configuration is loading. They can be
normal functions or use async/await/Promise.

To register a loader, simply pass them to `loadConfig()`:

```typescript
import {loadConfig} from "configspace";

const loaders = [
    {foo_loader: async (params: {a: string}) => 'foo_' + params.a}
];

loadConfig(loaders).then(() => {

    //start server, etc.

}).catch(console.log.bind(console));
```

Example config using this loader:

```json
{
  "foo": {
    "[foo_loader]": {
      "a": "demo"
    }   
  }
}
```

Any object with a single property matching the pattern `/^\[.*\]$/` (or `[...]`) is assumed to be a loader. If a matching loader is not found, it will throw `LoaderNotFound`. Loaders must implement the `Loader` interface (you can also import it):

```typescript
interface Loader {
    [key: string]: (params: any) => any
}
```

## Contribution

Please contribute to this project! Issue a PR against `master` and request review. 

- Please test your work thoroughly.
- Make sure all tests pass with appropriate coverage.

### How to build locally

```bash
npm i
```

### Running tests

```shell script
npm test
```

### How to publish (for owners)

Create a release off of `master`. Be sure to use proper semver. Use `-rc[x]` for pre-releases. Also make sure to check 'pre-release' in GitHub page if you are publishing a pre-release. 
