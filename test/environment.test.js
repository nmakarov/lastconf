var should = require("should");

const lastconf = require("../lastconf");

describe("Environment vars test", () => {
	let opts = {
		defaults: {
			key1: "value1",
			deep: {
				key: "value"
			}
		}
	};

	it("Ignores the unknown keys", () => {
		process.env.KEY2 = "Env. Value 2";
		const conf = lastconf(opts);
		conf.get("key1").should.be.equal("value1");
		should(conf.get("key2")).be.undefined();
	});

	it("Uses the known key", () => {
		process.env.KEY1 = "Env. Value 1";
		const conf = lastconf(opts);
		conf.get("key1").should.be.equal("Env. Value 1");
		delete(process.env.KEY1);
	});

	it("Can work with deep keys", () => {
		process.env.DEEP__KEY = "other value";
		const conf = lastconf(opts);
		conf.get("deep.key").should.be.equal("other value");
		delete(process.env.DEEP__KEY);
	});
});
