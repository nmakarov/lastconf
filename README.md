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
- *dir* – folder where all config files supposed to be located. Default is `./config`

and `hardcodedValuesObject` is just a hash that will overwrite anything.

## Rules

- All keys internally a lowerkeyed. As such, `.get("SomeKey")` function can take whatever, but turn the key to lowercase.
- Priority sequence:
	- `options.defaults` parameter
	- configs from files
	- environment vars
	- command line options
	- `hardcoded` parameters

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

## todo
- allowed keys param for environment vars – explicitly specify what vars are allowed there
- extra file names to discovery and parse
- `.has` function
- validation or at least mandatory params check.
- debugging of what file was and was not discovered
- native error handling&reporting while parsing files – should informatively tell where the error was.
- add a param that specify config file name to process in addition to standard ones

## Other npms with similar functionality in no particular order:
- nconf
- node-config
