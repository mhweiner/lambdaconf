# lambdaconf

A small, yet powerful typed and structured config library with lambda support for things like AWS Secrets Manager. Written in Typescript.

**Out-of-the-box Typescript support 🔒**
- Turn your runtime errors into safer compile-time errors! Automatically generated Typescript type definition for configuration object

**Lambda Support 🤖**
- Works with AWS Secrets Manager, AWS Parameter Store, or custom dynamic lambda functions
- Any custom logic can go here, keeping your config files logic-free
- Provides an easy sharable and reusable plugin interface for sharing or re-use

**Simple & Easy to Use 😃**
- All settings are in simple `.json` files. No logic (those can go into loaders)
- Highly structured. Any override must satisfy `Partial<DefaultConfig>`
- Enforces a simple and sensible folder structure
- Limited yet powerful feature set with clean documentation
- Small, simple, and modular codebase written in Typescript with no dependencies.

**Flexible & Powerful 💪**
- Provides for overrides via CLI without polluting the CLI argument namespace
- Differentiates between concepts such as `environment`, `deployment`, and `user` and provides an out-of-the-box
  solution with sensible merge strategy

# Installation

```bash
npm i lambdaconf -D
```

# Setup

1. Install from npm

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
   `.json` file, it must also exist in `default.json`. In Typescript terms, all possible computed configurations must be of type `Partial<DefaultConfig>`. 
   In fact, the interface `Config` is simply created from the `default.json` file. One of the main reasons for this limitation is that a type declaration wouldn't otherwise be possible at compile time.
   
   - Arrays should be homogenous (not of mixed types).
   
   - `loaders` that are used the same property in different config files should all return the same type (since again, that type is defined only in default.json)
   
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
    
# Usage

_First, make sure you have already done everything in Setup above!_

## Loading the Configuration

You must first *load* the config, which resolves any `loaders` and performs the merge.

```typescript
import {loadConfig, getConfig} from "lambdaconf";

loadConfig().then(() => {

    //start server, etc.
    console.log(getConfig()); // outputs config object

}).catch(console.log.bind(console));
```

## Getting the Config Object

Once loaded, use `getConfig` to access:

```typescript
import {getConfig} from "lambdaconf";

const config = getConfig(); // type of Config is inferred

console.log(config); // logs config object

const isFooBarEnabled: boolean = config.foo.bar; // Typescript error if does not exist or type mismatch
```

If you need the type interface, you can import it:

```typescript
import {Config} from "lambdaconf";
```

## Configuration, Overrides, and Merge Strategy

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

## Loaders

Loaders are lambda functions that can return any value. They are run once during the type declaration build step, and once while the configuration is loading. They can be
normal functions or use async/await/Promise.

To register a loader, simply pass them to `loadConfig()`:

```typescript
import {loadConfig} from "lambdaconf";

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

# Contribution

Please contribute to this project! Issue a PR against `master` and request review. 

- Please test your work thoroughly.
- Make sure all tests pass with appropriate coverage.

## How to build locally

```bash
npm i
```

## Running tests

```shell script
npm test
```
