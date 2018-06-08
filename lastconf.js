// const _ = require("underscore");
const _ = require("lodash");
const Yaml = require("js-yaml");
const JSON5 = require("json5");
const INI = require("ini");
const fs   = require('fs');

module.exports = hyperconfig;

function hyperconfig(options, hardcoded={}) {
	options = options || {};

	const separator = options.separator || ".";
	const envSeparator = options.environmentSeparator || "__";
	const configFolder = options.dir || "./config";
	const isEnv = !! process.env.NODE_ENV;
	const env = process.env.NODE_ENV || "development";

	const config = options.defaults || {};

	const get = function (key, sep, c) {
		sep = sep || separator;
		c = c || config;
		let pieces = key.split(sep);
		while(pieces.length) {
			let piece = pieces.shift();
			c = c[piece];
		}
		return c;
	};

	const set = function (key, value, sep) {
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

	const checkEnv = function (allowedKeys=[]) {
		let res = {};
		Object.keys(process.env).forEach(key => {
			let k = key.toLowerCase();
			if (allowedKeys.indexOf(k) !== -1) {
				set(k, process.env[key], envSeparator);
			}
		});
		return res;
	};


	const loadJSON = function (name, dir) {
		dir = dir || configFolder;
		let json = {};
		try {
			json = require(dir + "/" + name + ".json");
		} catch (e) {
			// console.dir(e);
			if (e.code === "MODULE_NOT_FOUND") {
				return {};
			}
			console.info(`>> not caught:`, e.code);
			throw e;
		}
		return json;
	}

	const loadJS = function (name, dir) {
		dir = dir || configFolder;
		let js = {};
		try {
			js = require(dir + "/" + name + ".js");
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

	const loadYaml = function (name, dir) {
		dir = dir || configFolder;
		let yaml = {};
		try {
			yaml = fs.readFileSync(dir + "/" + name + ".yaml", "utf8")
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

	const loadJson5 = function (name, dir) {
		dir = dir || configFolder;
		let json5 = {};
		try {
			json5 = fs.readFileSync(dir + "/" + name + ".json5", "utf8")
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

	const loadIni = function (name, dir) {
		dir = dir || configFolder;
		let ini = {};
		try {
			ini = fs.readFileSync(dir + "/" + name + ".ini", "utf8")
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

	_.merge(config, loadJSON("config"));
	_.merge(config, loadJson5("config"));
	_.merge(config, loadJS("config"));
	_.merge(config, loadYaml("config"));
	_.merge(config, loadIni("config"));

	_.merge(config, loadJSON("config.local"));
	_.merge(config, loadJson5("config.local"));
	_.merge(config, loadJS("config.local"));
	_.merge(config, loadYaml("config.local"));
	_.merge(config, loadIni("config.local"));

	_.merge(config, loadJSON("config." + env));
	_.merge(config, loadJson5("config." + env));
	_.merge(config, loadJS("config." + env));
	_.merge(config, loadYaml("config." + env));
	_.merge(config, loadIni("config." + env));

	_.merge(config, loadJSON("config." + env + ".local"));
	_.merge(config, loadJson5("config." + env + ".local"));
	_.merge(config, loadJS("config." + env + ".local"));
	_.merge(config, loadYaml("config." + env + ".local"));
	_.merge(config, loadIni("config." + env + ".local"));

	_.merge(config, checkEnv(flattenKeys(config, envSeparator)));

	_.merge(config, hardcoded);

	const json = () => config;

	return {
		get, set, json, flattenKeys, loadJSON, loadJS, loadYaml, loadJson5, loadIni
	}
}

function flattenKeys(obj, separator="__", prefix = "") {
	let res = [];
	Object.keys(obj).forEach(key => {
		if (typeof(obj[key]) === "object") {
			res = _.union(res, flattenKeys(obj[key], separator, (prefix ? prefix + separator : "") + key.toLowerCase()));
		} else {
			res.push((prefix ? prefix + separator : "") + key.toLowerCase());
		}
	});

	return res;

}