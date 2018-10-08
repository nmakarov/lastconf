// const _ = require("underscore");
const _ = require("lodash");
const Yaml = require("js-yaml");
const JSON5 = require("json5");
const INI = require("ini");
const fs   = require('fs');
const path = require("path");

const resolve = require('path').resolve;
const dirname = require('path').dirname;

let config = {};
let options = null;
let separator = null;
let envSeparator = null;
let configFolder = null;
let isEnv = null;
let env = null;
let debug = false;

const d = (msg) => {
	if (debug) {
		console.info("[debug]", msg);
	}
};

const lastconf = function(opts, hardcoded={}) {
	return lastconf.init(opts, hardcoded);
}

lastconf.init = function(opts, hardcoded={}) {

	options = opts || {};
	debug = options.debug || false;
	separator = options.separator || ".";
	envSeparator = options.environmentSeparator || "__";
	// `options.location` might be specified as "script" or default whatever

	const location = 
		options.location === 'script' ? path.dirname(process.mainModule.filename) : "./";
	configFolder = path.resolve(location + "/" + (options.folder || "config"));
	if (debug) {
		console.info("[debug] config files will be read from", configFolder);
	}
	isEnv = !! process.env.NODE_ENV;
	env = process.env.NODE_ENV || "development";

	config = options.defaults || {};

	const checkEnv = function (allowedKeys=[]) {
		let res = {};
		Object.keys(process.env).forEach(key => {
			let k = key.toLowerCase();
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
	_.merge(config, lastconf.loadJSON("config." + env));
	_.merge(config, lastconf.loadJson5("config." + env));
	_.merge(config, lastconf.loadJS("config." + env));
	_.merge(config, lastconf.loadYaml("config." + env));
	_.merge(config, lastconf.loadIni("config." + env));
	_.merge(config, lastconf.loadJSON("config." + env + ".local"));
	_.merge(config, lastconf.loadJson5("config." + env + ".local"));
	_.merge(config, lastconf.loadJS("config." + env + ".local"));
	_.merge(config, lastconf.loadYaml("config." + env + ".local"));
	_.merge(config, lastconf.loadIni("config." + env + ".local"));

	_.merge(config, checkEnv(lastconf.flattenKeys(config, envSeparator)));

	// always last one, to allow a quick`n`durty _temporary_ override
	// of some params in the main app to test something
	_.merge(config, hardcoded);

	lastconf.resolvePaths(config);

	return lastconf;
};


lastconf.json = (root) => root ? lastconf.get(root) : config;

lastconf.get = function (key, sep, c) {
		sep = sep || separator;
		c = c || config;
		let pieces = key.split(sep);
		while(pieces.length) {
			let piece = pieces.shift();
			c = c[piece];
		}
		return c;
	};

lastconf.set = function (key, value, sep) {
		sep = sep || separator;

		let pieces = key.split(sep);
		let c = config;
		while(pieces.length) {
			let piece = pieces.shift();
			if (pieces.length) {
				c[piece] = c[piece] || {};
				c = c[piece];
			} else {
				c[piece] = value;
			}
		}
		return c;
	}

	lastconf.loadJSON = function (name, dir) {
		dir = dir || configFolder;
		let json = {};
		const file = dir + "/" + name + ".json";
		try {
			json = require(file);
			d(`file loaded: "${file}"`);
		} catch (e) {
			// console.dir(e);
			if (e.code === "MODULE_NOT_FOUND") {
				return {};
			}
			// likely, syntax error is json file
			throw " " + e;
		}
		return json;
	}

	lastconf.loadJS = function (name, dir) {
		dir = dir || configFolder;
		let js = {};
		const file = dir + "/" + name + ".js";
		try {
			js = require(file);
			d(`file loaded: "${file}"`);
		} catch (e) {
			// console.dir(e);
			if (e.code === "MODULE_NOT_FOUND") {
				return {};
			}
			console.info(`>> not caught:`, e.code);
			throw e;
		}
		return js;
	}

	lastconf.loadYaml = function (name, dir) {
		dir = dir || configFolder;
		let yaml = {};
		const file = dir + "/" + name + ".yaml";
		try {
			yaml = fs.readFileSync(file, "utf8")
			d(`file loaded: "${file}"`);
		} catch (e) {
			if (e.code !== "ENOENT") {
				throw e;
			}

			try {
				yaml = fs.readFileSync(dir + "/" + name + ".yml", "utf8")
			} catch (e) {
				if (e.code === "ENOENT") {
					return {};
				}
				throw e;
			}
		}

		let json = {};
		try {
			json = Yaml.safeLoad(yaml);
		} catch (e) {
			return {};
		}
// console.info(json);
		return json;
	}

	lastconf.loadJson5 = function (name, dir) {
		dir = dir || configFolder;
		const file = dir + "/" + name + ".json5";
		let json5 = {};
		try {
			json5 = fs.readFileSync(file, "utf8")
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
	}

	lastconf.loadIni = function (name, dir) {
		dir = dir || configFolder;
		const file = dir + "/" + name + ".ini";
		let ini = {};
		try {
			ini = fs.readFileSync(file, "utf8")
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
	}

// walks down the config and makes replacements of placeholders
lastconf.resolvePaths = function (config) {
	Object.keys(config).forEach(key => {
		if (typeof(config[key]) === "object" && config[key]) {
			lastconf.resolvePaths(config[key]);
		} else if(typeof(config[key]) === "string" && config[key].includes("%%%configFolder%%%")) {
			config[key] = path.resolve(config[key].replace("%%%configFolder%%%", configFolder));
		}
	})
}

lastconf.flattenKeys = function(config, separator="__", prefix = "") {
	let res = [];
	Object.keys(config).forEach(key => {
		// guard: `null` is an object, but shouldn't be descended.
		if (typeof(config[key]) === "object" && config[key]) {
			res = _.union(res, lastconf.flattenKeys(config[key], separator, (prefix ? prefix + separator : "") + key.toLowerCase()));
		} else {
			res.push((prefix ? prefix + separator : "") + key.toLowerCase());
		}
	});

	return res;

}

module.exports = lastconf;
