# lastconf

> The ultimate configuration library, has it all in. Last one you ever going to use.

The module takes care of configuration options discovery, parsing and merging

global/local/prod/qa/etc. config files, environment variables, command line options, hardcoded and default values – all is taken care of.

json, js, yaml, ini – pick your configuration language and `lastconf` will just take it.


## Installation

```bash
npm i lastconf -S
```

## Example

config/config.yaml
```yaml
database:
	host: awsdbexample.org
	port: 4321
```

```javascript
const conf = require("lastconf")();

console.info("database host:", conf.get("database.host"));

```

## API

```javascript
const conf = require("lastconf")(options, hardcodedValuesObject);
```
where options are:
- default – object with initial params, likely to be overwritten.
- separator - what separates multi-level keys, like in `databases.ex1.host`. Default is `.`
- environmentSeparator - same as above, but for the environment vars. Default is `__`
- dir – folder where all config files supposed to be located. Default is `./config`

## Rules

- All keys internally a lowerkeyed. As such, `.get("SomeKey")` function can take whatever, but turn the key to lowercase.
- Priority sequence:
	- `options.defaults` parameter
	- configs from files
	- environment vars
	- command line iptions
	- `hardcoded` parameters

- Note to environment vars: unless configured otherwise `hyperconfig` will try to extract only keys that have extracted already.

- Files in order:
	- config.schema -- validation (Joe?)
	- config
	- config.<NODE_ENV>
	- config.local -- never checked in.

- Extensions for each file to try in order:
	- json
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
- .ini parsing
- extra file names to discovery and parse
- `.has` function
- validation or at least mandatory params check.

## Other npms with similar functionality in no particular order:
- nconf
- node-config
