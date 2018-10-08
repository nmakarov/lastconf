# lastconf

> The ultimate configuration library, has it all in. Last one you ever going to use.

The module takes care of configuration options discovery, parsing and merging. Just put your config files into the `config` folder – and you're done!

global/local/prod/qa/etc. config files, environment variables, command line options, hardcoded and default values – all is taken care of.

json, js, json5, yaml, ini – pick your configuration language and `lastconf` will just take it.


## Installation

```bash
npm i lastconf -S
```

## Example

config/config.yaml
```yaml
database:
  host: dbhost.example.org
  port: 4321
```

```javascript
const conf = require("lastconf")();

console.info("database host:", conf.get("database.host"));

```

i.e. to initialize config call exported object upon require as a function or call `init()` on it later.

Typicaly your `config` folder should include the following:
- config.json5 - some defaults
- config.development.json5 – overwrites pointers to db/api/whatever remote services to local ones
- config.test.json5 – a set of variables used for testing
- config.local.json5 - totally local stuff, this file should never be checked in.

Note: if environment is explicitly set (say, NODE_ENV=TEST), local settings from `config.local.json5` are ignored. But vars from environment and command line still takes precedence.

## API

```javascript
const conf = require("lastconf")(options, hardcodedValuesObject);
```
where `options` are:
- *default* – object with initial params, likely to be overwritten.
- *separator* - what separates multi-level keys, like in `databases.ex1.host`. Default is `.`
- *environmentSeparator* - same as above, but for the environment vars. Default is `__`
- *folder* – folder where all config files supposed to be located. Default is `config`
- *location* - where *folder* fith config files to be found. By default it is where the script is run from (project, top level folder). If it is *script*, then main script location-related. I.e. if your script is located in some sub-folder, *config* folder should be at the same level.
- *debug* a bit of info as to where the *config* files are read from and which ones are read and in what order.

and `hardcodedValuesObject` is just a hash that will overwrite anything.

## Rules

- All keys internally a lowerkeyed. As such, `.get("SomeKey")` function can take whatever, but turn the key to lowercase.
- Priority sequence:
	- `options.defaults` parameter
	- configs from files
	- command line options
	- `hardcoded` parameters
	- environment vars

- Note to environment vars: unless configured otherwise `hyperconfig` will try to extract only keys that have extracted already.

- Files in order:
	- config
	- config.local -- never checked in.
	- config.<NODE_ENV>
	- config.<NODE_ENV>.local -- never checked in.

i.e, for the `development`:
* config.json
* config.local.json
* config.development.json
* config.development.local.json

and for `test`:
* config.json
* config.local.json
* config.test.json
* config.test.local.json

as it is seen, the first two configs are common, and the last two differ.


- Extensions for each file to try in order:
	- json
	- json5
	- js
	- yaml
	- ini

-- if all developers configure their machines alike, there'll be no need for the dedicated `config.local` file.

## Sensible defaults
- Config folder: `./config`
- keys separator: `.`
- environment variable keys separator: `__`

## using the environment variables
env vars are processed and placed into the config object tree after all config files are processed; but the processor needs to know which of the env vars to take and process. So for each env var processor will look in the built tree to find the match. In other words, the key should exist in config for the env var to be processed. So either define needed keys in the `config.js`, values might be `null` or whatever or just pass the `defaults` object while initializing the `lastconf`.

## config files location
By default, it will look for files in `./config` folder from where the app is launched, typically, project root. Name of the folder is controlled by a `folder` option (i.e. `config` by default). Location of this `config` is controlled by a `location` option: if it is defined as `{ location: "script" }` this `config` folder will be relative to the location of the main script itself. Useful when several different scripts need to use different configs.

## using config in different app modules
Since this `lastconf` is a singleton (by the nature of node modules), it needs to be configured once, likely, at the main app file, like so:
```
// main app:
const conf = require("lastconf")({
	separator: ":",
	debug: true,
})
```
after this point config is initialized and assembled. Any other modules now can simply get the reference to this config like so:
```
// some other module:
const conf = require("lastconf");

initializeDatabase(conf.get("database:config")); // note use of `:` – this separator was configured in the main app
```

## Reading config values
```
	const key = config.get("simpleKey");
	const key = config.get("some.nested.value");
```
it can return whatever value is found on that key – simple scalar or a portion of config object, starting from that key

or get the whole config as an object:
```
	const conf = config.json();
```

or a portion thereof:
```
	const conf = config.json("some.nested");
```
which is essentially the same as `config.get("some.nested"), really`


## resolving paths
The same config can be used by different apps from different folders. And if
some config parameter needs to specify some relative folder, it might be a problem.
it might be solved by making a relative path using `__dirname` in the .js config file
```
	...
	directory: __dirname + '/../db/migrations'
	...
```

or by using a special resolvable placeholder `%%%configFolder%%%`:
```
	...
    directory: '%%%configFolder%%%/../db/migrations',
    ...
```

## real world example

let's say a project requires knex config for running knex cli commands as well as a server that needs to have a database config. All is defined in a single `servers/config/config.js` file:
```
module.exports = {
  knex: {
    client: 'postgresql',
    connection: {
      database: 'projectdb-dev',
      user:     '',
      password: ''
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: '%%%configFolder%%%/../db/migrations',
    },
    seeds: {
      directory: '%%%configFolder%%%/../db/seeds'
    }
  },
};
```

knexfile.js is like so:
```
const conf = require("lastconf")({ folder: "servers/config" }).get("knex");

module.exports = {
  ...conf,
};

```

and server.js have this snippet:
```
const config = require("lastconf")({ location: "script" });
const bookshelf = require("./bookshelf")(config.get("knex"));
```

and both scripts can be easily run from the project root:
```
knex migrate:rollback; knex migrate:latest; knex seed:run
nodemon servers/server.js
```

## todo

- Currently, it throws an exception if config file contains an error for jsons only. Do the same for every other type.

- validation or at least mandatory params check.

- native error handling&reporting while parsing files – should informatively tell where the error was (kinda works for `.js` files)

- add a param that specify config file name to process in addition to standard ones (really needed?)

- `.has` function (really needed?)


## Other npms with similar functionality in no particular order:
- nconf
- node-config
- dotenv (just treats env vars, won't allow for multiple configurations)
