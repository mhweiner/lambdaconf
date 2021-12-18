# lambdaconf

[![build status](https://github.com/mhweiner/lambdaconf/actions/workflows/workflow.yml/badge.svg)](https://github.com/mhweiner/lambdaconf/actions)
[![semantic-release](https://img.shields.io/badge/semantic--release-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()

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

2. Create a directory called `/conf` in the root of your project and create a `default.json` file. Below is a typical structure:
    ```shell script
    root/
    └── conf/
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
   
   - All configuration files must be a subset of the default configuration. Think of them simply as overrides to the default. That means for a configuration to exist in any 
   `.json` file, it must also exist in `default.json`. In Typescript terms, conf files must be of type `Partial<Conf>`. 
   In fact, the `Conf` type is simply created from the `default.json` file.
   
   - A property's type should not change simply because of a different environment, user, or deployment. This is basically saying the same as above.
   
   - `loaders` that are used on the same property in different files should all return the same type (again, same as above).

   - Arrays should be homogenous (not of mixed types).
   
   - The default configuration directory is `/conf`, but you can specify a custom directory with `process.env.CONF_DIR`

3. Add build step to your build process in your `package.json` file to build the `Conf` type declaration file. Example:
    
    ```json
    {
      "scripts": {
        "prepare": "lambdaconf"
      }
    }
    ```

    This must be run any time the configuration has changed. In the above example, the file will be generated after `npm i`. Some IDEs might have some issues with caching the generated `Conf.d.ts file` (which is stored in `node_modules`). If you run into this problem, try restarting Typescript.
    
# Usage

_First, make sure you have already done everything in Setup above!_

## Loading the Configuration

You must first *load* the config, which resolves any `loaders` and performs the merge.

```typescript
import {loadConf, getConf} from "lambdaconf";

loadConf().then(() => {

    //start server, etc.
    console.log(getConf()); // outputs config object

}).catch(console.log.bind(console));
```

## Getting the Config Object

Once loaded, use `getConf` to access:

```typescript
import {getConf} from "lambdaconf";

const conf = getConf(); // type of Conf is inferred

console.log(conf); // logs config object

const isFooBarEnabled: boolean = conf.foo.bar; // Typescript error if does not exist or type mismatch
```

If you need the type interface, you can import it:

```typescript
import {Conf} from "lambdaconf";
```

## Configuration, Overrides, and Merge Strategy

Configurations are merged in this order, with the later ones overriding the earlier ones:
 
1. default.json
2. environment file
3. deployment file
4. user file
5. CLI overrides

Which of these sources to choose depends on the presence of certain `process.env` configuration variables:

| **process.env**     | **conf file**                         |
| ------------------- | --------------------------------------|
| `NODE_ENV`          | `/conf/environments/[NODE_ENV].json`  |
| `DEPLOYMENT`        | `/conf/deployments/[DEPLOYMENT].json` |
| `USER`              | `/conf/users/[USER].json`             |
| `OVERRIDE`          | N/A                                   |

A few notes:

- `OVERRIDE` must be a valid JSON string with escaped quotes. Example:

```shell script
NODE_ENV=development OVERRIDE="{\"a\": {\"b\": \"q\"}}" ts-node src/index.ts
```

- `USER` is usually provided by default by UNIX environments (try `console.log(process.env.USER)`)
- `loaders` parameters are not merged. A `loader` instance is treated as a primitive. 
- Arrays are not merged

## Loaders

Loaders are lambda functions that are called during startup (run-time). A great example of this is fetching API keys from AWS Secrets Manager.

Loaders are run once during the type declaration build step (compile-time), and once while the configuration is loading (run-time). They can be normal functions or use async/await/Promise.

### Loader "foo" Example

_loaders/foo.ts_
```typescript
export function foo(params: {a: string}) {
    return Promise.resolve(`foo_${a}`);
}
```

_conf/default.json_
```json
{
  "foo": {
    "[foo]": {
      "a": "demo"
    }   
  }
}
```
_index.ts_

```typescript
import {loadConfig, getConf} from "lambdaconf";
import {foo} from './loaders/foo';

const loaders = [{foo}];

loadConfig(loaders)
        .then(() => {
           
           console.log(getConf().foo); // "foo_demo"

           //start server, etc.

        })
        .catch(console.log.bind(console));
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

### Formal definition

Loader functions must implement the `Loader` interface:

```typescript
interface Loader {
    [key: string]: (params: any) => any
}
```

It's not necessary, but you can import the Loader interface like so:

```typescript
import {Loader} from 'lambdaconf';
```

In a conf file, any object with a single property matching the pattern `/^\[.*\]$/` (or `[...]`) is assumed to refer to a loader. If a matching loader is not found, it will throw a `LoaderNotFound` error.



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
