# lambdaconf

[![build status](https://github.com/mhweiner/lambdaconf/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/lambdaconf/actions)
[![semantic-release](https://img.shields.io/badge/semantic--release-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()

A small, yet powerful typed and structured config library with lambda support for things like AWS Secrets Manager. Written in Typescript.

**Out-of-the-box Typescript support 🔒**
- Turn your runtime errors into safer compile-time errors! Automatically generated Typescript type definition for configuration object

**Simple & Easy to Use 😃**
- All settings are in simple, easily readable & logic free `.json` files.
- Highly structured. Any override must satisfy `Partial<DefaultConfig>`
- Enforces a simple and sensible folder structure
- Limited yet powerful feature set with clean documentation
- Small, simple, and modular codebase written in Typescript with no dependencies.

**Flexible & Powerful 💪**
- Provides for overrides via CLI without polluting the CLI argument namespace
- Differentiates between concepts such as `environment`, `deployment`, and `user` and provides an out-of-the-box
  solution with sensible merge strategy
- Fast. Runtime processing is done during app initialization only.
- Put [environment variables](#environment-variables-in-config-files) directly into .json files

**Lambda Support 🤖**
- Works with AWS Secrets Manager, AWS Parameter Store, or custom dynamic lambda functions
- Any custom logic can go here, keeping your config files logic-free
- Provides an easy sharable and reusable plugin interface for sharing or re-use

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Usage](#usage)
  - [Example Configuration File](#example-configuration-file)
  - [Configuration Rules](#configuration-rules)
  - [Loading the Configuration](#loading-the-configuration)
  - [Getting the Config Object](#getting-the-config-object)
  - [Configuration Merge Strategy](#configuration-merge-strategy)
  - [Using CLI overrides](#using-cli-overrides)
  - [Loaders](#loaders)
- [Recommended Best Practices](#recommended-best-practices)
- [Known Issues](#known-issues)
- [Contribution](#contribution)

## Installation & Setup

### 1. Install from `npm`

```shell
npm i lambdaconf
```

### 2. Create `conf` directory

Create a directory called `conf` in the root of your project. This is where your configuration will go, along with the generated Conf.d.ts TypeScript Declaration File. 

If you will be using the Environment, User, or Deployment [merge strategies](#configuration-overrides-and-merge-strategy), you will need to create those folders within `conf` as `environments`, `users`, and `deployments`, respectively.

Here's an example `conf` folder:

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

### 3. Create your configuration files

At a minimum, `default.json` is required at the root of your `conf` folder. 

See [full configuration rules](#configuration-rules), [merge strategy](#configuration-overrides-and-merge-strategy), and reference the example folder structure above.

### 4. Typescript Configuration (tsconfig.json)

Make sure the `conf/Conf.d.ts` file will be picked up by your Typescript parser. One way to do this is by including it in your `includes` directive like so:

```json
  "include":[
    "src/**/*",
    "conf/Conf.d.ts"
  ],
```

 If you're using `ts-node`, it might help to add the following:

```json
"ts-node": {
  "files": true
}
```

### 5. Call `lambdaconf` 

Whenever your configuration changes, you'll need to run the `lambdaconf` executable to build the type declaration file. One option is to add the following to your `package.json` file:
    
  ```json
  {
    "scripts": {
      "prepare": "lambdaconf"
    }
  }
  ```

To run this manually, you can run `npx lambdaconf`.

## Usage

### Example Configuration File

_conf/default.json_
```json
{
  "foo": "bar",
  "fruits": ["apples", "oranges"],
  "thingEnabled": false,
  "maxFruits": 123,
  "wow": {
    "foo": "bar"
  }
}
```

You can also use [loaders](#loaders) or [environment variables](#environment-variables-in-config-files).

### Configuration Rules

- `default.json` is required, everything else is optional. Recommended practice is that `default.json` contains all of your "local development" settings.

- All configuration files must be a subset of `default.json`. Think of them simply as overrides to the default. In Typescript terms, conf files must be of type `Partial<Conf>`.

- A property's type should not change simply because of a different environment, user, or deployment. This is basically saying the same as above.

- [Loaders](#loaders) that are used on the same property in different files should all return the same type (again, same as above).

- Arrays should be homogenous (not of mixed types).

### Loading the Configuration

You must first *load* the config, which resolves any [loaders](#loaders) and performs the merge. 

We <b>strongly</b> recommend you call `loadConf()` before your app starts, ie, during initialization, before `app.listen(), etc.`.This will cache the configuration so there will be no performance penalty.

Either way, the configuration will only load once, as it will be cached.

```typescript
import {loadConf, getConf} from "lambdaconf";

loadConf().then(() => {

    //start server, etc.
    console.log(getConf()); // outputs config object

}).catch(console.log.bind(console));
```

### Getting the Config Object

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

### Configuration Merge Strategy

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

### Using CLI Overrides

You can use the `OVERRIDE` environment variable to override properties via CLI. `OVERRIDE` must be valid JSON. Example:

```shell script
OVERRIDE="{\"a\": {\"b\": \"q\"}}" ts-node src/index.ts
```

When using with npm scripts, it might be useful to use command substitution like so:

```json
{
   "start": "OVERRIDE=$(echo '{\"postgres\": \"localhost\"}') ts-node src/index.ts"
}
```

This is especially useful if you want to make use of environment variables (notice the extra single quotes):

```json
{
   "start": "OVERRIDE=$(echo '{\"postgres\": \"'$DATABASE_URL'\"}') ts-node src/index.ts"
}
```

⚠️ _Use caution! CLI overrides are not checked by Typescript's static type checking, and there is currently no runtime type checking feature. Feel free to submit an issue or PR if you want this._

### Environment Variables in Config Files

You can use environment variables as values by wrapping it in `${...}`. For example, to use environment variable `FOO`, use `${FOO}`. This will translate to `process.env.FOO`. These will always be typed as strings. Example config file:

```json
{
  "foo": "${FOO}"
}
```

### Loaders

Loaders are lambda functions that are called during startup (run-time). A great example of this is fetching API keys from AWS Secrets Manager.

Loaders are run once during the type declaration build step (compile-time), and once while the configuration is loading (run-time). They can be normal functions or use async/await/Promise.

#### Example

_conf/default.json_
```json
{
  "foo": {
    "[foo]": {
      "a": "demo"
    }   
  },
  "bar": {
    "[add10]": 42
  }
}
```
_index.ts_

```typescript
import {loadConfig, getConf} from "lambdaconf";

const loaders = {
    foo: (params: {a: string}) => Promise.resolve(`foo_${a}`),
    add10: (val: number) => number + 10,
};

loadConfig(loaders)
    .then(() => {
        console.log(getConf().foo); // "foo_demo"
        console.log(getConf().bar); // 52
        //start server, etc.
    })
    .catch(console.log.bind(console));
```

#### Usage

Loader functions must extend `(params: any) => any`. If helpful, you can import the `Loader` type like so:

```typescript
import type {Loader} from 'lambdaconf';
```

In a conf file, any object with a single property matching the pattern `/^\[.*\]$/` (`[...]`) is assumed to call a loader. If a matching loader is not found, it will throw a `LoaderNotFound` error.

## Recommended Best Practices

- `default.json` should contain all of your local development settings, and then "progressively enhance" from there.
- Include `loadConf().then(...)` or `await loadConf()` in your startup process before your server starts listening (ie, before `app.listen()`).
- Create all of the merge folders (ie. deployments) even if you're not using them.
- Use AWS Secrets Manager or Hashicorp Vault to store your sensitive information and use a [loader](#loaders) to load them.


## Known Issues

1. Some IDEs (particularly IntelliJ/Webstorm) occasionally have some issues with caching of the generated `Conf.d.ts file` (which is stored in your `conf` folder). If you run into this problem, restarting your TS service.

## Contribution

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
