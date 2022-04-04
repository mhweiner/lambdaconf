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
- All settings are in simple `.json` files. No logic (those can go into [loaders](#loaders))
- Highly structured. Any override must satisfy `Partial<DefaultConfig>`
- Enforces a simple and sensible folder structure
- Limited yet powerful feature set with clean documentation
- Small, simple, and modular codebase written in Typescript with no dependencies.

**Flexible & Powerful 💪**
- Provides for overrides via CLI without polluting the CLI argument namespace
- Differentiates between concepts such as `environment`, `deployment`, and `user` and provides an out-of-the-box
  solution with sensible merge strategy

# Table of Contents

- [Installation & Setup](#installation--setup)
- [Usage](#usage)
  - [Example Configuration File](#example-configuration-file)
  - [Configuration Rules](#configuration-rules)
  - [Loading the Configuration](#loading-the-configuration)
  - [Getting the Config Object](#getting-the-config-object)
  - [Configuration, Overrides, and Merge Strategy](#configuration-overrides-and-merge-strategy)
  - [Using CLI overrides](#using-cli-overrides)
  - [Loaders](#loaders)
- [Known Issues](#known-issues)
- [Contribution](#contribution)

# Installation & Setup

1. Install from `npm`

    ```bash
    npm i lambdaconf -D
    ```

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
   
   `default.json` is required, everything else is optional. [See full rules](#configuration-rules).


3. Call `lambdaconf` to build the type declaration file. It is recommended to add the following to your `package.json` file:
    
    ```json
    {
      "scripts": {
        "prepare": "lambdaconf"
      }
    }
    ```

    `lambdaconf` must be run any time the configuration has changed. Feel free to set this up however you want. There is a [known issue](#known-issues) with certain IDE's caching this file.
    
# Usage

## Example Configuration File

_conf/default.json_
```json
{
   "foo": "bar"
}
```

Yup, it's just simple JSON. You can also use [loaders](#loaders).

## Configuration Rules

- `default.json` is required, everything else is optional. Recommended practice is that this contains all of your "local development" settings.

- All configuration files must be a subset of `default.json`. Think of them simply as overrides to the default. In Typescript terms, conf files must be of type `Partial<Conf>`.

- A property's type should not change simply because of a different environment, user, or deployment. This is basically saying the same as above.

- [Loaders](#loaders) that are used on the same property in different files should all return the same type (again, same as above).

- Arrays should be homogenous (not of mixed types).

## Loading the Configuration

You must first *load* the config, which resolves any [loaders](#loaders) and performs the merge.

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

- `OVERRIDE` must be valid JSON. [Learn more](#using-cli-overrides)
- `USER` is usually provided by default by UNIX environments (try `console.log(process.env.USER)`)
- [Loaders](#loaders) parameters are simply replaced, not merged. A `loader` instance is treated as a primitive.
- Arrays are simply replaced, not merged.

## Using CLI overrides

You can use the `OVERRIDE` environment variable to override properties via CLI. `OVERRIDE` must be valid JSON. Example:

```shell script
OVERRIDE="{\"a\": {\"b\": \"q\"}}" ts-node src/index.ts
```

When using with npm scripts, it might be useful to use command substitution like so:

```json
{
   "start": "OVERRIDE=$(echo '{\"postgres\": \"MY_DATABASE_URL\"}') ts-node src/index.ts"
}
```

This is especially useful if you want to make use of environment variables (notice the extra single quotes):

```json
{
   "start": "OVERRIDE=$(echo '{\"postgres\": \"'$DATABASE_URL'\"}') ts-node src/index.ts"
}
```

_⚠️Use caution! CLI overrides are not checked by Typescript's static type checking, and there is currently no runtime type checking feature. Feel free to submit an issue or PR if you want this._

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

To register a loader, simply pass it in an array to `loadConfig()`.

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

# Known Issues

1. Some IDEs (particularly IntelliJ/Webstorm) have some issues with caching of the generated `Conf.d.ts file` (which is stored in `node_modules/lambdaconf`). If you run into this problem, try [restarting the Typescript service](https://www.jetbrains.com/help/webstorm/typescript-compiler-tool-window.html#ws_ts_tool_window_toolbar).

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
