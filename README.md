# hyperconfig
The ultimate configuration, has it all in.


## Rules

- All keys internally a lowerkeyed. As such, `.get("SomeKey")` function can take whatever, but turn the key to lowercase.
- Priority sequence:
	- `options.defaults` parameter
	- configs from files
	- environment vars
	- command line iptions
	- `hardcoded` parameter

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
	- ?

-- if all developers configure their machines alike, there'll be no need for the dedicated `config.local` file.

## Sensible defaults
- Config folder: `./config`