/* eslint-disable import/no-dynamic-require, global-require */

const _ = require("lodash");
const Yaml = require("js-yaml");
const JSON5 = require("json5");
const INI = require("ini");
const fs = require("fs");
const path = require("path");

let config = {};
let options = null;
let separator = null;
let envSeparator = null;
let configFolder = null;
let env = null;
let debug = false;

const logger = console;

const d = (msg) => {
	if (debug) {
		logger.info("[debug]", msg);
	}
};

class ParseError extends Error {}

const lastconf = (opts, hardcoded = {}) => lastconf.init(opts, hardcoded);

lastconf.init = (opts, hardcoded = {}) => {
	options = opts || {};
	debug = options.debug || false;
	separator = options.separator || ".";
	envSeparator = options.environmentSeparator || "__";
	// `options.location` might be specified as "script" or default whatever

	const location = options.location === "script" ? path.dirname(process.mainModule.filename) : "./";
	configFolder = path.resolve(`${location}/${options.folder || "config"}`);
	d("[debug] config files will be read from", configFolder);
	lastconf.env = options.env || process.env.NODE_ENV || "development";

	config = options.defaults || {};

	const checkEnv = (allowedKeys = []) => {
		const res = {};
		Object.keys(process.env).forEach((key) => {
			const k = key.toLowerCase();
			if (allowedKeys.indexOf(k) !== -1) {
				d(`from environment: key "${k}"`);
				lastconf.set(k, process.env[key], envSeparator);
			}
		});
		return res;
	};


	_.merge(config, lastconf.loadJSON("config"));
	_.merge(config, lastconf.loadJson5("config"));
	_.merge(config, lastconf.loadJS("config"));
	_.merge(config, lastconf.loadYaml("config"));
	_.merge(config, lastconf.loadIni("config"));
	_.merge(config, lastconf.loadJSON("config.local"));
	_.merge(config, lastconf.loadJson5("config.local"));
	_.merge(config, lastconf.loadJS("config.local"));
	_.merge(config, lastconf.loadYaml("config.local"));
	_.merge(config, lastconf.loadIni("config.local"));
	_.merge(config, lastconf.loadJSON(`config.${lastconf.env}`));
	_.merge(config, lastconf.loadJson5(`config.${lastconf.env}`));
	_.merge(config, lastconf.loadJS(`config.${lastconf.env}`));
	_.merge(config, lastconf.loadYaml(`config.${lastconf.env}`));
	_.merge(config, lastconf.loadIni(`config.${lastconf.env}`));
	_.merge(config, lastconf.loadJSON(`config.${lastconf.env}.local`));
	_.merge(config, lastconf.loadJson5(`config.${lastconf.env}.local`));
	_.merge(config, lastconf.loadJS(`config.${lastconf.env}.local`));
	_.merge(config, lastconf.loadYaml(`config.${lastconf.env}.local`));
	_.merge(config, lastconf.loadIni(`config.${lastconf.env}.local`));

	_.merge(config, checkEnv(lastconf.flattenKeys(config, envSeparator)));

	// always last one, to allow a quick`n`durty _temporary_ override
	// of some params in the main app to test something
	_.merge(config, hardcoded);

	lastconf.resolvePaths(config);

	return lastconf;
};


lastconf.json = root => (root ? lastconf.get(root) : config);

lastconf.get = (key, sep = separator, c = config) => {
	let cc = c;
	const pieces = key.split(sep);
	while (pieces.length) {
		const piece = pieces.shift();
		cc = cc[piece];
	}
	return cc;
};

lastconf.set = (key, value, sep = separator) => {
	const pieces = key.split(sep);
	let c = config;
	while (pieces.length) {
		const piece = pieces.shift();
		if (pieces.length) {
			c[piece] = c[piece] || {};
			c = c[piece];
		} else {
			c[piece] = value;
		}
	}
	return c;
};

lastconf.loadJSON = (name, dir = configFolder) => {
	let json = {};
	const file = `${dir}/${name}.json`;
	try {
		json = require(file);
		d(`file loaded: "${file}"`);
	} catch (e) {
		if (e.code === "MODULE_NOT_FOUND") {
			return {};
		}
		// likely, syntax error is json file
		throw new ParseError(` ${e}`);
	}
	return json;
};

lastconf.loadJS = (name, dir = configFolder) => {
	let js = {};
	const file = `${dir}/${name}.js`;
	try {
		js = require(file);
		d(`file loaded: "${file}"`);
	} catch (e) {
		if (e.code === "MODULE_NOT_FOUND") {
			return {};
		}
		// syntax error in the source file, perhaphs
		throw new ParseError(` ${e}`);
	}
	return js;
};

lastconf.loadYaml = (name, dir = configFolder) => {
	let yaml = {};
	const file = `${dir}/${name}.yaml`;
	try {
		yaml = fs.readFileSync(file, "utf8");
		d(`file loaded: "${file}"`);
	} catch (e) {
		if (e.code !== "ENOENT") {
			throw e;
		}

		try {
			yaml = fs.readFileSync(`${dir}/${name}.yml`, "utf8");
		} catch (ee) {
			if (ee.code === "ENOENT") {
				return {};
			}
			throw ee;
		}
	}

	let json = {};
	try {
		json = Yaml.safeLoad(yaml);
	} catch (e) {
		return {};
	}
	return json;
};

lastconf.loadJson5 = (name, dir = configFolder) => {
	const file = `${dir}/${name}.json5`;
	let json5 = {};
	try {
		json5 = fs.readFileSync(file, "utf8");
		d(`file loaded: "${file}"`);
	} catch (e) {
		if (e.code === "ENOENT") {
			return {};
		}
	}

	let json = {};
	try {
		json = JSON5.parse(json5);
	} catch (e) {
		return {};
	}
	return json;
};

lastconf.loadIni = (name, dir = configFolder) => {
	const file = `${dir}/${name}.ini`;
	let ini = {};
	try {
		ini = fs.readFileSync(file, "utf8");
		d(`file loaded: "${file}"`);
	} catch (e) {
		if (e.code === "ENOENT") {
			return {};
		}
	}

	let json = {};
	try {
		json = INI.parse(ini);
	} catch (e) {
		return {};
	}
	return json;
};

// walks down the config and makes replacements of placeholders
lastconf.resolvePaths = (conf) => {
	Object.keys(conf).forEach((key) => {
		if (typeof (conf[key]) === "object" && conf[key]) {
			lastconf.resolvePaths(conf[key]);
		} else if (typeof (conf[key]) === "string" && conf[key].includes("%%%configFolder%%%")) {
			// eslint-disable-next-line no-param-reassign
			conf[key] = path.resolve(conf[key].replace("%%%configFolder%%%", configFolder));
		}
	});
};

lastconf.flattenKeys = (conf, sep = "__", prefix = "") => {
	let res = [];
	Object.keys(conf).forEach((key) => {
		// guard: `null` is an object, but shouldn't be descended.
		if (typeof (conf[key]) === "object" && conf[key]) {
			res = _.union(res, lastconf.flattenKeys(conf[key], sep, (prefix ? prefix + sep : "") + key.toLowerCase()));
		} else {
			res.push((prefix ? prefix + sep : "") + key.toLowerCase());
		}
	});

	return res;
};

module.exports = lastconf;
